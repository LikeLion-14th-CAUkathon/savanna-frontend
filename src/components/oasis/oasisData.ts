// D 영역(오아시스·원정 상세·일정 편집) API 호출 + 화면용 데이터 변환
// 서버 응답(src/api)과 화면 타입(src/types/oasis, expedition)이 달라서 여기서 맞춘다.

import { getAnnouncement, checkEligibility } from '../../api/announcement';
import type { ExpeditionStage as ApiStage, ProposalStatus } from '../../api/common';
import {
  changeExpeditionStage,
  getExpedition,
  getExpeditionProposals,
  getTeamExpeditions,
  updateExpeditionSchedule,
} from '../../api/expedition';
import type { ExpeditionResponse } from '../../api/expedition';
import {
  createExpeditionChecklist,
  deleteExpeditionChecklist,
  getExpeditionChecklists,
  updateExpeditionChecklist,
} from '../../api/expeditionChecklist';
import type { ExpeditionChecklistResponse } from '../../api/expeditionChecklist';
import {
  createExpeditionTask,
  deleteExpeditionTask,
  getExpeditionTasks,
  updateExpeditionTask,
} from '../../api/expeditionTask';
import type { ExpeditionTaskResponse } from '../../api/expeditionTask';
import { getProposalNotifications } from '../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../api/team';
import { getMyInfo } from '../../api/user';
import type { ExpeditionStage, OasisHome } from '../../types/oasis';
import type {
  ChecklistItem,
  ConditionIssue,
  ExpeditionDetail,
  ExpeditionNotice,
  MemberResponse,
  ResponseStatus,
  ScheduleEditData,
  StageTarget,
} from '../../types/expedition';
import { fromDateInputValue, toDateInputValue } from '../../utils/date';

// ===== 진행 단계 변환 (화면 ↔ 서버) =====

const STAGE_FROM_API: Record<ApiStage, ExpeditionStage> = {
  KICKOFF: 'KICKOFF',
  DRAFT: 'DRAFT',
  REVIEW: 'FINAL_REVIEW',
  SUBMITTED: 'SUBMIT',
};

const STAGE_TO_API: Record<ExpeditionStage, ApiStage> = {
  KICKOFF: 'KICKOFF',
  DRAFT: 'DRAFT',
  FINAL_REVIEW: 'REVIEW',
  SUBMIT: 'SUBMITTED',
};

// ===== 날짜 변환 =====
// 서버는 날짜만('2026-11-14') 준다. 화면은 ISO 문자열을 쓰므로 한국 시간 기준으로 바꾼다.

/** 마감일은 그날 끝까지 유효하도록 23:59:59로 */
const deadlineToIso = (date: string) => `${date}T23:59:59+09:00`;

/** 목표일은 그날 자정으로 */
const dateToIso = (date: string | null) => (date ? fromDateInputValue(date) : null);

/** 화면 ISO → 서버 날짜 'YYYY-MM-DD' */
const isoToDate = (iso: string) => toDateInputValue(iso);

// ===== 공통 변환 =====

const toStageTargets = (expedition: ExpeditionResponse): StageTarget[] => [
  { stage: 'KICKOFF', targetDate: dateToIso(expedition.kickoffDate) },
  { stage: 'DRAFT', targetDate: dateToIso(expedition.draftDate) },
  { stage: 'FINAL_REVIEW', targetDate: dateToIso(expedition.reviewDate) },
  { stage: 'SUBMIT', targetDate: dateToIso(expedition.submitTargetDate) },
];

const toNotice = (task: ExpeditionTaskResponse): ExpeditionNotice => ({ id: task.taskId, content: task.title });

const toChecklistItem = (item: ExpeditionChecklistResponse): ChecklistItem => ({
  id: item.checklistId,
  content: item.title,
  done: item.isChecked,
});

const RESPONSE_STATUS: Record<ProposalStatus, ResponseStatus> = {
  JOINED: 'JOINED',
  DECLINED: 'RESTING',
  PENDING: 'PENDING',
};

// ===== D01 오아시스 =====

/** 소속 팀이 없으면 null */
export async function fetchOasisHome(): Promise<OasisHome | null> {
  const teams = await getMyTeams();
  // TODO: 팀 전환 기능이 생기면 선택한 팀으로. 지금은 첫 번째 팀
  const team = teams[0];
  if (!team) return null;

  const [detail, expeditions, notification] = await Promise.all([
    getTeamDetail(team.teamId),
    getTeamExpeditions(team.teamId),
    getProposalNotifications(),
  ]);

  return {
    teamId: team.teamId,
    teamName: detail.name,
    memberCount: detail.members.length,
    hasNewTeamNews: notification.hasUnread,
    expeditions: expeditions.map((expedition) => ({
      id: expedition.expeditionId,
      contestTitle: expedition.title,
      deadline: deadlineToIso(expedition.deadline),
      stage: STAGE_FROM_API[expedition.stage],
      participantCount: expedition.joinedCount,
    })),
  };
}

// ===== D02 원정 상세 =====

const fallback = <T>(result: PromiseSettledResult<T>, value: T) =>
  result.status === 'fulfilled' ? result.value : value;

