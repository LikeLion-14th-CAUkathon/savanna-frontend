import { useRef } from 'react';
import styled from 'styled-components';
import StatusPill from '../detail/StatusPill';
import type { PillTone } from '../detail/StatusPill';
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
  onChange: (stage: ExpeditionStage, targetDate: string | null) => void;
}

// D03 · 팀 준비 단계별 목표일 입력
export default function TargetDateList({ currentStage, targets, onChange }: TargetDateListProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <List>
      {STAGE_ORDER.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';
        const targetDate = targets.find((target) => target.stage === stage)?.targetDate ?? null;
        return (
          <Row key={stage}>
            <StageName>{EXPEDITION_STAGE_LABEL[stage]}</StageName>
            <StatusPill tone={STATE_PILL[state].tone}>{STATE_PILL[state].label}</StatusPill>
            <DateField
              label={`${EXPEDITION_STAGE_LABEL[stage]} 목표일`}
              value={targetDate}
              highlight={state === 'current'}
              onChange={(value) => onChange(stage, value)}
            />
          </Row>
        );
      })}
    </List>
  );
}

interface DateFieldProps {
  label: string;
  value: string | null;
  highlight: boolean;
  onChange: (value: string | null) => void;
}

// 화면에는 '11.01'로 보이고, 누르면 기기의 날짜 선택기가 열림
function DateField({ label, value, highlight, onChange }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus(); // showPicker를 지원하지 않는 브라우저
    }
  };

  return (
    <FieldBox $highlight={highlight} onClick={openPicker}>
      <FieldText $empty={!value}>{value ? formatMonthDay(value) : '날짜 선택'}</FieldText>
      <HiddenDateInput
        ref={inputRef}
        type="date"
        aria-label={label}
        value={value ? toDateInputValue(value) : ''}
        onChange={(event) => onChange(event.target.value ? fromDateInputValue(event.target.value) : null)}
      />
    </FieldBox>
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

const FieldBox = styled.div<{ $highlight: boolean }>`
  position: relative;
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
  cursor: pointer;

  &:focus-within {
    border-color: var(--color-orange);
  }
`;

const FieldText = styled.span<{ $empty: boolean }>`
  color: ${({ $empty }) => ($empty ? 'var(--color-text-tertiary)' : 'var(--color-ink)')};
  font-size: 15px;
`;

// 실제 날짜 입력칸은 투명하게 상자 위에 덮어둠 (키보드·화면 낭독기로도 조작 가능)
const HiddenDateInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;
