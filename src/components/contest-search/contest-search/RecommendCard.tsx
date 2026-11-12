import styled from 'styled-components';
import Icon from '../Icon';
import DdaySign from './DdaySign';
import { CONTEST_STATUS_LABEL, type ContestStatus, type RecommendedContest } from '../../../types/contest';
import sparkSmallIcon from '../../../assets/icons/contest-search/spark-small.svg';

interface RecommendCardProps {
  contest: RecommendedContest;
}

const STATUS_TEXT_COLOR: Record<ContestStatus, string> = {
  open: '#5a6628',
  upcoming: '#2e74a6',
};

export default function RecommendCard({ contest }: RecommendCardProps) {
  return (
    <Card>
      <DdaySign dDay={contest.dDay} />
      <Title>{contest.title}</Title>
      <Meta>
        <span>{contest.host} · {contest.category}</span>
        <span>
          마감 {contest.deadline} ·{' '}
          <StatusText $status={contest.status}>{CONTEST_STATUS_LABEL[contest.status]}</StatusText>
        </span>
      </Meta>
      <Reason>
        <Icon src={sparkSmallIcon} size={14} offsetX={0} offsetY={1.17} />
        <ReasonText>{contest.reason}</ReasonText>
      </Reason>
    </Card>
  );
}

const Card = styled.article`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 268px;
  padding: 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const Title = styled.h3`
  width: 100%;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
`;

const Meta = styled.p`
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;

const StatusText = styled.span<{ $status: ContestStatus }>`
  color: ${({ $status }) => STATUS_TEXT_COLOR[$status]};
`;

const Reason = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  margin-top: auto; /* 카드 높이가 달라도 추천 이유 박스를 아래쪽에 맞춤 */
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff0cc;
`;

const ReasonText = styled.p`
  flex: 1;
  min-width: 0;
  color: #d97700;
  font-size: 12px;
  font-weight: 500;
  word-break: keep-all; /* 한글 단어 중간에서 줄바꿈되지 않게 */
`;
