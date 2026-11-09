import styled from 'styled-components';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface HomeSignProps {
  ideaCount?: number;                      // 없으면(불러오는 중·실패) 배지를 숨김
  board: Box;                              // 큰 표지판 글자 영역
  badge: { left: number; top: number };   // 아이디어 배지 위치
  onClick: () => void;
}

// 우리 팀 오아시스의 큰 표지판 글자 + 아이디어 개수 배지
export default function HomeSign({ ideaCount, board, badge, onClick }: HomeSignProps) {
  const hasCount = ideaCount !== undefined;

  return (
    <>
      <Board
        type="button"
        onClick={onClick}
        style={{ ...board }}
        aria-label={hasCount ? `우리 팀 프로젝트, 아이디어 ${ideaCount}개` : '우리 팀 프로젝트'}
      >
        <Label>우리 팀 프로젝트</Label>
      </Board>
      {hasCount && (
        <IdeaBadge style={{ ...badge }} aria-hidden="true">
          아이디어 {ideaCount}개
        </IdeaBadge>
      )}
    </>
  );
}

const Board = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 6px;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
    border-radius: 8px;
  }
`;

const Label = styled.span`
  color: var(--color-sign-label);
  font-family: var(--font-concept);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.22px;
  white-space: nowrap;
`;

const IdeaBadge = styled.span`
  position: absolute;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 24px;
  padding: 0 11px;
  border: 1.5px solid var(--color-amber-shadow);
  border-radius: 10px;
  background: var(--color-amber);
  box-shadow: 0 2px 0 var(--color-amber-shadow);
  color: var(--color-ink);
  font-family: var(--font-concept);
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.13px;
  white-space: nowrap;
  pointer-events: none;
`;
