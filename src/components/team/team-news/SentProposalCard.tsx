import { useState } from 'react';
import styled from 'styled-components';
import MemberAvatar, { type AvatarTone } from './MemberAvatar';
import AnnouncementLink from './AnnouncementLink';
import { Card } from './teamNewsStyles';
import type { ProposalStatus } from '../../../api/common';
import type { SentProposal } from '../../../types/teamNews';
import { formatMonthDay } from '../../../utils/date';
import chevronUpIcon from '../../../assets/icons/team/team-news/chevron-up.svg';
import chevronDownIcon from '../../../assets/icons/team/team-news/chevron-down.svg';

const AVATAR_TONES: AvatarTone[] = ['mint', 'coral', 'peach'];

// 상태별 문구 · 색. 쉬어가기는 요약 숫자(진한 회색)와 팀원 줄(연한 회색) 색이 다르다.
const STATUS: Record<ProposalStatus, { label: string; countColor: string; rowColor: string }> = {
  JOINED: { label: '합류', countColor: '#4c7a1e', rowColor: '#4c7a1e' },
  DECLINED: { label: '쉬어가기', countColor: '#5b5b5b', rowColor: '#999896' },
  PENDING: { label: '미응답', countColor: '#d97700', rowColor: '#d97700' },
};

interface SentProposalCardProps {
  proposal: SentProposal;
  onOpenAnnouncement: () => void;
}

// B03 보낸 제안 카드: 공고 · 응답 요약(합류/쉬어가기/미응답) · 팀원별 응답(접기/펼치기)
export default function SentProposalCard({ proposal, onOpenAnnouncement }: SentProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { joinedCount, declinedCount, pendingCount, recipients } = proposal.responses;

  const summary: { status: ProposalStatus; count: number }[] = [
    { status: 'JOINED', count: joinedCount },
    { status: 'DECLINED', count: declinedCount },
    { status: 'PENDING', count: pendingCount },
  ];

  return (
    <ProposalCard>
      <AnnouncementLink
        title={proposal.announcementTitle}
        description={`${proposal.projectName} 프로젝트 · ${formatMonthDay(proposal.createdAt)} 보냄`}
        onClick={onOpenAnnouncement}
      />

      <Summary>
        {summary.map(({ status, count }) => (
          <SummaryItem key={status}>
            <dt>{STATUS[status].label}</dt>
            <SummaryCount $color={STATUS[status].countColor}>{count}명</SummaryCount>
          </SummaryItem>
        ))}
      </Summary>

      <Divider />

      <ToggleButton
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        팀원별 응답 {isExpanded ? '접기' : '보기'}
        <IconBox>
          <img src={isExpanded ? chevronUpIcon : chevronDownIcon} alt="" />
        </IconBox>
      </ToggleButton>

      {isExpanded && (
        <ResponseList>
          {recipients.map((recipient, index) => (
            <ResponseRow key={recipient.proposalRecipientId}>
              <MemberAvatar
                characterId={recipient.characterId}
                size={32}
                tone={AVATAR_TONES[index % AVATAR_TONES.length]}
              />
              <MemberName>{recipient.name}</MemberName>
              <ResponseLabel $color={STATUS[recipient.status].rowColor}>
                {STATUS[recipient.status].label}
              </ResponseLabel>
            </ResponseRow>
          ))}
        </ResponseList>
      )}
    </ProposalCard>
  );
}

const ProposalCard = styled(Card)`
  gap: 16px;
`;

const Summary = styled.dl`
  display: flex;
  align-items: center;
  margin: 0;
`;

// 항목 사이에 세로 구분선(높이 28)
const SummaryItem = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column-reverse;
  align-items: center;
  gap: 5px;
  min-width: 0;

  dt {
    color: #999896;
    font-size: 12px;
    font-weight: 400;
  }

  & + &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 1px;
    height: 28px;
    background: #e7e5e0;
    transform: translateY(-50%);
  }
`;

const SummaryCount = styled.dd<{ $color: string }>`
  margin: 0;
  color: ${({ $color }) => $color};
  font-size: 22px;
  font-weight: 700;
`;

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: #e7e5e0;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #5b5b5b;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const IconBox = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

const ResponseList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ResponseRow = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MemberName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResponseLabel = styled.span<{ $color: string }>`
  flex-shrink: 0;
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 700;
`;
