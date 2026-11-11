import type { ReactNode } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import { CONTEST_STATUS_LABEL, URGENT_DDAY, type Contest, type ContestStatus } from '../../../types/contest';
import calendarIcon from '../../../assets/icons/contest-search/calendar.svg';

interface ContestCardProps {
  contest: Contest;
  highlight?: string; // 제목에서 강조할 검색어
}

export default function ContestCard({ contest, highlight = '' }: ContestCardProps) {
  return (
    <Card>
      <Pills>
        <DdayPill $urgent={contest.dDay <= URGENT_DDAY}>D-{contest.dDay}</DdayPill>
        <StatusPill $status={contest.status}>{CONTEST_STATUS_LABEL[contest.status]}</StatusPill>
      </Pills>
      <Title>{highlightText(contest.title, highlight)}</Title>
      <Meta>{contest.host} · {contest.category}</Meta>
      <Deadline>
        <Icon src={calendarIcon} size={14} offsetX={1.46} offsetY={1.17} />
        마감 {contest.deadline}
      </Deadline>
    </Card>
  );
}

// 제목에서 검색어와 같은 부분(대소문자 무시)을 찾아 주황색으로 감싼다.
function highlightText(text: string, keyword: string): ReactNode {
  if (keyword === '') return text;

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let index = lowerText.indexOf(lowerKeyword);

  while (index !== -1) {
    if (index > start) parts.push(text.slice(start, index));
    parts.push(<Mark key={index}>{text.slice(index, index + keyword.length)}</Mark>);
    start = index + keyword.length;
    index = lowerText.indexOf(lowerKeyword, start);
  }
  if (start < text.length) parts.push(text.slice(start));

  return parts;
}

const STATUS_PILL_COLORS: Record<ContestStatus, { background: string; color: string }> = {
  open: { background: '#eef3de', color: '#4c7a1e' },
  upcoming: { background: '#e9f4fb', color: '#2e74a6' },
};

const Card = styled.article`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const Pills = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Pill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
`;

const DdayPill = styled(Pill)<{ $urgent: boolean }>`
  background: ${({ $urgent }) => ($urgent ? '#ffb72b' : '#fff6dd')};
  color: ${({ $urgent }) => ($urgent ? '#1e1e1e' : '#d97700')};
  font-weight: 700;
`;

const StatusPill = styled(Pill)<{ $status: ContestStatus }>`
  background: ${({ $status }) => STATUS_PILL_COLORS[$status].background};
  color: ${({ $status }) => STATUS_PILL_COLORS[$status].color};
  font-weight: 500;
`;

const Title = styled.h3`
  width: 100%;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
`;

const Mark = styled.mark`
  background: transparent;
  color: #d97700;
`;

const Meta = styled.p`
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;

const Deadline = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999896;
  font-size: 13px;
  font-weight: 500;
`;
