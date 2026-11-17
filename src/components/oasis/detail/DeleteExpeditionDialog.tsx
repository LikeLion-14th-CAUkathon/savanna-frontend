import { useEffect, useId } from 'react';
import styled from 'styled-components';
import Button from '../../common/Button';

interface DeleteExpeditionDialogProps {
  isDeleting: boolean;
  onClose: () => void;   // 취소 · 배경 · Esc: 아무것도 바꾸지 않고 닫기
  onConfirm: () => void; // 원정 삭제
}

// D02 원정 삭제 확인 · 가운데 다이얼로그
export default function DeleteExpeditionDialog({ isDeleting, onClose, onConfirm }: DeleteExpeditionDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  // Esc로 닫기 (삭제 중에는 닫지 않음)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, onClose]);

  return (
    <>
      <Scrim aria-hidden="true" onClick={isDeleting ? undefined : onClose} />
      <Positioner>
        <Dialog role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
          <Title id={titleId}>이 원정을 삭제할까요?</Title>
          <Description id={descriptionId}>
            삭제하면 모든 팀원의 오아시스에서 원정이 사라지고,
            <br />이 원정의 일정·공지·체크리스트를 볼 수 없어요.
          </Description>
          <Actions>
            <CancelButton variant="secondary" disabled={isDeleting} onClick={onClose}>
              취소
            </CancelButton>
            <ConfirmButton disabled={isDeleting} onClick={onConfirm}>
              원정 삭제
            </ConfirmButton>
          </Actions>
        </Dialog>
      </Positioner>
    </>
  );
}

// 화면 전체를 어둡게 덮는 배경 (Figma Scrim · #1e1e1e 45%)
const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(30, 30, 30, 0.45);
`;

// 다이얼로그를 화면 가운데에 놓는 자리. 바깥(배경)을 누르면 Scrim이 받도록 클릭을 통과시킨다.
const Positioner = styled.div`
  position: fixed;
  inset: 0;
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  pointer-events: none;
`;

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  max-width: 354px;
  padding: 28px 24px 24px;
  border-radius: 24px;
  background: var(--color-bg);
  box-shadow: 0 8px 24px rgba(59, 42, 22, 0.17);
  pointer-events: auto;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
`;

const Description = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  word-break: keep-all;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const CancelButton = styled(Button)`
  flex-shrink: 0;
  width: 112px;
`;

const ConfirmButton = styled(Button)`
  flex: 1;
`;
