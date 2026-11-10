import styled from 'styled-components';
import { URGENT_DDAY } from '../../types/contest';

interface DdaySignProps {
  dDay: number;
}

// 지도 표지판 모양의 D-day 표시. 마감 임박이면 밝은 오렌지 판.
export default function DdaySign({ dDay }: DdaySignProps) {
  const isUrgent = dDay <= URGENT_DDAY;

  return (
    <Sign>
      <Board $urgent={isUrgent}>D-{dDay}</Board>
      <Post aria-hidden="true" />
    </Sign>
  );
}

const Sign = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: flex-start;
`;

const Board = styled.span<{ $urgent: boolean }>`
  padding: 4px 16px;
  border: 1.5px solid #5a3110;
  border-radius: 8px;
  background: ${({ $urgent }) => ($urgent ? '#ffb72b' : '#7a4a1c')};
  color: ${({ $urgent }) => ($urgent ? '#1e1e1e' : '#ffffff')};
  font-family: 'CookieRun', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.18px;
  white-space: nowrap;
`;

const Post = styled.span`
  width: 6px;
  height: 14px;
  background: #7a4a1c;
`;
