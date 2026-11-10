import styled from 'styled-components';
import { Card } from './detailStyles';
import stageLionIcon from '../../../assets/icons/expedition-detail/stage-lion.svg';
import { EXPEDITION_STAGE_LABEL } from '../../../types/oasis';
import type { ExpeditionStage } from '../../../types/oasis';
import type { StageTarget } from '../../../types/expedition';
import { formatMonthDay } from '../../../utils/date';

const STAGE_ORDER: ExpeditionStage[] = ['KICKOFF', 'DRAFT', 'FINAL_REVIEW', 'SUBMIT'];

interface StageProgressProps {
  currentStage: ExpeditionStage;
  targets: StageTarget[];
}

// 일정·제출 준비 탭 · 팀 준비 단계별 목표일과 진행 표시 (현재 단계에 사자)
export default function StageProgress({ currentStage, targets }: StageProgressProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const targetDateOf = (stage: ExpeditionStage) => targets.find((target) => target.stage === stage)?.targetDate;

  return (
    <Card>
      <Track aria-hidden="true">
        <Rail />
        <Elapsed style={{ width: `${(currentIndex / STAGE_ORDER.length) * 100}%` }} />
        <Steps>
          {STAGE_ORDER.map((stage, index) => (
            <StepSlot key={stage}>
              {index < currentIndex && <DoneDot>✓</DoneDot>}
              {index === currentIndex && <LionIcon src={stageLionIcon} alt="" />}
              {index > currentIndex && <TodoDot>{index + 1}</TodoDot>}
            </StepSlot>
          ))}
        </Steps>
      </Track>

      <Labels>
        {STAGE_ORDER.map((stage, index) => {
          const targetDate = targetDateOf(stage);
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';
          return (
            <Label key={stage} $state={state} aria-current={state === 'current' ? 'step' : undefined}>
              <StageName>{EXPEDITION_STAGE_LABEL[stage]}</StageName>
              <StageDate>{targetDate ? formatMonthDay(targetDate) : '-'}</StageDate>
            </Label>
          );
        })}
      </Labels>
    </Card>
  );
}

const Track = styled.div`
  position: relative;
  height: 32px;
  margin-bottom: 10px;
`;

// 첫 단계 가운데부터 마지막 단계 가운데까지
const Rail = styled.div`
  position: absolute;
  top: 13px;
  left: 12.5%;
  right: 12.5%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-gray-bg);
`;

const Elapsed = styled.div`
  position: absolute;
  top: 13px;
  left: 12.5%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-amber);
`;

const Steps = styled.div`
  position: relative;
  display: flex;
  height: 100%;
`;

const StepSlot = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
`;

const DoneDot = styled(Dot)`
  background: var(--color-amber);
  color: var(--color-ink);
`;

const TodoDot = styled(Dot)`
  border: 2px solid var(--color-border);
  background: #ffffff;
  color: var(--color-text-tertiary);
`;

const LionIcon = styled.img`
  display: block;
  margin-top: -2px;
`;

const Labels = styled.div`
  display: flex;
`;

const Label = styled.div<{ $state: 'done' | 'current' | 'todo' }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  font-size: 12px;
  line-height: normal;
  white-space: nowrap;

  & > :first-child {
    color: ${({ $state }) =>
      $state === 'current' ? 'var(--color-orange)' : $state === 'done' ? 'var(--color-ink)' : 'var(--color-text-secondary)'};
  }

  & > :last-child {
    color: ${({ $state }) => ($state === 'current' ? 'var(--color-orange)' : 'var(--color-text-tertiary)')};
  }
`;

const StageName = styled.span`
  font-weight: 700;
`;

const StageDate = styled.span`
  font-weight: 300;
`;
