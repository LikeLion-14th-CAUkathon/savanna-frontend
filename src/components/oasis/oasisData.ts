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
import {
  getProposalNotifications,
  getReceivedProposals,
  getSentProposals,
  respondToProposal,
} from '../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../api/team';
import { getMyInfo } from '../../api/user';
import type { ExpeditionStage, OasisHome } from '../../types/oasis';
import type {
  ChecklistItem,
  ConditionIssue,
  ExpeditionDetail,
  ExpeditionNotice,
  MemberResponse,
  MyResponse,
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

/** 실패해도 화면은 보여줄 요청의 결과 꺼내기 (실패하면 value) */
const fallback = <T>(result: PromiseSettledResult<T>, value: T) =>
  result.status === 'fulfilled' ? result.value : value;

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

  // 내가 합류한 원정 = 내가 제안을 보낸 원정 + 받은 제안에 '합류'로 응답한 원정
  // 둘 다 못 불러오면 판단할 수 없으니 모든 원정을 일반 표지판으로 보여준다
  // 원정마다 제안자를 확인하려고 제안 정보도 함께 불러온다 (원정은 팀당 최대 6개)
  const [sentResult, receivedResult, ...proposalResults] = await Promise.allSettled([
    getSentProposals(),
    getReceivedProposals(),
    ...expeditions.map((expedition) => getExpeditionProposals(expedition.expeditionId)),
  ]);
  const canCheckJoined = sentResult.status === 'fulfilled' || receivedResult.status === 'fulfilled';

  // 서버의 joinedCount는 제안자를 빼고 센다. 제안자가 지금도 팀원이면 1명을 더한다
  // (제안 정보를 못 불러오면 확인할 수 없으니 팀원으로 보고 더함)
  const memberIds = new Set(detail.members.map((member) => member.userId));
  const senderStillInTeam = (index: number) => {
    const result = proposalResults[index];
    if (result.status !== 'fulfilled') return true;
    return result.value.some((proposal) => memberIds.has(proposal.senderId));
  };
  const joinedExpeditionIds = new Set([
    ...fallback(sentResult, []).map((proposal) => proposal.expeditionId),
    ...fallback(receivedResult, [])
      .filter((proposal) => proposal.status === 'JOINED')
      .map((proposal) => proposal.expeditionId),
  ]);

  return {
    teamId: team.teamId,
    teamName: detail.name,
    memberCount: detail.members.length,
    hasNewTeamNews: notification.hasUnread,
    expeditions: expeditions.map((expedition, index) => ({
      id: expedition.expeditionId,
      contestTitle: expedition.title,
      deadline: deadlineToIso(expedition.deadline),
      stage: STAGE_FROM_API[expedition.stage],
      participantCount: expedition.joinedCount + (senderStillInTeam(index) ? 1 : 0),
      isResting: canCheckJoined && !joinedExpeditionIds.has(expedition.expeditionId),
    })),
  };
}

// ===== D02 원정 상세 =====

export async function fetchExpeditionDetail(expeditionId: number): Promise<ExpeditionDetail> {
  const [expedition, tasks, checklist] = await Promise.all([
    getExpedition(expeditionId),
    getExpeditionTasks(expeditionId),
    getExpeditionChecklists(expeditionId),
  ]);
  const { announcement } = expedition;

  // 아래는 실패해도 화면은 보여준다 (빈 값으로 대체)
  const [announcementResult, eligibilityResult, proposalsResult, meResult, teamResult] = await Promise.allSettled([
    getAnnouncement(announcement.announcementId),
    checkEligibility(announcement.announcementId, expedition.teamId),
    getExpeditionProposals(expeditionId),
    getMyInfo(),
    getTeamDetail(expedition.teamId),
  ]);
  const announcementDetail = fallback(announcementResult, null);
  const eligibility = fallback(eligibilityResult, null);
  const proposals = fallback(proposalsResult, []);
  const myUserId = fallback(meResult, null)?.userId;
  // 지금 팀원 (못 불러오면 null → 제안자를 팀원으로 보고 표시)
  const memberIds = teamResult.status === 'fulfilled' ? new Set(teamResult.value.members.map((m) => m.userId)) : null;

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
  // 제안자는 받는 사람 목록에 없어서 직접 맨 앞에 '합류'로 넣는다 (팀을 탈퇴한 제안자는 빼고)
  const responses: MemberResponse[] = [];
  const seen = new Set<number>();
  const addResponse = (userId: number, name: string, status: ResponseStatus) => {
    if (seen.has(userId)) return;
    seen.add(userId);
    responses.push({ memberId: userId, name, isMe: userId === myUserId, status });
  };
  [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((proposal) => {
      if (!memberIds || memberIds.has(proposal.senderId)) {
        addResponse(proposal.senderId, proposal.senderName, 'JOINED');
      }
      proposal.recipients.forEach((recipient) =>
        addResponse(recipient.userId, recipient.name, RESPONSE_STATUS[recipient.status]),
      );
    });

  // 내 응답: 제안자 → 받은 제안 기록 → 둘 다 없으면 제안 뒤에 합류한 팀원(NONE)
  // 나 또는 제안 정보를 못 불러오면 판단할 수 없어 null (응답 버튼 숨김)
  let myResponse: MyResponse | null = null;
  if (myUserId !== undefined && proposalsResult.status === 'fulfilled') {
    const latest = [...proposals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const myRecipient = latest.flatMap((proposal) => proposal.recipients).find((r) => r.userId === myUserId);
    if (proposals.some((proposal) => proposal.senderId === myUserId)) {
      myResponse = { status: 'SENDER', proposalRecipientId: null };
    } else if (myRecipient) {
      myResponse = {
        status: RESPONSE_STATUS[myRecipient.status],
        proposalRecipientId: myRecipient.proposalRecipientId,
      };
    } else {
      myResponse = { status: 'NONE', proposalRecipientId: null };
    }
  }

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
    myResponse,
  };
}

/** 원정 합류 · 쉬어가기 응답 */
export const respondToExpedition = (proposalRecipientId: number, joined: boolean) =>
  respondToProposal(proposalRecipientId, { status: joined ? 'JOINED' : 'DECLINED' });

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
