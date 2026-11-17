import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Notice from '../../components/common/Notice';
import Toast from '../../components/toast/Toast';
import StatusPill from '../../components/oasis/detail/StatusPill';
import DetailTabs from '../../components/oasis/detail/DetailTabs';
import type { DetailTabId } from '../../components/oasis/detail/DetailTabs';
import Section from '../../components/oasis/detail/Section';
import ConditionCheck from '../../components/oasis/detail/ConditionCheck';
import ResponseStatus from '../../components/oasis/detail/ResponseStatus';
import TeamPrepCard from '../../components/oasis/detail/TeamPrepCard';
import SubmitChecklist from '../../components/oasis/detail/SubmitChecklist';
import StageSelectSheet from '../../components/oasis/detail/StageSelectSheet';
import SubmitConfirmSheet from '../../components/oasis/detail/SubmitConfirmSheet';
import DeleteExpeditionDialog from '../../components/oasis/detail/DeleteExpeditionDialog';
import {
  addChecklistItem,
  fetchExpeditionDetail,
  removeChecklistItem,
  removeExpedition,
  renameChecklistItem,
  respondToExpedition,
  saveStage,
  toggleChecklistItem,
} from '../../components/oasis/oasisData';
import ResponseButtons from '../../components/oasis/detail/ResponseButtons';
import { getApiErrorMessage } from '../../api/client';
import infoIcon from '../../assets/icons/notice/info.svg';
import trashIcon from '../../assets/icons/app-bar/appbar-trash.svg';
import { EXPEDITION_STAGE_LABEL } from '../../types/oasis';
import type { ExpeditionStage } from '../../types/oasis';
import type { ChecklistItem, ExpeditionDetail, ExpeditionDetailState } from '../../types/expedition';
import { formatDDay } from '../../utils/dday';
import { formatDate } from '../../utils/date';
import { OASIS_PATHS } from '../../routes/oasisPaths';

const MESSAGES = {
  loading: '원정 정보를 불러오는 중이에요.',
  error: '원정 정보를 불러오지 못했어요. 다시 시도해 주세요.',
  outdated: '최신 공고 정보를 확인하지 못했어요. 저장된 정보를 표시합니다.',
  finalCheck: '참가 자격의 최종 기준은 공고 원문을 확인해 주세요.',
  stageChanged: '진행 단계를 변경했어요.',
  stageFailed: '진행 단계를 변경하지 못했어요. 다시 시도해 주세요.',
  saveFailed: '저장하지 못했어요. 다시 시도해 주세요.',
  joined: '원정에 합류했어요.',
  rested: '이번 원정은 쉬어가요.',
  respondFailed: '응답하지 못했어요. 다시 시도해 주세요.',
  deleteFailed: '원정을 삭제하지 못했어요. 다시 시도해 주세요.',
  // 제안 뒤에 팀에 합류해 받은 제안 기록이 아직 없을 때 (백엔드 반영 전)
  cannotRespond: '아직 이 제안에 응답할 수 없어요. 잠시 후 다시 시도해 주세요.',
};

// 저장 요청이 성공하면 true, 실패하면 false
const succeeded = (request: Promise<unknown>) =>
  request.then(
    () => true,
    () => false,
  );

type SheetState = { type: 'stage'; initialStage?: ExpeditionStage } | { type: 'submit' } | { type: 'delete' } | null;
type ToastState = { variant: 'success' | 'error'; message: string } | null;

