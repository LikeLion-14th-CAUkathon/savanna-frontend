// 공고 상세에서 쓰는 접수 단계. 시작·마감 시각과 오늘을 비교해서 정한다.
export type ContestPhase = 'upcoming' | 'open' | 'closed';

export function getContestPhase(startAt: Date, deadlineAt: Date, today: Date): ContestPhase {
  if (today < startAt) return 'upcoming';
  if (today <= deadlineAt) return 'open';
  return 'closed';
}

export const CONTEST_PHASE_LABEL: Record<ContestPhase, string> = {
  upcoming: '접수 예정',
  open: '접수 중',
  closed: '접수 마감',
};
