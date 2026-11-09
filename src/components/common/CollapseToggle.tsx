import { useState } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import upIcon from '../../assets/icons/collapse-toggle/collapse-up.svg';
import downIcon from '../../assets/icons/collapse-toggle/collapse-down.svg';

interface CollapseToggleProps {
  label?: string;
  children?: ReactNode;
  defaultExpanded?: boolean; // 처음에 펼쳐진 상태로 시작할지
}

export default function CollapseToggle({
  label = '추가 정보',
  children,
  defaultExpanded = false,
}: CollapseToggleProps) {
  // 펼쳐졌는지 여부를 상태로 관리하기. 처음에는 접혀 있으니까 기본값을 false로 둠.
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Container>
      <ToggleButton type="button" aria-expanded={isExpanded} onClick={handleToggle}>
        <Label>{label}</Label>
        <Hint>선택 · {isExpanded ? '접기' : '펼치기'}</Hint>
        <Arrow src={isExpanded ? upIcon : downIcon} alt="" />
      </ToggleButton>
      {isExpanded && children}
    </Container>
  );
}

const Container = styled.div`
  width: 354px;
  max-width: 100%;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px 0 0;
  border: 0;
  border-top: 1.5px solid #e7e5e0;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #3a7a2e;
    outline-offset: 4px;
  }
`;

const Label = styled.span`
  color: #3a7a2e;
  font-size: 14px;
  font-weight: 700;
`;

const Hint = styled.span`
  color: #999896;
  font-size: 12px;
  font-weight: 400;
`;

const Arrow = styled.img`
  flex-shrink: 0;
  margin-left: auto;
`;
