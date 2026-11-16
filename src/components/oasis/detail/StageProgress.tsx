import styled from 'styled-components';
import { EmptyText } from './detailStyles';
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

// 일정·제출 준비 탭 · 팀 준비 단계별 목표일과 진행 표시 (현재 단계에 사자). 팀 준비 카드 안에 들어감
export default function StageProgress({ currentStage, targets }: StageProgressProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const targetDateOf = (stage: ExpeditionStage) => targets.find((target) => target.stage === stage)?.targetDate;
  const hasAnyDate = STAGE_ORDER.some((stage) => targetDateOf(stage));

  return (
    <div>
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
            <Label key={stage} aria-current={state === 'current' ? 'step' : undefined}>
              <StageName $state={state}>{EXPEDITION_STAGE_LABEL[stage]}</StageName>
              {/* 목표일이 없으면 빈칸 (줄 높이는 유지해서 다른 단계와 맞춤). 전부 없으면 날짜 줄을 빼고 아래 안내 */}
              {hasAnyDate && <StageDate $state={state}>{targetDate ? formatMonthDay(targetDate) : ' '}</StageDate>}
            </Label>
          );
        })}
      </Labels>

      {!hasAnyDate && <NoDateText>날짜를 먼저 설정해주세요</NoDateText>}
    </div>
  );
}

const Track = styled.div`
  position: relative;
  height: 32px;
  margin-bottom: 8px;
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

type StepState = 'done' | 'current' | 'todo';

const Label = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  font-size: 12px;
  line-height: normal;
  white-space: nowrap;
`;

const StageName = styled.span<{ $state: StepState }>`
  color: ${({ $state }) =>
    $state === 'current' ? 'var(--color-orange)' : $state === 'done' ? 'var(--color-ink)' : 'var(--color-text-secondary)'};
  font-weight: 700;
`;

const StageDate = styled.span<{ $state: StepState }>`
  color: ${({ $state }) => ($state === 'current' ? 'var(--color-orange)' : 'var(--color-text-tertiary)')};
  font-weight: 300;
`;

// 목표일이 하나도 없을 때 안내 (아래 '등록된 공지가 없어요'와 같은 모양 · 정렬)
const NoDateText = styled(EmptyText)`
  margin-top: 8px;
`;
