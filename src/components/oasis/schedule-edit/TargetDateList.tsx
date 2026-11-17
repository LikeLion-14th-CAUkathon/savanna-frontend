import { useState } from 'react';
import styled from 'styled-components';
import StatusPill from '../detail/StatusPill';
import type { PillTone } from '../detail/StatusPill';
import CalendarSheet from './CalendarSheet';
import { EXPEDITION_STAGE_LABEL } from '../../../types/oasis';
import type { ExpeditionStage } from '../../../types/oasis';
import type { StageTarget } from '../../../types/expedition';
import { formatMonthDay, fromDateInputValue, toDateInputValue } from '../../../utils/date';

const STAGE_ORDER: ExpeditionStage[] = ['KICKOFF', 'DRAFT', 'FINAL_REVIEW', 'SUBMIT'];

const STATE_PILL: Record<'done' | 'current' | 'todo', { label: string; tone: PillTone }> = {
  done: { label: '완료', tone: 'green' },
  current: { label: '현재 단계', tone: 'amber' },
  todo: { label: '예정', tone: 'gray' },
};

interface TargetDateListProps {
  currentStage: ExpeditionStage;
  targets: StageTarget[];
  deadline: string; // 접수 마감 (ISO 8601). 목표일은 이 날까지만 고를 수 있음
  onChange: (stage: ExpeditionStage, targetDate: string | null) => void;
}

// D03 · 팀 준비 단계별 목표일 입력 (날짜 칸을 누르면 달력이 열림)
export default function TargetDateList({ currentStage, targets, deadline, onChange }: TargetDateListProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const [openStage, setOpenStage] = useState<ExpeditionStage | null>(null);

  // 달력은 한국 날짜 'YYYY-MM-DD'로 다룸
  const dateKeyOf = (stage: ExpeditionStage) => {
    const iso = targets.find((target) => target.stage === stage)?.targetDate;
    return iso ? toDateInputValue(iso) : null;
  };
  const deadlineKey = toDateInputValue(deadline);
  const [todayKey] = useState(() => toDateInputValue(new Date().toISOString())); // 화면을 열 때 한 번만 계산

  // 서버가 킥오프 ≤ 초안 ≤ 검토 ≤ 제출 ≤ 접수 마감 순서만 저장하므로, 앞뒤 단계 목표일 사이만 고르게 함
  const rangeOf = (stage: ExpeditionStage) => {
    const index = STAGE_ORDER.indexOf(stage);
    const before = STAGE_ORDER.slice(0, index).map(dateKeyOf).filter((key) => key !== null);
    const after = STAGE_ORDER.slice(index + 1).map(dateKeyOf).filter((key) => key !== null);
    return {
      minDate: before.length > 0 ? before[before.length - 1] : null,
      maxDate: after.length > 0 && after[0] < deadlineKey ? after[0] : deadlineKey,
    };
  };

  return (
    <>
      <List>
        {STAGE_ORDER.map((stage, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';
          const targetDate = targets.find((target) => target.stage === stage)?.targetDate ?? null;
          return (
            <Row key={stage}>
              <StageName>{EXPEDITION_STAGE_LABEL[stage]}</StageName>
              <StatusPill tone={STATE_PILL[state].tone}>{STATE_PILL[state].label}</StatusPill>
              <FieldButton
                type="button"
                aria-label={`${EXPEDITION_STAGE_LABEL[stage]} 목표일${targetDate ? `, ${formatMonthDay(targetDate)}` : ''}`}
                $highlight={state === 'current'}
                onClick={() => setOpenStage(stage)}
              >
                <FieldText $empty={!targetDate}>{targetDate ? formatMonthDay(targetDate) : '날짜 선택'}</FieldText>
              </FieldButton>
            </Row>
          );
        })}
      </List>

      {openStage && (
        <CalendarSheet
          title={`${EXPEDITION_STAGE_LABEL[openStage]} 목표일`}
          value={dateKeyOf(openStage)}
          today={todayKey}
          deadline={deadlineKey}
          {...rangeOf(openStage)}
          onSelect={(key) => {
            onChange(openStage, fromDateInputValue(key));
            setOpenStage(null);
          }}
          onClose={() => setOpenStage(null)}
        />
      )}
    </>
  );
}

const List = styled.ul`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 4px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
  list-style: none;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;

  & + & {
    border-top: 1px solid var(--color-gray-bg);
  }
`;

const StageName = styled.span`
  flex: 1;
  min-width: 0;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 700;
`;

const FieldButton = styled.button<{ $highlight: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
  width: 112px;
  height: 40px;
  padding: 0 14px;
  border: 1.5px solid ${({ $highlight }) => ($highlight ? 'var(--color-amber)' : 'var(--color-border)')};
  border-radius: 12px;
  background: #ffffff;
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    border-color: var(--color-orange);
  }
`;

const FieldText = styled.span<{ $empty: boolean }>`
  color: ${({ $empty }) => ($empty ? 'var(--color-text-tertiary)' : 'var(--color-ink)')};
  font-size: 15px;
`;
