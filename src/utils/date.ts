// 날짜는 한국 시간 기준으로 표시
const KST_PARTS = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const getKstParts = (iso: string) => {
  const parts = KST_PARTS.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
};

// '2026.11.14 18:00 KST'
export function formatDateTimeKST(iso: string) {
  const { year, month, day, hour, minute } = getKstParts(iso);
  return `${year}.${month}.${day} ${hour}:${minute} KST`;
}

// '11.14'
export function formatMonthDay(iso: string) {
  const { month, day } = getKstParts(iso);
  return `${month}.${day}`;
}
