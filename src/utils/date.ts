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

// '2026.11.14 18:00'
export function formatDateTime(iso: string) {
  const { year, month, day, hour, minute } = getKstParts(iso);
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

// '2026.11.14 18:00 KST'
export function formatDateTimeKST(iso: string) {
  return `${formatDateTime(iso)} KST`;
}

// '11.14'
export function formatMonthDay(iso: string) {
  const { month, day } = getKstParts(iso);
  return `${month}.${day}`;
}

// '11.14 18:00'
export function formatMonthDayTime(iso: string) {
  const { month, day, hour, minute } = getKstParts(iso);
  return `${month}.${day} ${hour}:${minute}`;
}

// 날짜 입력칸(<input type="date">) 값 'YYYY-MM-DD'로 바꾸기
export function toDateInputValue(iso: string) {
  const { year, month, day } = getKstParts(iso);
  return `${year}-${month}-${day}`;
}

// 날짜 입력칸 값 'YYYY-MM-DD' → 한국 시간 자정 기준 ISO 문자열
export function fromDateInputValue(value: string) {
  return `${value}T00:00:00+09:00`;
}

const KST_WEEKDAY = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', weekday: 'short' });

// '11.10(화)'
export function formatMonthDayWeekday(iso: string) {
  return `${formatMonthDay(iso)}(${KST_WEEKDAY.format(new Date(iso))})`;
}

// '18:00'
export function formatTime(iso: string) {
  const { hour, minute } = getKstParts(iso);
  return `${hour}:${minute}`;
}

// 시각은 무시하고 한국 날짜만으로 며칠 차이인지 (to - from)
export function diffCalendarDays(fromIso: string, toIso: string) {
  const toDayIndex = (iso: string) => {
    const { year, month, day } = getKstParts(iso);
    return Date.UTC(Number(year), Number(month) - 1, Number(day)) / (24 * 60 * 60 * 1000);
  };
  return toDayIndex(toIso) - toDayIndex(fromIso);
}
