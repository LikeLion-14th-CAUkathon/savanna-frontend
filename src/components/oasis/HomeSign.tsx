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
// 나무 판자는 배경 지도에 그려져 있어서, 공고 표지판처럼 띄우는 대신 판자 영역의 밝기로 반응한다.
// (글자만 움직이면 판자와 따로 놀아 보여서 크기는 바꾸지 않는다)
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
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }

  /* 마우스가 있는 기기: 올리면 판자가 살짝 밝아지고 글자에 빛이 돈다. */
  @media (hover: hover) {
    &:hover {
      background: rgba(255, 249, 236, 0.18);
    }
  }

  /* 누르는 순간 살짝 어두워진다. 폰에서는 이 효과만 보인다. */
  &:active {
    background: rgba(59, 42, 22, 0.12);
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
  transition: text-shadow 0.2s ease;

  @media (hover: hover) {
    button:hover > & {
      text-shadow: 0 0 8px rgba(255, 241, 214, 0.75);
    }
  }
`;
