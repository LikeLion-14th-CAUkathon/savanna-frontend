// 화면 표시용 공고 타입.
// API 명세가 확정되면 응답 타입은 따로 정의하고, 여기에 맞게 변환해서 쓴다.

export type ContestStatus = 'open' | 'upcoming';

// 공고 분야 (C02 공고 필터의 '분야' 칩 순서)
export const CONTEST_CATEGORIES = [
  '아이디어·기획',
  '개발·해커톤',
  '디자인',
  'AI·헬스케어',
  '사회·ESG',
] as const;

export type ContestCategory = (typeof CONTEST_CATEGORIES)[number];

export interface Contest {
  id: number;
  title: string;
  host: string;              // 주최 기관
  category: ContestCategory; // 분야
  deadline: string;    // 표시용 마감일 (예: 2026.11.05)
  dDay: number;        // 마감까지 남은 일수
  status: ContestStatus;
}

export interface RecommendedContest extends Contest {
  reason: string;      // AI 추천 이유
}

export const CONTEST_STATUS_LABEL: Record<ContestStatus, string> = {
  open: '접수 중',
  upcoming: '접수 예정',
};

// C02 공고 필터의 '접수 상태' 칩 순서
export const CONTEST_STATUSES: ContestStatus[] = ['upcoming', 'open'];

// 공고 필터에서 고른 조건. 비어 있으면 전체.
export interface ContestFilters {
  categories: ContestCategory[];
  statuses: ContestStatus[];
}

export const EMPTY_CONTEST_FILTERS: ContestFilters = { categories: [], statuses: [] };

// 마감이 이 일수 이하로 남으면 '임박'으로 강조한다.
export const URGENT_DDAY = 7;

// C03 공고 상세에서 쓰는 정보
export interface ContestDetail {
  id: number;
  title: string;
  host: string;
  startAt: string;     // 접수 시작 (ISO, 예: 2026-10-15T00:00:00+09:00)
  deadlineAt: string;  // 접수 마감 (ISO)
  sourceUrl: string;   // 공고 원문 링크
  eligibility: {
    target: string;    // 참가 대상
    teamSize: string;  // 인원
    region: string;    // 지역
  };
  overview: {
    topic: string;     // 공모 주제
    criteria: string;  // 심사기준
  };
  application: {
    method: string;          // 지원 방법
    submissions: string[];   // 제출물
    form: string;            // 양식
    consent: string;         // 동의서
  };
}
