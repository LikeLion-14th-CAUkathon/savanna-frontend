import { useState } from 'react';
import styled, { css } from 'styled-components';
import BottomSheet from '../../common/BottomSheet';

// 날짜는 모두 한국 날짜 'YYYY-MM-DD' 문자열로 다룬다 (문자열 비교 = 날짜 비교)

interface CalendarSheetProps {
  title: string;            // 예: '초안 작성 목표일'
  value: string | null;     // 선택된 날짜
  today: string;
  deadline: string;         // 접수 마감일
  minDate: string | null;   // 이보다 이전은 고를 수 없음 (앞 단계 목표일)
  maxDate: string;          // 이보다 이후는 고를 수 없음 (뒤 단계 목표일 또는 접수 마감일)
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 접수 마감일 배경 (주황 #e8722a를 연하게)
const DEADLINE_BG = '#fde6d4';

const pad = (value: number) => String(value).padStart(2, '0');
const toKey = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const parseKey = (key: string) => ({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 });
const formatShort = (key: string) => `${key.slice(5, 7)}.${key.slice(8, 10)}`;

// 일요일부터 시작하는 한 달 칸 (앞쪽 빈칸은 null)
const buildMonth = (year: number, month: number) => {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => toKey(year, month, index + 1)),
  ];
};

// D03 · 목표일 달력 (오늘 · 접수 마감일 표시, 순서가 어긋나거나 마감 이후인 날은 선택 불가)
export default function CalendarSheet({
  title,
  value,
  today,
  deadline,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: CalendarSheetProps) {
  // 처음 보여줄 달: 선택된 날짜 → 오늘(고를 수 있는 범위 안이면) → 고를 수 있는 마지막 날
  const [view, setView] = useState(() => parseKey(value ?? (today <= maxDate ? today : maxDate)));
  const days = buildMonth(view.year, view.month);

  const moveMonth = (offset: number) =>
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + offset, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });

  const isDisabled = (key: string) => (minDate !== null && key < minDate) || key > maxDate;
  const rangeText = minDate
    ? `${formatShort(minDate)} ~ ${formatShort(maxDate)} 사이에서 고를 수 있어요.`
    : `${formatShort(maxDate)}까지 고를 수 있어요.`;

  return (
    <BottomSheet title={title} description={rangeText} onClose={onClose}>
      <Calendar>
        <MonthBar>
          <MonthButton type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>
            ‹
          </MonthButton>
          <MonthTitle aria-live="polite">
            {view.year}년 {view.month + 1}월
          </MonthTitle>
          <MonthButton type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>
            ›
          </MonthButton>
        </MonthBar>

        <Grid role="grid" aria-label={`${view.year}년 ${view.month + 1}월`}>
          {WEEKDAYS.map((weekday) => (
            <Weekday key={weekday} aria-hidden="true">
              {weekday}
            </Weekday>
          ))}
          {days.map((key, index) =>
            key === null ? (
              <span key={`blank-${index}`} />
            ) : (
              <DayButton
                key={key}
                type="button"
                disabled={isDisabled(key)}
                aria-pressed={key === value}
                aria-label={`${Number(key.slice(5, 7))}월 ${Number(key.slice(8, 10))}일${key === today ? ', 오늘' : ''}${
                  key === deadline ? ', 접수 마감' : ''
                }`}
                $selected={key === value}
                $today={key === today}
                $deadline={key === deadline}
                onClick={() => onSelect(key)}
              >
                {Number(key.slice(8, 10))}
                {key === deadline && <DeadlineMark aria-hidden="true">마감</DeadlineMark>}
              </DayButton>
            ),
          )}
        </Grid>

        <Legend aria-hidden="true">
          <LegendItem>
            <TodaySwatch />
            오늘
          </LegendItem>
          <LegendItem>
            <DeadlineSwatch />
            접수 마감
          </LegendItem>
        </Legend>
      </Calendar>
    </BottomSheet>
  );
}

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MonthBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MonthTitle = styled.p`
  margin: 0;
  color: var(--color-ink);
  font-size: 17px;
  font-weight: 700;
`;

const MonthButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
  color: var(--color-ink);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  justify-items: center;
`;

const Weekday = styled.span`
  padding-bottom: 4px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 700;
`;

const DayButton = styled.button<{ $selected: boolean; $today: boolean; $deadline: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1.5px solid transparent;
  border-radius: 20px;
  background: transparent;
  color: var(--color-ink);
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    color: #c4c3c0;
    cursor: not-allowed;
  }

  /* 마감일은 고를 수 없는 범위여도 항상 주황으로 표시 */
  ${({ $deadline }) =>
    $deadline &&
    css`
      &,
      &:disabled {
        background: ${DEADLINE_BG};
        color: var(--color-brand);
        font-weight: 700;
      }
    `}

  ${({ $today }) =>
    $today &&
    css`
      border-color: var(--color-brand);
      color: var(--color-brand);
      font-weight: 700;
    `}

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: transparent;
      background: var(--color-amber);
      box-shadow: 0 2px 0 var(--color-amber-shadow);
      color: var(--color-ink);
      font-weight: 700;
    `}

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

const DeadlineMark = styled.span`
  margin-top: 2px;
  font-size: 9px;
  font-weight: 700;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-secondary);
  font-size: 12px;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const swatch = css`
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border-radius: 6px;
`;

const TodaySwatch = styled.span`
  ${swatch}
  border: 1.5px solid var(--color-brand);
`;

const DeadlineSwatch = styled.span`
  ${swatch}
  background: ${DEADLINE_BG};
`;
