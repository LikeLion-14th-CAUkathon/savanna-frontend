import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import Button from '../../common/Button';

interface SubmitConfirmSheetProps {
  isSaving: boolean;
  onClose: () => void;   // X·배경: 아무것도 바꾸지 않고 닫기
  onCancel: () => void;  // 취소: 진행 단계 선택창으로 돌아가기
  onConfirm: () => void; // 제출로 변경
}

// D02-02 제출 단계로 바꾸기 전 확인창
// 서비스 안의 진행 상태만 바꾸는 것이고, 주최 측에 실제로 제출하는 동작은 아님
export default function SubmitConfirmSheet({ isSaving, onClose, onCancel, onConfirm }: SubmitConfirmSheetProps) {
  return (
    <BottomSheet title="주최 측에 지원을 제출했나요?" description="직접 제출한 뒤에 변경해 주세요." onClose={onClose}>
      <Actions>
        <CancelButton variant="secondary" onClick={onCancel}>
          취소
        </CancelButton>
        <ConfirmButton disabled={isSaving} onClick={onConfirm}>
          제출로 변경
        </ConfirmButton>
      </Actions>
    </BottomSheet>
  );
}

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const CancelButton = styled(Button)`
  flex-shrink: 0;
  width: 112px;
`;

const ConfirmButton = styled(Button)`
  flex: 1;
`;
