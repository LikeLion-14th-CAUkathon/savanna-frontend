import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import styled from 'styled-components';
import closeIcon from '../../assets/icons/bottom-sheet/close.svg';

interface BottomSheetProps {
  title?: string;         // 시트 제목. 없으면 제목 줄 · 닫기 버튼 없이 손잡이 아래에 바로 내용을 둔다 (예: 사진 메뉴)
  ariaLabel?: string;     // 제목이 없을 때 화면 읽기 프로그램에 알려 줄 시트 이름
  description?: string;   // 제목 아래 보조 설명 (있을 때만)
  onClose: () => void;    // 닫기 버튼 · 바깥 영역 · Esc
  children: ReactNode;    // 제목 아래 내용 (항목 사이 간격 24px)
}

// 화면 아래에서 올라오는 선택창. 부모가 열 때만 렌더링한다.
export default function BottomSheet({ title, ariaLabel, description, onClose, children }: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const suppressClick = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    setStartY(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startY === null) return;
    setOffsetY(Math.max(0, event.clientY - startY));
  };

  // 손잡이를 80px 이상 내리면 닫고, 덜 내렸으면 제자리로 돌아간다.
  const handlePointerUp = () => {
    if (offsetY >= 80) onClose();
    setStartY(null);
    setOffsetY(0);
  };

  // 내용이 맨 위에서 시작한 아래 방향 터치만 시트 드래그로 처리한다.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const gesture: { start: { x: number; y: number } | null; distance: number } = {
      start: null,
      distance: 0,
    };

    const reset = () => {
      gesture.start = null;
      gesture.distance = 0;
      setStartY(null);
      setOffsetY(0);
    };
    const handleTouchStart = (event: TouchEvent) => {
      reset();
      suppressClick.current = false;
      if (event.touches.length !== 1) return;
      const target = event.target as HTMLElement;
      const isHandle = target.closest('[data-sheet-handle]');
      if (!isHandle) {
        // 내부에 별도 스크롤 영역이 있어도 맨 위인지 함께 확인한다.
        for (let element: HTMLElement | null = target; element; element = element.parentElement) {
          if (element.scrollTop > 0) return;
          if (element === sheet) break;
        }
      }
      gesture.start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (!gesture.start) return;
      if (event.touches.length !== 1) {
        reset();
        return;
      }
      const deltaY = event.touches[0].clientY - gesture.start.y;
      const deltaX = event.touches[0].clientX - gesture.start.x;
      if (gesture.distance === 0 && (deltaY < -5 || Math.abs(deltaX) > Math.max(5, deltaY))) {
        gesture.start = null;
        return;
      }
      if (deltaY <= 5 && gesture.distance === 0) return;
      if (!event.cancelable) {
        reset();
        return;
      }
      event.preventDefault();
      gesture.distance = Math.max(0, deltaY);
      suppressClick.current = true;
      setStartY(gesture.start.y);
      setOffsetY(gesture.distance);
    };
    const handleTouchEnd = () => {
      if (gesture.distance >= 80) onClose();
      reset();
    };

    sheet.addEventListener('touchstart', handleTouchStart, { passive: true });
    sheet.addEventListener('touchmove', handleTouchMove, { passive: false });
    sheet.addEventListener('touchend', handleTouchEnd);
    sheet.addEventListener('touchcancel', reset);
    return () => {
      sheet.removeEventListener('touchstart', handleTouchStart);
      sheet.removeEventListener('touchmove', handleTouchMove);
      sheet.removeEventListener('touchend', handleTouchEnd);
      sheet.removeEventListener('touchcancel', reset);
    };
  }, [onClose]);

  // 바텀시트가 열린 동안 배경을 고정하고, 닫히면 원래 스크롤 위치를 복원한다.
  useEffect(() => {
    const scrollY = window.scrollY;
    const originalStyle = document.body.style.cssText;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.cssText = originalStyle;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, []);

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
      <Sheet
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        $dragging={startY !== null}
        style={{ transform: `translate(-50%, ${offsetY}px)` }}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
      >
        <DragArea
          data-sheet-handle
          $compact={!title}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            setStartY(null);
            setOffsetY(0);
          }}
        >
          <Handle aria-hidden="true" />
        </DragArea>
        {title && (
          <Header>
            <TitleRow>
              <Title id={titleId}>{title}</Title>
              <CloseButton type="button" aria-label="닫기" onClick={onClose}>
                <img src={closeIcon} alt="" />
              </CloseButton>
            </TitleRow>
            {description && <Description>{description}</Description>}
          </Header>
        )}
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

const Sheet = styled.section<{ $dragging: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 402px;
  max-height: 90svh;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: 0 24px 34px;
  border-radius: 24px 24px 0 0;
  background: var(--color-bg);
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
  transform: translateX(-50%);
  transition: ${({ $dragging }) => ($dragging ? 'none' : 'transform 0.2s')};
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
  outline: none;

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
`;

// 손잡이 아래 내용까지: 제목이 있으면 24px, 제목이 없으면 12px
const DragArea = styled.div<{ $compact: boolean }>`
  flex-shrink: 0;
  padding: 12px 0;
  margin-bottom: ${({ $compact }) => ($compact ? '-24px' : '-12px')};
  touch-action: none;
  cursor: grab;
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  margin: 0 auto;
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
