const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// 마감 일시를 'D-5' / 'D-DAY' / '마감' 으로 표시
export function formatDDay(deadline: string, now: Date = new Date()) {
  const deadlineDate = new Date(deadline);

  if (deadlineDate.getTime() < now.getTime()) return '마감';

  const daysLeft = Math.round((startOfDay(deadlineDate) - startOfDay(now)) / DAY_MS);
  return daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`;
}

export function isPastDeadline(deadline: string, now: Date = new Date()) {
  return new Date(deadline).getTime() < now.getTime();
}
