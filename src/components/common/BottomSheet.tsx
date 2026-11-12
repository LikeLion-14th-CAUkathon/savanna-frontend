import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import closeIcon from '../../assets/icons/bottom-sheet/close.svg';

interface BottomSheetProps {
  title: string;          // 시트 제목
  description?: string;   // 제목 아래 보조 설명 (있을 때만)
  onClose: () => void;    // 닫기 버튼 · 바깥 영역 · Esc
  children: ReactNode;    // 제목 아래 내용 (항목 사이 간격 24px)
}

// 화면 아래에서 올라오는 선택창. 부모가 열 때만 렌더링한다.
export default function BottomSheet({ title, description, onClose, children }: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);

  // 열리면 시트로 포커스를 옮기고, Esc로 닫을 수 있게 한다.
  useEffect(() => {
    sheetRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <Scrim onClick={onClose} aria-hidden="true" />
      <Sheet ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
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
  z-index: 100;
  background: rgba(30, 30, 30, 0.45);
`;

const Sheet = styled.section`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  max-height: 90svh;
  overflow-y: auto;
  padding: 12px 24px 34px;
  border-radius: 24px 24px 0 0;
  background: var(--color-bg);
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
  transform: translateX(-50%);
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
  outline: none;
`;

const Handle = styled.div`
  flex-shrink: 0;
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
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: -2px;
    border-radius: 8px;
  }
`;

const Description = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
`;
