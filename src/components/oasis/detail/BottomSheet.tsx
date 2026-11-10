import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import closeIcon from '../../../assets/icons/expedition-detail/sheet-close.svg';

interface BottomSheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

// 화면 아래에서 올라오는 선택창 (배경을 누르거나 Esc로 닫힘)
export default function BottomSheet({ title, description, onClose, children }: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <Scrim onClick={onClose} />
      <Sheet role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <Handle aria-hidden="true" />
        <Header>
          <TitleRow>
            <Title id={titleId}>{title}</Title>
            <CloseButton type="button" aria-label="닫기" onClick={onClose}>
              <img src={closeIcon} alt="" />
            </CloseButton>
          </TitleRow>
          {description && <Description>{description}</Description>}
        </Header>
        {children}
      </Sheet>
    </>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
  background: rgba(30, 30, 30, 0.45);
`;

const Sheet = styled.section`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 11;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  padding: 12px 24px 34px;
  border-radius: 24px 24px 0 0;
  background: var(--color-bg);
  box-shadow: 0 -5px 11px rgba(59, 42, 22, 0.17);
  transform: translateX(-50%);
`;

const Handle = styled.div`
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #d7d4cd;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 20px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-right: -11px; /* 아이콘을 오른쪽 여백에 맞춤 */
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: -4px;
    border-radius: 8px;
  }
`;

const Description = styled.p`
  color: var(--color-text-secondary);
  font-size: 13px;
`;
