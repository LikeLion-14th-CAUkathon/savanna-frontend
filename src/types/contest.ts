// 화면 표시용 공고 타입.
// API 명세가 확정되면 응답 타입은 따로 정의하고, 여기에 맞게 변환해서 쓴다.

export type ContestStatus = 'open' | 'upcoming';

export interface Contest {
  id: number;
  title: string;
  host: string;        // 주최 기관
  category: string;    // 분야 (예: 개발·해커톤)
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

// 마감이 이 일수 이하로 남으면 '임박'으로 강조한다.
export const URGENT_DDAY = 7;
