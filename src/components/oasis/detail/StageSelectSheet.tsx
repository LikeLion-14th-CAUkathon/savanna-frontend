import { useState } from 'react';
import styled from 'styled-components';
import BottomSheet from './BottomSheet';
import Button from '../../common/Button';
import radioCheckedIcon from '../../../assets/icons/expedition-detail/radio-checked.svg';
import { EXPEDITION_STAGE_LABEL } from '../../../types/oasis';
import type { ExpeditionStage } from '../../../types/oasis';

const STAGE_ORDER: ExpeditionStage[] = ['KICKOFF', 'DRAFT', 'FINAL_REVIEW', 'SUBMIT'];

interface StageSelectSheetProps {
  currentStage: ExpeditionStage;
  initialStage?: ExpeditionStage; // 제출 확인에서 '취소'로 돌아왔을 때 고르던 단계 유지
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (stage: ExpeditionStage) => void;
}

// D02-02 진행 단계 선택창 (열면 현재 단계가 선택된 상태)
export default function StageSelectSheet({
  currentStage,
  initialStage,
  isSaving,
  onClose,
  onConfirm,
}: StageSelectSheetProps) {
  const [selected, setSelected] = useState<ExpeditionStage>(initialStage ?? currentStage);

  return (
    <BottomSheet title="진행 단계 선택" onClose={onClose}>
      <Options role="radiogroup" aria-label="진행 단계">
        {STAGE_ORDER.map((stage) => {
          const isSelected = stage === selected;
          return (
            <Option
              key={stage}
              type="button"
              role="radio"
              aria-checked={isSelected}
              $selected={isSelected}
              onClick={() => setSelected(stage)}
            >
              {isSelected ? <img src={radioCheckedIcon} alt="" /> : <EmptyRadio />}
              <OptionLabel $selected={isSelected}>{EXPEDITION_STAGE_LABEL[stage]}</OptionLabel>
              {stage === currentStage && <CurrentTag>현재</CurrentTag>}
            </Option>
          );
        })}
      </Options>

      <Actions>
        <CloseButton variant="secondary" onClick={onClose}>
          닫기
        </CloseButton>
        <ConfirmButton disabled={isSaving || selected === currentStage} onClick={() => onConfirm(selected)}>
          단계 변경
        </ConfirmButton>
      </Actions>
    </BottomSheet>
  );
}

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  height: 48px;
  padding: 0 16px;
  border: ${({ $selected }) => ($selected ? '1.5px solid var(--color-amber)' : '1px solid var(--color-border)')};
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? 'var(--color-amber-bg)' : '#ffffff')};
  font-family: 'Pretendard', sans-serif;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

const EmptyRadio = styled.span`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1.5px solid #d7d4cd;
  border-radius: 10px;
  background: #ffffff;
`;

const OptionLabel = styled.span<{ $selected: boolean }>`
  color: ${({ $selected }) => ($selected ? 'var(--color-ink)' : 'var(--color-text-secondary)')};
  font-size: 14px;
  font-weight: 700;
`;

const CurrentTag = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  background: #ffffff;
  color: var(--color-orange);
  font-size: 12px;
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const CloseButton = styled(Button)`
  flex-shrink: 0;
  width: 112px;
`;

const ConfirmButton = styled(Button)`
  flex: 1;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
