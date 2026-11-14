// C01 공고 찾기 · C03 공고 상세 API 호출 + 화면용 데이터 변환
// 서버 응답(src/api/announcement)과 화면 타입(src/types/contest)이 달라서 여기서 맞춘다.

import { isAxiosError } from 'axios';
import { getAnnouncement, getAnnouncements, getRecommendations } from '../../api/announcement';
import type { AnnouncementDetailResponse, AnnouncementResponse } from '../../api/announcement';
import type { AnnouncementField, AnnouncementStatus, ApplicationMethod } from '../../api/common';
import { getMyTeams } from '../../api/team';
import type {
  Contest,
  ContestCategory,
  ContestDetail,
  ContestStatus,
  RecommendedContest,
} from '../../types/contest';

// ===== 값 변환 (서버 → 화면) =====

const CATEGORY_FROM_API: Record<AnnouncementField, ContestCategory> = {
  ACADEMIC_SCIENCE_IT: '학문·과학·IT',
  IDEA_ARCHITECTURE_STARTUP: '아이디어·건축·창업',
  ART_DESIGN_WEBTOON: '미술·디자인·웹툰',
};

// 화면에는 접수 예정 · 접수 중만 보여준다. 마감(CLOSED)은 목록에서 뺀다.
const STATUS_FROM_API: Partial<Record<AnnouncementStatus, ContestStatus>> = {
  UPCOMING: 'upcoming',
  OPEN: 'open',
};

const DAY_MS = 24 * 60 * 60 * 1000;

// 마감일('2026-11-14')까지 남은 일수. 한국 날짜 기준으로 오늘이 마감일이면 0.
const getDDay = (deadline: string, now: Date) => {
  const todayKst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return Math.round((Date.parse(deadline) - Date.parse(todayKst)) / DAY_MS);
};

// '2026-11-14' → '2026.11.14'
const toDisplayDate = (date: string) => date.replaceAll('-', '.');

const toContest = (
  item: Pick<AnnouncementResponse, 'announcementId' | 'title' | 'host' | 'field' | 'deadline'>,
  status: ContestStatus,
  now: Date,
): Contest => ({
  id: item.announcementId,
  title: item.title,
  host: item.host,
  category: CATEGORY_FROM_API[item.field],
  deadline: toDisplayDate(item.deadline),
  dDay: getDDay(item.deadline, now),
  status,
});

// ===== API =====

// 목록 API는 페이지 단위라, 마지막 페이지까지 이어서 받아 한 번에 돌려준다.
// TODO: 공고가 많아지면 무한 스크롤 + 서버 검색(keyword · field · status)으로 바꾼다.
const PAGE_SIZE = 50;

async function fetchAllByStatus(status: AnnouncementStatus) {
  const items: AnnouncementResponse[] = [];
  for (let page = 0; ; page += 1) {
    const result = await getAnnouncements({ status, page, size: PAGE_SIZE });
    items.push(...result.content);
    if (result.last || result.content.length === 0) return items;
  }
}

/** 접수 예정 · 접수 중 공고 전체. 검색 · 필터는 화면에서 한다. */
export async function fetchContests(): Promise<Contest[]> {
  const now = new Date();
  // 목록 응답에는 접수 상태가 없어서, 상태별로 나눠 받아 서버 기준 상태를 붙인다.
  const [upcoming, open] = await Promise.all([fetchAllByStatus('UPCOMING'), fetchAllByStatus('OPEN')]);
  return [
    ...upcoming.map((item) => toContest(item, 'upcoming', now)),
    ...open.map((item) => toContest(item, 'open', now)),
  ];
}

/** 우리 팀 AI 추천 공고 (점수순). 소속 팀이 없으면 빈 목록. */
export async function fetchRecommendedContests(): Promise<RecommendedContest[]> {
  const teams = await getMyTeams();
  // TODO: 팀 전환 기능이 생기면 선택한 팀으로. 지금은 오아시스처럼 첫 번째 팀
  const team = teams[0];
  if (!team) return [];

  const now = new Date();
  const recommendations = await getRecommendations(team.teamId);
  return recommendations.flatMap((item) => {
    const status = STATUS_FROM_API[item.status];
    return status ? [{ ...toContest(item, status, now), reason: item.reason }] : [];
  });
}

// ===== C03 공고 상세 =====

// 지원 방법 안내 문구가 없을 때 접수 방식만이라도 보여준다. 기타는 비워서 줄을 숨긴다.
const METHOD_LABEL: Record<ApplicationMethod, string> = {
  WEB: '온라인 접수',
  EMAIL: '이메일 접수',
  OTHER: '',
};

// 서버 값이 비어 있거나 null이면 빈 문자열 → 화면에서 그 줄을 숨긴다.
const text = (value: string | null | undefined) => value?.trim() ?? '';

// 최소 · 최대 인원 → '2~5명' / '3명' / '2명 이상' / '5명 이하'
const toTeamSize = (min: number | null, max: number | null) => {
  if (min && max) return min === max ? `${min}명` : `${min}~${max}명`;
  if (min) return `${min}명 이상`;
  if (max) return `${max}명 이하`;
  return '';
};

const toContestDetail = (item: AnnouncementDetailResponse): ContestDetail => ({
  id: item.announcementId,
  title: item.title,
  host: item.host,
  startAt: item.applicationStartsAt,
  // 서버는 마감 날짜만 준다. 그날 끝까지 접수 가능하도록 23:59:59(한국 시간)로
  deadlineAt: `${item.deadline}T23:59:59+09:00`,
  sourceUrl: text(item.sourceUrl) || text(item.applyUrl),
  eligibility: {
    target: text(item.enrollmentRequirement),
    teamSize: toTeamSize(item.minMembers, item.maxMembers),
    region: text(item.participationRegion) || text(item.region),
  },
  overview: {
    topic: text(item.theme),
    criteria: text(item.evaluationCriteria),
  },
  application: {
    method: text(item.applicationInstructions) || METHOD_LABEL[item.applicationMethod] || '',
    // 제출물은 한 줄에 하나씩 온다고 보고 줄바꿈으로 나눈다.
    submissions: text(item.submissionRequirements)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    form: text(item.formNote),
    consent: '', // 동의서 정보는 API에 없다
  },
});

/** 공고 상세. 없는 공고(404)면 null */
export async function fetchContestDetail(announcementId: number): Promise<ContestDetail | null> {
  try {
    return toContestDetail(await getAnnouncement(announcementId));
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
