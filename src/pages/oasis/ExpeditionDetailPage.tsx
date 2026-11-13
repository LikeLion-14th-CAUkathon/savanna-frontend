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
import StageProgress from '../../components/oasis/detail/StageProgress';
import NoticeList from '../../components/oasis/detail/NoticeList';
import SubmitChecklist from '../../components/oasis/detail/SubmitChecklist';
import StageSelectSheet from '../../components/oasis/detail/StageSelectSheet';
import SubmitConfirmSheet from '../../components/oasis/detail/SubmitConfirmSheet';
import {
  addChecklistItem,
  fetchExpeditionDetail,
  removeChecklistItem,
  renameChecklistItem,
  saveStage,
  toggleChecklistItem,
} from '../../components/oasis/oasisData';
import infoIcon from '../../assets/icons/notice/info.svg';
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
};

// 저장 요청이 성공하면 true, 실패하면 false
const succeeded = (request: Promise<unknown>) =>
  request.then(
    () => true,
    () => false,
  );

type SheetState = { type: 'stage'; initialStage?: ExpeditionStage } | { type: 'submit' } | null;
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
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const showSaveFailed = () => setToast({ variant: 'error', message: MESSAGES.saveFailed });

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
      <AppBar title="원정 상세" onBack={goBack} />

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
          </>
        ) : (
          <>
            <EditButton onClick={goToScheduleEdit}>일정 & 준비사항 편집</EditButton>
            <Section title="팀 준비 일정 · 목표일" actionLabel="변경" onAction={() => setSheet({ type: 'stage' })}>
              <StageProgress currentStage={detail.stage} targets={detail.stageTargets} />
            </Section>
            <Section title="공지">
              <NoticeList notices={detail.notices} />
            </Section>
            <Section title="제출 체크리스트">
              <SubmitChecklist
                items={detail.checklist}
                onAdd={addItem}
                onUpdate={updateItem}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            </Section>
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
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: var(--color-bg);
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
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;
