import styled from 'styled-components';
import backIcon from '../../../assets/icons/contest-search/contest-detail/back.svg';

interface DetailAppBarProps {
  title: string;
  onBack: () => void;
}

// 공통 AppBar와 구조는 같고, 색만 최신 시안(#1e1e1e)에 맞춘 버전
export default function DetailAppBar({ title, onBack }: DetailAppBarProps) {
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
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  box-sizing: border-box;
  height: 56px;
  padding: 0 14px;
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
    outline: 2px solid #d97700;
    outline-offset: -2px;
    border-radius: 8px;
  }
`;

const Title = styled.h1`
  color: #1e1e1e;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
