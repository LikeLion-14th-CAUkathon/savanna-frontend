import type { Contest, ContestDetail, RecommendedContest } from '../types/contest';

// API 명세가 나오기 전까지 쓰는 목업 데이터 (피그마 C01 시안 기준)

const CONTESTS: Contest[] = [
  {
    id: 1,
    title: '청년 사회문제 해결 해커톤',
    host: '해커톤협회',
    category: '학문·과학·IT',
    deadline: '2026.11.05',
    dDay: 5,
    status: 'open',
  },
  {
    id: 2,
    title: '오픈데이터 앱 디자인 챌린지',
    host: '오픈데이터진흥원',
    category: '미술·디자인·웹툰',
    deadline: '2026.11.08',
    dDay: 8,
    status: 'open',
  },
  {
    id: 3,
    title: '서울 청년 현장 아이디어톤',
    host: '서울청년센터',
    category: '아이디어·건축·창업',
    deadline: '2026.11.10',
    dDay: 10,
    status: 'open',
  },
  {
    id: 4,
    title: '헬스케어 AI 아이디어 공모전',
    host: '디지털헬스진흥원',
    category: '학문·과학·IT',
    deadline: '2026.11.14',
    dDay: 14,
    status: 'open',
  },
  {
    id: 5,
    title: '대학생 서비스 기획 경진대회',
    host: '한국대학연합',
    category: '아이디어·건축·창업',
    deadline: '2026.11.21',
    dDay: 21,
    status: 'upcoming',
  },
];

const RECOMMENDED_CONTESTS: RecommendedContest[] = [
  { ...CONTESTS[0], reason: '수면 기록으로 생활 문제를 해결하는 프로젝트와 주제가 비슷해요.' },
  { ...CONTESTS[3], reason: 'AI 수면 코칭이 공모 분야(건강 관리)와 잘 맞아요.' },
  { ...CONTESTS[2], reason: '팀원 모두 서울에서 활동해 오프라인 발표가 가능해요.' },
];

const MOCK_DELAY_MS = 300;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY_MS));
}

export function fetchContests(): Promise<Contest[]> {
  return delay(CONTESTS);
}

export function fetchRecommendedContests(): Promise<RecommendedContest[]> {
  return delay(RECOMMENDED_CONTESTS);
}

// ---- C03 공고 상세 ----

// 목업 날짜가 시안(오늘 10.31) 기준이라 '오늘'도 고정한다. API 연결 시 new Date()로 교체.
export const MOCK_TODAY = new Date('2026-10-31T12:00:00+09:00');

// 시안의 상세 내용을 공통으로 쓰고, 공고마다 다른 값만 덮어쓴다.
const SAMPLE_DETAIL: Omit<ContestDetail, 'id' | 'title' | 'host' | 'startAt' | 'deadlineAt'> = {
  sourceUrl: 'https://example.com',
  eligibility: {
    target: '대학생·청년 팀',
    teamSize: '2-5명',
    region: '온라인 · 서울 현장 발표',
  },
  overview: {
    topic: '생활 속 문제를 해결하는 아이디어',
    criteria: '문제 정의·실현 가능성·완성도',
  },
  application: {
    method: '주최 측 접수 페이지에서 온라인 제출',
    submissions: ['아이디어 기획서 PDF(10쪽 이내)', '참가 신청서'],
    form: '주최 측 지정 양식 사용',
    consent: '개인정보 수집·이용 동의서 · 팀원 전원 서명',
  },
};

const DEADLINE_TIME = 'T18:00:00+09:00';

const CONTEST_DETAILS: ContestDetail[] = [
  ...CONTESTS.map((contest) => ({
    ...SAMPLE_DETAIL,
    id: contest.id,
    title: contest.title,
    host: contest.host,
    // 접수 예정 공고는 시작일이 오늘 이후
    startAt: contest.status === 'upcoming' ? '2026-11-03T00:00:00+09:00' : '2026-10-15T00:00:00+09:00',
    deadlineAt: contest.deadline.replaceAll('.', '-') + DEADLINE_TIME,
  })),
  // 마감된 공고 (시안 'C03 · 마감')
  {
    ...SAMPLE_DETAIL,
    id: 6,
    title: '2026 대학생 아이디어 공모전',
    host: '한국청년재단',
    startAt: '2026-10-01T00:00:00+09:00',
    deadlineAt: '2026-10-30' + DEADLINE_TIME,
  },
];

// 없는 id면 null
export function fetchContestDetail(id: number): Promise<ContestDetail | null> {
  return delay(CONTEST_DETAILS.find((detail) => detail.id === id) ?? null);
}
