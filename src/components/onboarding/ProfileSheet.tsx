import { useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import styled from 'styled-components';
import closeIcon from '../../assets/icons/onboarding/close.svg';

interface ProfileSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// 캐릭터·지역 선택에 쓰는 하단 창
export default function ProfileSheet({ title, onClose, children }: ProfileSheetProps) {
  const [startY, setStartY] = useState<number | null>(null); // 손가락을 처음 댄 높이 (null이면 드래그 중 아님)
  const [offsetY, setOffsetY] = useState(0);                 // 아래로 내려간 거리

  // 손잡이를 누르기 시작
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setStartY(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  // 누른 채로 움직이는 중: 아래로만 따라 내려가게 (위로는 0)
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startY === null) return;
    setOffsetY(Math.max(0, event.clientY - startY));
  };

  // 손을 뗐을 때: 80px 이상 내렸으면 닫고, 아니면 제자리로
  const handlePointerUp = () => {
    if (offsetY >= 80) onClose();
    setStartY(null);
    setOffsetY(0);
  };

  return (
    // 어두운 배경을 누르면 닫힘
    <Overlay onClick={onClose}>
      {/* 창 안쪽을 눌렀을 때는 닫히지 않게 막기 */}
      <Sheet
        role="dialog"
        aria-label={title}
        $dragging={startY !== null}
        style={{ transform: `translateY(${offsetY}px)` }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* 이 손잡이를 아래로 끌면 창이 내려가며 닫힘 */}
        <DragArea
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Handle />
        </DragArea>
        <Header>
          <Title>{title}</Title>
          <CloseIconButton aria-label="닫기" onClick={onClose}>
            <img src={closeIcon} alt="" />
          </CloseIconButton>
        </Header>
        {children}
      </Sheet>
    </Overlay>
  );
}

// 화면 전체를 덮는 어두운 배경
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(30, 30, 30, 0.45);
`;

// 화면 아래에 붙는 흰 창
const Sheet = styled.div<{ $dragging: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  max-height: 100svh;
  padding: 0 24px 34px;
  border-radius: 24px 24px 0 0;
  background: #fafaf8;
  color: #1e1e1e;
  line-height: normal;
  overflow-y: auto;
  transition: ${({ $dragging }) => ($dragging ? 'none' : 'transform 0.2s')};
`;

// 손잡이를 누르기 쉽게 넓힌 영역
const DragArea = styled.div`
  padding: 12px 0;
  margin-bottom: -12px;
  touch-action: none;
  cursor: grab;
`;

// 창 상단 손잡이
const Handle = styled.div`
  width: 40px;
  height: 4px;
  margin: 0 auto;
  border-radius: 2px;
  background: #d7d4cd;
`;

// 제목과 닫기 버튼
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
`;

// 창 제목
const Title = styled.h2`
  margin: 0;
  letter-spacing: 0;
  font-size: 20px;
  font-weight: 700;
`;

// X 버튼
const CloseIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;