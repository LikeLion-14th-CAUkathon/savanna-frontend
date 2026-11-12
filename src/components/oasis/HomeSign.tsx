import styled from 'styled-components';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface HomeSignProps {
  board: Box; // 큰 표지판 글자 영역
  onClick: () => void;
}

// 우리 팀 오아시스의 큰 표지판 글자
export default function HomeSign({ board, onClick }: HomeSignProps) {
  return (
    <Board type="button" onClick={onClick} style={{ ...board }}>
      <Label>우리 팀 프로젝트</Label>
    </Board>
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
