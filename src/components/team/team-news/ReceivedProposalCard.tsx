import { useState } from 'react';
import styled from 'styled-components';
import Button from '../../common/Button';
import MemberAvatar from './MemberAvatar';
import AnnouncementLink from './AnnouncementLink';
import { Card } from './teamNewsStyles';
import type { ProposalStatus } from '../../../api/common';
import type { ReceivedProposal } from '../../../types/teamNews';
import { diffCalendarDays, formatMonthDayTime, formatTime } from '../../../utils/date';
import { formatDDay } from '../../../utils/dday';

type Answer = Exclude<ProposalStatus, 'PENDING'>;

const ANSWER_TEXT: Record<Answer, string> = {
  JOINED: '합류했어요',
  DECLINED: '이번엔 쉬어가요',
};

// 오늘 받은 제안은 '오늘 09:20', 이전 제안은 '11.12 09:20'
const formatReceivedAt = (iso: string) =>
  diffCalendarDays(iso, new Date().toISOString()) === 0
    ? `오늘 ${formatTime(iso)}`
    : formatMonthDayTime(iso);

interface ReceivedProposalCardProps {
  proposal: ReceivedProposal;
  onRespond: (status: Answer) => void;
  onOpenAnnouncement: () => void;
}

// B03 받은 제안 카드: 보낸 사람 말풍선 · 제안한 공고 · 합류/쉬어가기 응답
export default function ReceivedProposalCard({
  proposal,
  onRespond,
  onOpenAnnouncement,
}: ReceivedProposalCardProps) {
  // '응답 바꾸기'를 누르면 다시 두 버튼을 보여준다.
  const [isChanging, setIsChanging] = useState(false);
  const answered = proposal.status !== 'PENDING' && !isChanging ? proposal.status : null;

  const respond = (status: Answer) => {
    setIsChanging(false);
    onRespond(status);
  };

  return (
    <ProposalCard>
      <Sender>
        <MemberAvatar characterId={proposal.senderCharacterId} size={44} tone="mint" />
        <SenderBody>
          <SenderMeta>
            <SenderName>{proposal.senderName}</SenderName>
            <ReceivedAt dateTime={proposal.createdAt}>{formatReceivedAt(proposal.createdAt)}</ReceivedAt>
          </SenderMeta>
          <Bubble>{proposal.message}</Bubble>
        </SenderBody>
      </Sender>

      <LinkRow
        title={proposal.announcementTitle}
        description={`${proposal.projectName} 프로젝트 · 마감 ${formatDDay(proposal.deadline)}`}
        onClick={onOpenAnnouncement}
      />

      {answered ? (
        <AnsweredRow>
          <AnsweredText $status={answered}>{ANSWER_TEXT[answered]}</AnsweredText>
          <ChangeButton type="button" onClick={() => setIsChanging(true)}>
            응답 바꾸기
          </ChangeButton>
        </AnsweredRow>
      ) : (
        <Answers>
          <AnswerButton variant="secondary" onClick={() => respond('DECLINED')}>
            이번엔 쉬어가기
          </AnswerButton>
          <AnswerButton onClick={() => respond('JOINED')}>합류하기</AnswerButton>
        </Answers>
      )}
    </ProposalCard>
  );
}

const ProposalCard = styled(Card)`
  gap: 14px;
`;

const Sender = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const SenderBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const SenderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  white-space: nowrap;
`;

const SenderName = styled.span`
  color: #1e1e1e;
  font-size: 14px;
  font-weight: 700;
`;

const ReceivedAt = styled.time`
  color: #999896;
  font-size: 12px;
  font-weight: 400;
`;

// 왼쪽 위만 각진 말풍선
const Bubble = styled.p`
  margin: 0;
  padding: 12px 12px 12px 13px;
  border-radius: 0 18px 18px 18px;
  background: #fff6dd;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 400;
  overflow-wrap: anywhere;
  white-space: pre-line;
`;

const LinkRow = styled(AnnouncementLink)`
  padding-top: 12px;
  border-top: 1px solid #e7e5e0;
`;

const Answers = styled.div`
  display: flex;
  gap: 8px;
`;

// 공통 Button(L 52)을 M 크기(44)로 줄여 쓴다.
const AnswerButton = styled(Button)`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;

  /* 피그마: 흰 버튼은 그림자 3px */
  ${({ variant }) => variant === 'secondary' && 'box-shadow: 0 3px 0 #e2e0da;'}
`;

const AnsweredRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 44px;
`;

const AnsweredText = styled.p<{ $status: Answer }>`
  margin: 0;
  color: ${({ $status }) => ($status === 'JOINED' ? '#4c7a1e' : '#5b5b5b')};
  font-size: 15px;
  font-weight: 700;
`;

const ChangeButton = styled.button`
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #999896;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
