import styled from 'styled-components';
import backIcon from '../../assets/icons/app-bar/appbar-back.svg';

interface AppBarProps {
  title: string;        // 가운데에 보여줄 화면 제목
  onBack: () => void;   // 뒤로 가기 버튼을 눌렀을 때 실행할 함수
}

export default function AppBar({ title, onBack }: AppBarProps) {
  return (
    <Bar>
      <IconButton type="button" aria-label="뒤로 가기" onClick={onBack}>
        <img src={backIcon} alt="" />
      </IconButton>
      <Title>{title}</Title>
    </Bar>
  );
}

const Bar = styled.header`
  position: sticky; /* 고정함 */
  top: 0;
  z-index: 5;
  display: grid;
  flex-shrink: 0;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  height: 56px;
  padding: 0 14px;
  background: var(--color-bg);
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #3b2a16;
    outline-offset: -2px;
    border-radius: 4px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #3b2a16;
  font-family: 'Pretendard', sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;