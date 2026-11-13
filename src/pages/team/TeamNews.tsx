import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import TabBar from '../../components/layout/TabBar';
import ReceivedProposalCard from '../../components/team/team-news/ReceivedProposalCard';
import SentProposalCard from '../../components/team/team-news/SentProposalCard';
import SentProposalSelect from '../../components/team/team-news/SentProposalSelect';
import { Card } from '../../components/team/team-news/teamNewsStyles';
import type { ProposalStatus } from '../../api/common';
import { MOCK_RECEIVED_PROPOSALS, MOCK_SENT_PROPOSALS } from '../../mocks/teamNews';
import mailIcon from '../../assets/icons/team/team-space/mail.svg';

// B03 팀 소식: 받은 제안에 응답하고, 내가 보낸 제안의 팀원별 응답을 확인한다.
export default function TeamNews() {
  const navigate = useNavigate();

  // TODO: API 연결 시 getReceivedProposals · getSentProposals · getProposalRecipients 로 교체
  const [receivedProposals, setReceivedProposals] = useState(MOCK_RECEIVED_PROPOSALS);
  const sentProposals = MOCK_SENT_PROPOSALS;
  const [selectedSentId, setSelectedSentId] = useState(sentProposals[0]?.proposalId);
  const selectedSent =
    sentProposals.find((proposal) => proposal.proposalId === selectedSentId) ?? sentProposals[0];

  // TODO: API 연결 시 respondToProposal(proposalRecipientId, { status }) 호출 후 반영
  const respond = (proposalRecipientId: number, status: ProposalStatus) => {
    setReceivedProposals((prev) =>
      prev.map((proposal) =>
        proposal.proposalRecipientId === proposalRecipientId ? { ...proposal, status } : proposal,
      ),
    );
  };

  const openAnnouncement = (announcementId: number) => navigate(`/contest/${announcementId}`);


  return (
    <Page>
      <AppBar title="팀 소식" icon={mailIcon} onBack={() => navigate('/team')} />

      <Content>
        <Section>
          <SectionTitle>받은 제안</SectionTitle>
          {receivedProposals.length > 0 ? (
            <CardList>
              {receivedProposals.map((proposal) => (
                <li key={proposal.proposalRecipientId}>
                  <ReceivedProposalCard
                    proposal={proposal}
                    onRespond={(status) => respond(proposal.proposalRecipientId, status)}
                    onOpenAnnouncement={() => openAnnouncement(proposal.announcementId)}
                  />
                </li>
              ))}
            </CardList>
          ) : (
            <EmptyCard>아직 받은 제안이 없어요.</EmptyCard>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>보낸 제안</SectionTitle>
            {selectedSent && (
              <SentProposalSelect
                proposals={sentProposals}
                selectedId={selectedSent.proposalId}
                onSelect={setSelectedSentId}
              />
            )}
          </SectionHeader>
          {selectedSent ? (
            <SentProposalCard
              key={selectedSent.proposalId}
              proposal={selectedSent}
              onOpenAnnouncement={() => openAnnouncement(selectedSent.announcementId)}
            />
          ) : (
            <EmptyCard>아직 보낸 제안이 없어요.</EmptyCard>
          )}
        </Section>
      </Content>

      <BottomBar>
        <TabBar activeTab="team" />
      </BottomBar>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
`;

const Content = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 32px;
  padding: 8px 24px 32px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #1e1e1e;
  font-size: 17px;
  font-weight: 700;
`;

const CardList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const EmptyCard = styled(Card)`
  align-items: center;
  justify-content: center;
  min-height: 92px;
  box-shadow: none;
  color: #5b5b5b;
  font-size: 15px;
  font-weight: 400;
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 5;
`;