export async function fetchExpeditionDetail(expeditionId: number): Promise<ExpeditionDetail> {
  const [expedition, tasks, checklist] = await Promise.all([
    getExpedition(expeditionId),
    getExpeditionTasks(expeditionId),
    getExpeditionChecklists(expeditionId),
  ]);
  const { announcement } = expedition;

  // 아래는 실패해도 화면은 보여준다 (빈 값으로 대체)
  const [announcementResult, eligibilityResult, proposalsResult, meResult] = await Promise.allSettled([
    getAnnouncement(announcement.announcementId),
    checkEligibility(announcement.announcementId, expedition.teamId),
    getExpeditionProposals(expeditionId),
    getMyInfo(),
  ]);
  const announcementDetail = fallback(announcementResult, null);
  const eligibility = fallback(eligibilityResult, null);
  const proposals = fallback(proposalsResult, []);
  const myUserId = fallback(meResult, null)?.userId;

  // 충족하지 않은 조건만 표시 (불일치 / 팀 정보 확인 필요)
  const conditionIssues: ConditionIssue[] = (eligibility?.conditions ?? [])
    .filter((condition) => condition.status !== 'SATISFIED')
    .map((condition, index) => ({
      id: index,
      type: condition.status === 'MISMATCH' ? 'MISMATCH' : 'NEEDS_CHECK',
      message: condition.message,
      members: [], // 서버가 팀원별 판정을 주지 않음
    }));

  // 제안이 여러 번이면 최신 제안의 응답을 우선 (같은 사람은 한 번만)
  const responses: MemberResponse[] = [];
  const seen = new Set<number>();
  [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((proposal) =>
      proposal.recipients.forEach((recipient) => {
        if (seen.has(recipient.userId)) return;
        seen.add(recipient.userId);
        responses.push({
          memberId: recipient.userId,
          name: recipient.name,
          isMe: recipient.userId === myUserId,
          status: RESPONSE_STATUS[recipient.status],
        });
      }),
    );

  return {
    id: expedition.expeditionId,
    contestTitle: announcement.title,
    organizer: announcement.host,
    deadline: deadlineToIso(announcement.deadline),
    contestUrl: announcementDetail?.sourceUrl || announcementDetail?.applyUrl || '',
    stage: STAGE_FROM_API[expedition.stage],
    isContestInfoOutdated: false, // 서버에 해당 값 없음
    conditionIssues,
    responses,
    stageTargets: toStageTargets(expedition),
    notices: tasks.map(toNotice),
    checklist: checklist.items.map(toChecklistItem),
  };
}

export const saveStage = (expeditionId: number, stage: ExpeditionStage) =>
  changeExpeditionStage(expeditionId, { stage: STAGE_TO_API[stage] });

export const toggleChecklistItem = (checklistId: number, done: boolean) =>
  updateExpeditionChecklist(checklistId, { isChecked: done });

export const renameChecklistItem = (checklistId: number, content: string) =>
  updateExpeditionChecklist(checklistId, { title: content });

export const removeChecklistItem = (checklistId: number) => deleteExpeditionChecklist(checklistId);

export const addChecklistItem = async (expeditionId: number, content: string) =>
  toChecklistItem(await createExpeditionChecklist(expeditionId, { title: content }));

// ===== D03 일정 & 준비사항 편집 =====

export async function fetchScheduleEdit(expeditionId: number): Promise<ScheduleEditData> {
  const [expedition, tasks] = await Promise.all([getExpedition(expeditionId), getExpeditionTasks(expeditionId)]);
  const { announcement } = expedition;

  return {
    expeditionId: expedition.expeditionId,
    contestTitle: announcement.title,
    applyStartAt: announcement.applicationStartsAt ?? null,
    deadline: deadlineToIso(announcement.deadline),
    stage: STAGE_FROM_API[expedition.stage],
    stageTargets: toStageTargets(expedition),
    notices: tasks.map(toNotice),
  };
}

/** 목표일 저장. 서버는 null을 '기존 값 유지'로 처리하므로 날짜가 있는 단계만 보낸다 */
export async function saveStageTargets(expeditionId: number, targets: StageTarget[]) {
  const dateOf = (stage: ExpeditionStage) => {
    const iso = targets.find((target) => target.stage === stage)?.targetDate;
    return iso ? isoToDate(iso) : undefined;
  };
  await updateExpeditionSchedule(expeditionId, {
    kickoffDate: dateOf('KICKOFF'),
    draftDate: dateOf('DRAFT'),
    reviewDate: dateOf('FINAL_REVIEW'),
    submitTargetDate: dateOf('SUBMIT'),
  });
}

/**
 * 공지 추가. 서버는 날짜(dueDate)가 필수인데 화면은 내용만 입력받으므로 오늘 날짜로 보낸다.
 * TODO: 공지에 날짜 입력이 생기면 그 값으로 교체
 */
export const addNotice = async (expeditionId: number, content: string) => {
  const today = isoToDate(new Date().toISOString());
  return toNotice(await createExpeditionTask(expeditionId, { title: content, dueDate: today }));
};

export const updateNotice = (taskId: number, content: string) => updateExpeditionTask(taskId, { title: content });

export const removeNotice = (taskId: number) => deleteExpeditionTask(taskId);
