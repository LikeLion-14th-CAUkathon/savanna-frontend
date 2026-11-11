import styled from 'styled-components';
import StatusPill from './StatusPill';
import type { PillTone } from './StatusPill';
import { Card } from './detailStyles';
import type { MemberResponse, ResponseStatus as Status } from '../../../types/expedition';

const STATUS: Record<Status, { label: string; tone: PillTone }> = {
  JOINED: { label: '합류', tone: 'green' },
  RESTING: { label: '쉬어가기', tone: 'gray' },
  PENDING: { label: '미응답', tone: 'amber' },
};

interface ResponseStatusProps {
  responses: MemberResponse[];
}

// 지원 조건 탭 · 제안과 응답 현황 (팀원별 합류·쉬어가기·미응답)
export default function ResponseStatus({ responses }: ResponseStatusProps) {
  return (
    <Card>
      <List>
        {responses.map((response) => (
          <Row key={response.memberId}>
            <Name>
              {response.name}
              {response.isMe && ' (나)'}
            </Name>
            <StatusPill tone={STATUS[response.status].tone}>{STATUS[response.status].label}</StatusPill>
          </Row>
        ))}
      </List>
    </Card>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Name = styled.span`
  min-width: 0;
  overflow: hidden;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
