import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import Button from '../../common/Button';

interface DeleteExpeditionSheetProps {
  isDeleting: boolean;
  onClose: () => void;   // 취소 · 배경 · Esc · 아래로 끌어내리기: 아무것도 바꾸지 않고 닫기
  onConfirm: () => void; // 원정 삭제
}

// D02 원정 삭제 확인 바텀시트
// 디자인에 닫기(X) 버튼이 없어, 공통 BottomSheet의 제목 줄 대신 내용 안에 제목 · 설명을 둔다.
export default function DeleteExpeditionSheet({ isDeleting, onClose, onConfirm }: DeleteExpeditionSheetProps) {
  // 삭제 중에는 닫히지 않게 한다.
  const close = () => {
    if (!isDeleting) onClose();
  };

  return (
    <BottomSheet ariaLabel="원정 삭제 확인" onClose={close}>
      <Texts>
        <Title>이 원정을 삭제할까요?</Title>
        <Description>
          삭제하면 모든 팀원의 오아시스에서 원정이 사라지고,
          <br />이 원정의 일정·공지·체크리스트를 볼 수 없어요.
        </Description>
      </Texts>
      <Actions>
        <CancelButton variant="secondary" disabled={isDeleting} onClick={close}>
          취소
        </CancelButton>
        <ConfirmButton disabled={isDeleting} onClick={onConfirm}>
          원정 삭제
        </ConfirmButton>
      </Actions>
    </BottomSheet>
  );
}

// 공통 BottomSheet는 제목이 없으면 손잡이 바로 아래(12px)에 내용을 둔다.
// Figma처럼 손잡이와 제목 사이를 24px로 맞추려고 12px을 더한다.
const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
`;

const Description = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
  word-break: keep-all;
`;

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
