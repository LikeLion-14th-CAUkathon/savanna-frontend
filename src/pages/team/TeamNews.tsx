import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import TabBar from '../../components/layout/TabBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import ReceivedProposalCard from '../../components/team/team-news/ReceivedProposalCard';
import SentProposalCard from '../../components/team/team-news/SentProposalCard';
import SentProposalSelect from '../../components/team/team-news/SentProposalSelect';
import { Card } from '../../components/team/team-news/teamNewsStyles';
import {
  fetchTeamNews,
  markReceivedRead,
  markResponsesRead,
  sendResponse,
} from '../../components/team/team-news/teamNewsData';
import type { ProposalStatus } from '../../api/common';
import { getApiErrorMessage } from '../../api/client';
import type { ReceivedProposal, SentProposal } from '../../types/teamNews';
import mailIcon from '../../assets/icons/team/team-space/mail.svg';

type LoadState = 'loading' | 'success' | 'error';

type Answer = Exclude<ProposalStatus, 'PENDING'>;

const RESPOND_FAILED = '응답을 보내지 못했어요. 잠시 후 다시 시도해 주세요.';
const RESPOND_SUCCESS: Record<Answer, string> = {
  JOINED: '합류 응답을 보냈어요.',
  DECLINED: '쉬어가기 응답을 보냈어요.',
};

// B03 팀 소식: 받은 제안에 응답하고, 내가 보낸 제안의 팀원별 응답을 확인한다.
// 받은 제안은 미응답 제안을 한 장씩 보여주고, 응답이 저장되면 다음 미응답 제안으로 넘어간다.
export default function TeamNews() {
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [receivedProposals, setReceivedProposals] = useState<ReceivedProposal[]>([]);
  const [sentProposals, setSentProposals] = useState<SentProposal[]>([]);
  const [selectedSentId, setSelectedSentId] = useState<number>();
  const selectedSent =
    sentProposals.find((proposal) => proposal.proposalId === selectedSentId) ?? sentProposals[0];

  // 응답은 제안마다 한 번만 보낼 수 있어 미응답 제안만 한 장씩 보여준다.
  const pendingProposals = receivedProposals.filter((proposal) => proposal.status === 'PENDING');
  const currentProposal = pendingProposals[0];
  // 응답을 보내는 중인 제안. 저장되기 전 버튼을 다시 눌러 중복 응답하지 않도록 잠근다.
  const [respondingId, setRespondingId] = useState<number | null>(null);

  // id: 같은 문구가 연달아 나도 토스트를 새로 띄운다.
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error';
    id: number;
  } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const showToast = (message: string, variant: 'success' | 'error') =>
    setToast((prev) => ({ message, variant, id: (prev?.id ?? 0) + 1 }));

  const loadNews = useCallback(() => {
    fetchTeamNews()
      .then(({ received, sent }) => {
        setReceivedProposals(received);
        setSentProposals(sent);
        setLoadState('success');
        // 화면에 보여준 받은 제안은 읽음 처리한다. 실패해도 화면엔 영향이 없어 조용히 넘긴다.
        markReceivedRead(received).catch(() => {});
      })
      .catch(() => setLoadState('error'));
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const retryLoad = () => {
    setLoadState('loading');
    loadNews();
  };

  // 보고 있는 보낸 제안의 새 응답 · 응답 변경을 확인 처리한다. 같은 제안은 한 번만 보낸다.
  const markedSentIds = useRef(new Set<number>());
  useEffect(() => {
    if (!selectedSent || markedSentIds.current.has(selectedSent.proposalId)) return;
    markedSentIds.current.add(selectedSent.proposalId);
    markResponsesRead(selectedSent)
      .then((marked) => {
        if (!marked) return;
        setSentProposals((prev) =>
          prev.map((proposal) =>
            proposal.proposalId === selectedSent.proposalId
              ? {
                  ...proposal,
                  responses: {
                    ...proposal.responses,
                    recipients: proposal.responses.recipients.map((recipient) => ({
                      ...recipient,
                      responseUnread: false,
                    })),
                  },
                }
              : proposal,
          ),
        );
      })
      .catch(() => markedSentIds.current.delete(selectedSent.proposalId));
  }, [selectedSent]);

  // 서버에 응답을 보내고, 저장되면 그 제안을 응답 완료로 바꿔 다음 미응답 제안이 뜨게 한다.
  const respond = (proposalRecipientId: number, status: Answer) => {
    if (respondingId !== null) return;
    setRespondingId(proposalRecipientId);
    sendResponse(proposalRecipientId, status)
      .then((savedStatus) => {
        setReceivedProposals((prev) =>
          prev.map((proposal) =>
            proposal.proposalRecipientId === proposalRecipientId
              ? { ...proposal, status: savedStatus }
              : proposal,
          ),
        );
        if (savedStatus !== 'PENDING') showToast(RESPOND_SUCCESS[savedStatus], 'success');
      })
      .catch((error: unknown) => showToast(getApiErrorMessage(error, RESPOND_FAILED), 'error'))
      .finally(() => setRespondingId(null));
  };

  const openAnnouncement = (announcementId: number) => navigate(`/contest/${announcementId}`);

  return (
    <Page>
      <AppBar title="팀 소식" icon={mailIcon} onBack={() => navigate('/team')} />

      {loadState === 'loading' && (
        <StatusBox role="status">
          <StatusMessage>팀 소식을 불러오고 있어요.</StatusMessage>
        </StatusBox>
      )}

      {loadState === 'error' && (
        <StatusBox role="alert">
          <StatusMessage>팀 소식을 불러오지 못했어요.</StatusMessage>
          <Button variant="secondary" onClick={retryLoad}>
            다시 시도
          </Button>
        </StatusBox>
      )}

      {loadState === 'success' && (
      <Content>
        <Section>
          <SectionHeader>
            <SectionTitle>받은 제안</SectionTitle>
            {pendingProposals.length > 0 && (
              <RemainingCount>
                남은 제안 <strong>{pendingProposals.length}개</strong>
              </RemainingCount>
            )}
          </SectionHeader>
          {currentProposal ? (
            <ReceivedProposalCard
              key={currentProposal.proposalRecipientId}
              proposal={currentProposal}
              isResponding={respondingId === currentProposal.proposalRecipientId}
              onRespond={(status) => respond(currentProposal.proposalRecipientId, status)}
              onOpenAnnouncement={() => openAnnouncement(currentProposal.announcementId)}
            />
          ) : (
            <EmptyCard>
              {receivedProposals.length > 0 ? '응답할 제안이 없어요.' : '아직 받은 제안이 없어요.'}
            </EmptyCard>
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
      )}

      {toast && (
        <ToastArea>
          <Toast key={toast.id} variant={toast.variant} onClose={closeToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}

      <BottomBar>
        <TabBar activeTab="team" />
      </BottomBar>
    </Page>
  );
}

// 불러오는 중 · 실패 안내. 탭바를 아래에 두도록 남은 높이를 채운다.
const StatusBox = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 24px;
`;

const StatusMessage = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 15px;
  text-align: center;
`;

// 탭바(75) 위 16px
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(75px + 16px);
  left: 50%;
  z-index: 102;
  width: calc(100% - 48px);
  max-width: 354px;
  transform: translateX(-50%);

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
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

// '남은 제안 3개': 숫자만 굵게
const RemainingCount = styled.p`
  margin: 0;
  color: #999896;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;

  strong {
    margin-left: 4px;
    color: #1e1e1e;
    font-weight: 700;
  }
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
