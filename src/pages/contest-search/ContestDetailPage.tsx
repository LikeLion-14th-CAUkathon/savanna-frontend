import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import styled from 'styled-components';
import Button from '../../components/common/Button';
import StatusMessage from '../../components/contest-search/StatusMessage';
import DetailAppBar from '../../components/contest-search/c03-contest-detail/DetailAppBar';
import ScheduleCard from '../../components/contest-search/c03-contest-detail/ScheduleCard';
import InfoCard from '../../components/contest-search/c03-contest-detail/InfoCard';
import ApplicationCard from '../../components/contest-search/c03-contest-detail/ApplicationCard';
import ProposalSheet from '../../components/contest-search/c04-participation-proposal/ProposalSheet';
import Toast from '../../components/toast/Toast';
import {
  CONTEST_PHASE_LABEL,
  getContestPhase,
  type ContestPhase,
} from '../../components/contest-search/c03-contest-detail/contestPhase';
import { MOCK_TODAY, fetchContestDetail } from '../../mocks/contests';
import type { ContestDetail } from '../../types/contest';

type LoadState = 'loading' | 'success' | 'not-found' | 'error';

const PROPOSAL_TOAST = {
  sent: { variant: 'success', message: '팀원에게 참여 제안을 보냈어요.' },
  'send-error': { variant: 'error', message: '제안을 보내지 못했어요. 다시 시도해 주세요.' },
} as const;

type ProposalToast = keyof typeof PROPOSAL_TOAST;

// C03 공고 상세
export default function ContestDetailPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<ContestDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const loadDetail = useCallback(() => {
    fetchContestDetail(Number(contestId))
      .then((result) => {
        setDetail(result);
        setLoadState(result ? 'success' : 'not-found');
      })
      .catch(() => setLoadState('error'));
  }, [contestId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const retryLoad = () => {
    setLoadState('loading');
    loadDetail();
  };

  // 바로 이 주소로 들어온 경우(이전 기록 없음)엔 공고 찾기로 보낸다.
  const goBack = () => {
    if (location.key === 'default') navigate('/contest');
    else navigate(-1);
  };

  return (
    <Page>
      <DetailAppBar title="공고 상세" onBack={goBack} />

      {loadState === 'loading' && <StatusMessage title="공고를 불러오는 중이에요." />}
      {loadState === 'not-found' && (
        <StatusMessage
          title="공고를 찾을 수 없어요."
          description="삭제되었거나 주소가 잘못되었어요."
          actionLabel="공고 찾기로 가기"
          onAction={() => navigate('/contest')}
        />
      )}
      {loadState === 'error' && (
        <StatusMessage
          title="공고를 불러오지 못했어요."
          description="잠시 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={retryLoad}
        />
      )}

      {loadState === 'success' && detail && <DetailContent detail={detail} today={MOCK_TODAY} />}
    </Page>
  );
}

function DetailContent({ detail, today }: { detail: ContestDetail; today: Date }) {
  const startAt = new Date(detail.startAt);
  const deadlineAt = new Date(detail.deadlineAt);
  const phase = getContestPhase(startAt, deadlineAt, today);
  const isClosed = phase === 'closed';

  const [isProposalOpen, setIsProposalOpen] = useState(false);
  // id: 같은 토스트가 연달아 떠도 새로 그려서 타이머를 다시 시작한다.
  const [toastState, setToastState] = useState<{ type: ProposalToast; id: number } | null>(null);
  const toast = toastState ? PROPOSAL_TOAST[toastState.type] : null;
  const showToast = (type: ProposalToast) => setToastState((prev) => ({ type, id: (prev?.id ?? 0) + 1 }));

  const openSource = () => window.open(detail.sourceUrl, '_blank', 'noopener,noreferrer');

  const closeProposal = useCallback(() => setIsProposalOpen(false), []);
  const closeToast = useCallback(() => setToastState(null), []);

  const handleProposalSent = () => {
    setIsProposalOpen(false);
    showToast('sent');
  };

  // 실패하면 시트는 열어 둔 채로 버튼 위에 알린다.
  const handleProposalError = () => showToast('send-error');

  return (
    <>
      <Content>
        <Heading>
          <PhasePill $phase={phase}>{CONTEST_PHASE_LABEL[phase]}</PhasePill>
          <Title>{detail.title}</Title>
          <Meta>{detail.host}</Meta>
        </Heading>

        <Button variant="secondary" onClick={openSource}>
          공고 원문 보기 ↗
        </Button>

        <ScheduleCard
          phase={phase}
          startAt={detail.startAt}
          deadlineAt={detail.deadlineAt}
          today={today.toISOString()}
        />

        <InfoCard
          title="참가 조건"
          items={[
            { label: '참가 대상', value: detail.eligibility.target },
            { label: '인원', value: detail.eligibility.teamSize },
            { label: '지역', value: detail.eligibility.region },
          ]}
        />

        <InfoCard
          title="공모 내용"
          items={[
            { label: '공모 주제', value: detail.overview.topic },
            { label: '심사기준', value: detail.overview.criteria },
          ]}
        />

        <ApplicationCard application={detail.application} />

        <Notice $danger={isClosed}>
          {isClosed
            ? '접수가 마감된 공고예요.'
            : '참여 제안은 팀원에게 보내는 제안이에요. 실제 지원은 주최 측 사이트에서 진행해 주세요.'}
        </Notice>
      </Content>

      <BottomBar>
        <ProposeButton disabled={isClosed} onClick={() => setIsProposalOpen(true)}>
          참여 제안하기
        </ProposeButton>
      </BottomBar>

      {isProposalOpen && (
        <ProposalSheet
          contest={detail}
          today={today}
          onClose={closeProposal}
          onSent={handleProposalSent}
          onSendError={handleProposalError}
        />
      )}

      {toastState && toast && (
        <ToastArea>
          <Toast key={toastState.id} variant={toast.variant} onClose={closeToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}
    </>
  );
}

const PHASE_PILL_COLORS: Record<ContestPhase, { background: string; color: string }> = {
  open: { background: '#eaeadb', color: '#5a6628' },
  upcoming: { background: '#e9f4fb', color: '#2e74a6' },
  closed: { background: '#f1f0ec', color: '#5b5b5b' },
};

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
`;

const Content = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 4px 24px 20px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
`;

const PhasePill = styled.span<{ $phase: ContestPhase }>`
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ $phase }) => PHASE_PILL_COLORS[$phase].background};
  color: ${({ $phase }) => PHASE_PILL_COLORS[$phase].color};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const Title = styled.h2`
  color: #1e1e1e;
  font-size: 22px;
  font-weight: 700;
  word-break: keep-all;
`;

const Meta = styled.p`
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;

const Notice = styled.p<{ $danger: boolean }>`
  color: ${({ $danger }) => ($danger ? '#b3261e' : '#999896')};
  font-size: 12px;
  font-weight: 400;
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

// 하단 버튼(시트의 '제안 보내기' 52px + 그림자 4px, 아래 여백 34px) 위 16px. 시트(z-index 101)보다 위
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(34px + 52px + 4px + 16px);
  left: 50%;
  z-index: 102;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;

// 공통 Button에는 비활성 모양이 없어서 여기서만 덧입힌다.
const ProposeButton = styled(Button)`
  width: 100%;

  &:disabled {
    background: #efeeea;
    box-shadow: none;
    color: #c4c3c0;
    cursor: not-allowed;
  }
`;