export default function ExpeditionDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { expeditionId = '' } = useParams();
  const id = Number(expeditionId);
  const [searchParams, setSearchParams] = useSearchParams();

  const [state, setState] = useState<ExpeditionDetailState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  };

  // 화면에서 바로 고치는 값(단계·체크리스트)은 detail에 따로 들고 있음
  const [detail, setDetail] = useState<ExpeditionDetail | null>(null);

  useEffect(() => {
    let ignore = false; // 화면을 떠난 뒤 도착한 응답은 무시
    fetchExpeditionDetail(id)
      .then((data) => {
        if (ignore) return;
        setState({ status: 'success', data });
        setDetail(data);
      })
      .catch(() => {
        if (!ignore) setState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  // 탭은 주소(?tab=schedule)에 담아서, D03에 갔다 돌아와도 보던 탭 유지
  const activeTab: DetailTabId = searchParams.get('tab') === 'schedule' ? 'schedule' : 'conditions';
  const changeTab = (tab: DetailTabId) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'schedule') next.set('tab', 'schedule');
        else next.delete('tab');
        return next;
      },
      { replace: true },
    );

  // 뒤로가기: 들어온 화면(D01 오아시스 또는 B03 팀 소식)으로. 주소로 바로 들어왔으면 D01로
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate(OASIS_PATHS.home));
  const goToScheduleEdit = () => navigate(OASIS_PATHS.scheduleEdit(expeditionId));
  const [sheet, setSheet] = useState<SheetState>(null);
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const showSaveFailed = () => setToast({ variant: 'error', message: MESSAGES.saveFailed });

  // 합류 · 쉬어가기 응답 (성공하면 내 응답 상태와 응답 현황의 내 줄을 바꿈)
  const respond = async (joined: boolean) => {
    const recipientId = detail?.myResponse?.proposalRecipientId;
    if (recipientId == null) {
      setToast({ variant: 'error', message: MESSAGES.cannotRespond });
      return;
    }
    setIsResponding(true);
    try {
      await respondToExpedition(recipientId, joined);
      const status = joined ? 'JOINED' : 'RESTING';
      setDetail((prev) =>
        prev && {
          ...prev,
          myResponse: { status, proposalRecipientId: recipientId },
          responses: prev.responses.map((response) => (response.isMe ? { ...response, status } : response)),
        },
      );
      setToast({ variant: 'success', message: joined ? MESSAGES.joined : MESSAGES.rested });
    } catch (error) {
      setToast({ variant: 'error', message: getApiErrorMessage(error, MESSAGES.respondFailed) });
    } finally {
      setIsResponding(false);
    }
  };

  const updateChecklist = (update: (items: ChecklistItem[]) => ChecklistItem[]) =>
    setDetail((prev) => (prev ? { ...prev, checklist: update(prev.checklist) } : prev));

  // 진행 단계 변경 (제출은 확인창을 한 번 더 거침)
  const changeStage = async (stage: ExpeditionStage) => {
    setIsSavingStage(true);
    const ok = await succeeded(saveStage(id, stage));
    setIsSavingStage(false);

    if (!ok) {
      setToast({ variant: 'error', message: MESSAGES.stageFailed }); // 기존 단계 유지, 창은 열어둬서 다시 시도
      return;
    }
    setDetail((prev) => (prev ? { ...prev, stage } : prev));
    setSheet(null);
    setToast({ variant: 'success', message: MESSAGES.stageChanged });
  };

  // 원정 삭제: 성공하면 D01 오아시스로(뒤로가기로 지워진 원정에 다시 오지 않게 기록을 바꿈),
  // 실패하면 이 화면에 머물고 토스트로 알린다.
  const deleteCurrentExpedition = async () => {
    setIsDeleting(true);
    const ok = await succeeded(removeExpedition(id));
    setIsDeleting(false);

    if (!ok) {
      setSheet(null);
      setToast({ variant: 'error', message: MESSAGES.deleteFailed });
      return;
    }
    navigate(OASIS_PATHS.home, { replace: true });
  };

  const handleStageConfirm = (stage: ExpeditionStage) => {
    if (stage === 'SUBMIT') setSheet({ type: 'submit' });
    else changeStage(stage);
  };

  // 체크·해제·삭제는 화면에 먼저 반영하고, 저장 실패하면 되돌림
  const toggleItem = async (itemId: number) => {
    const item = detail?.checklist.find((target) => target.id === itemId);
    if (!item) return;
    updateChecklist((items) => items.map((target) => (target.id === itemId ? { ...target, done: !item.done } : target)));
    if (!(await succeeded(toggleChecklistItem(itemId, !item.done)))) {
      updateChecklist((items) => items.map((target) => (target.id === itemId ? { ...target, done: item.done } : target)));
      showSaveFailed();
    }
  };

  const deleteItem = async (itemId: number) => {
    const index = detail?.checklist.findIndex((target) => target.id === itemId) ?? -1;
    const item = detail?.checklist[index];
    if (!item) return;
    updateChecklist((items) => items.filter((target) => target.id !== itemId));
    if (!(await succeeded(removeChecklistItem(itemId)))) {
      updateChecklist((items) => [...items.slice(0, index), item, ...items.slice(index)]);
      showSaveFailed();
    }
  };

  // 추가·수정은 저장에 성공했을 때만 반영 (실패하면 입력 내용 유지)
  const addItem = async (content: string) => {
    try {
      const created = await addChecklistItem(id, content);
      updateChecklist((items) => [...items, created]);
      return true;
    } catch {
      return false;
    }
  };

  const updateItem = async (itemId: number, content: string) => {
    const ok = await succeeded(renameChecklistItem(itemId, content));
    if (ok) updateChecklist((items) => items.map((target) => (target.id === itemId ? { ...target, content } : target)));
    return ok;
  };

  if (state.status !== 'success' || !detail) {
    return (
      <Page aria-busy={state.status === 'loading'}>
        <AppBar title="원정 상세" onBack={goBack} />
        <StateBox>
          {state.status === 'loading' ? (
            <StateText role="status">{MESSAGES.loading}</StateText>
          ) : (
            <>
              <StateText role="alert">{MESSAGES.error}</StateText>
              <Button variant="secondary" onClick={retry}>
                다시 시도
              </Button>
            </>
          )}
        </StateBox>
      </Page>
    );
  }

  return (
    <Page>
      <AppBar
        title="원정 상세"
        onBack={goBack}
        action={{ icon: trashIcon, label: '원정 삭제', onClick: () => setSheet({ type: 'delete' }) }}
      />

      <Body>
        <Header>
          <StatusPill tone="amber">{EXPEDITION_STAGE_LABEL[detail.stage]}</StatusPill>
          <ContestTitle>{detail.contestTitle}</ContestTitle>
          <Meta>
            {detail.organizer} · 접수 마감 {formatDate(detail.deadline)} · {formatDDay(detail.deadline)}
          </Meta>
        </Header>

        {detail.isContestInfoOutdated && <Notice icon={infoIcon}>{MESSAGES.outdated}</Notice>}

        {detail.contestUrl && (
          <FullWidthButton
            variant="secondary"
            onClick={() => window.open(detail.contestUrl, '_blank', 'noopener,noreferrer')}
          >
            공고 원문 보기 ↗
          </FullWidthButton>
        )}

        <DetailTabs activeTab={activeTab} onChange={changeTab} />

        {activeTab === 'conditions' ? (
          <>
            <Section title="참가 조건 확인">
              <ConditionCheck issues={detail.conditionIssues} />
              <FinalCheckText>{MESSAGES.finalCheck}</FinalCheckText>
            </Section>
            <Section title="제안과 응답 현황">
              <ResponseStatus responses={detail.responses} />
            </Section>
            {/* 제안자는 응답할 수 없어서 버튼 없음 */}
            {detail.myResponse && detail.myResponse.status !== 'SENDER' && (
              <ResponseButtons status={detail.myResponse.status} isSaving={isResponding} onRespond={respond} />
            )}
          </>
        ) : (
          <>
            <EditButton onClick={goToScheduleEdit}>일정 & 준비사항 편집</EditButton>
            <TeamPrepCard
              currentStage={detail.stage}
              targets={detail.stageTargets}
              notices={detail.notices}
              onChangeStage={() => setSheet({ type: 'stage' })}
            />
            <SubmitChecklist
              items={detail.checklist}
              onAdd={addItem}
              onUpdate={updateItem}
              onToggle={toggleItem}
              onDelete={deleteItem}
            />
          </>
        )}
      </Body>

      {sheet?.type === 'stage' && (
        <StageSelectSheet
          currentStage={detail.stage}
          initialStage={sheet.initialStage}
          isSaving={isSavingStage}
          onClose={closeSheet}
          onConfirm={handleStageConfirm}
        />
      )}

      {sheet?.type === 'submit' && (
        <SubmitConfirmSheet
          isSaving={isSavingStage}
          onClose={closeSheet}
          onCancel={() => setSheet({ type: 'stage', initialStage: 'SUBMIT' })}
          onConfirm={() => changeStage('SUBMIT')}
        />
      )}

      {sheet?.type === 'delete' && (
        <DeleteExpeditionDialog isDeleting={isDeleting} onClose={closeSheet} onConfirm={deleteCurrentExpedition} />
      )}

      {toast && (
        <ToastArea>
          <Toast key={toast.message + toast.variant} variant={toast.variant} onClose={closeToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}
    </Page>
  );
}

const Page = styled.main`
  box-sizing: border-box;
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: var(--color-bg);

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }

  /* 태블릿·노트북에서는 가운데 폰 화면 프레임 안에서 스크롤한다. */
  @media (min-width: 481px) {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;

    /* 내용이 프레임보다 길면 헤더 등이 눌려 줄어들지 않고 스크롤되게 한다. */
    & > * {
      flex-shrink: 0;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 40px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const ContestTitle = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 22px;
  font-weight: 700;
  word-break: keep-all;
`;

const Meta = styled.p`
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

const EditButton = styled(Button)`
  width: 100%;
  height: 44px;
`;

const FinalCheckText = styled.p`
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 300;
`;

const StateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 120px 24px;
  text-align: center;
`;

const StateText = styled.p`
  color: var(--color-text-secondary);
  font-size: 15px;
  word-break: keep-all;
`;

const ToastArea = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: 20;
  width: calc(100% - 48px);
  max-width: 354px;
  transform: translateX(-50%);

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
`;
