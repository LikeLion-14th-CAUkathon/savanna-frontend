import { useCallback, useState } from 'react';
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
import infoIcon from '../../assets/icons/notice/info.svg';
import { EXPEDITION_STAGE_LABEL } from '../../types/oasis';
import type { ExpeditionStage } from '../../types/oasis';
import type { ChecklistItem, ExpeditionDetail, ExpeditionDetailState } from '../../types/expedition';
import { formatDDay } from '../../utils/dday';
import { formatDateTimeKST } from '../../utils/date';

const MESSAGES = {
  loading: '원정 정보를 불러오는 중이에요.',
  error: '원정 정보를 불러오지 못했어요. 다시 시도해 주세요.',
  outdated: '최신 공고 정보를 확인하지 못했어요. 저장된 정보를 표시합니다.',
  finalCheck: '참가 자격의 최종 기준은 공고 원문을 확인해 주세요.',
  stageChanged: '진행 단계를 변경했어요.',
  stageFailed: '진행 단계를 변경하지 못했어요. 다시 시도해 주세요.',
  saveFailed: '저장하지 못했어요. 다시 시도해 주세요.',
};

// ---------------------------------------------------------------------------
// 테스트용 임시 데이터 (TODO: API 연결 시 이 부분을 지우고 실제 요청·저장으로 교체)
// 기본은 모든 조건 충족 상태. 주소 뒤에 붙여서 다른 상태 확인 (예: /oasis/expeditions/1?preview=issues):
//   ?preview=issues   조건 불일치·확인 필요 + 최신 정보 확인 실패 안내
//   ?preview=empty    공지·체크리스트 없음
//   ?preview=save-error  단계 변경·체크리스트 저장이 모두 실패
//   ?preview=loading  불러오는 중   ?preview=error  조회 실패
// ---------------------------------------------------------------------------
const preview = new URLSearchParams(window.location.search).get('preview');

const SAMPLE_DETAIL: ExpeditionDetail = {
  id: 1,
  contestTitle: '헬스케어 AI 아이디어 공모전',
  organizer: '디지털헬스협회',
  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  contestUrl: 'https://example.com',
  stage: 'DRAFT',
  isContestInfoOutdated: false,
  conditionIssues: [],
  responses: [
    { memberId: 1, name: '김사바나', isMe: true, status: 'JOINED' },
    { memberId: 2, name: '이초원', isMe: false, status: 'JOINED' },
    { memberId: 3, name: '박공모', isMe: false, status: 'RESTING' },
  ],
  stageTargets: [
    { stage: 'KICKOFF', targetDate: '2026-10-27T00:00:00+09:00' },
    { stage: 'DRAFT', targetDate: '2026-11-01T00:00:00+09:00' },
    { stage: 'FINAL_REVIEW', targetDate: '2026-11-05T00:00:00+09:00' },
    { stage: 'SUBMIT', targetDate: '2026-11-11T00:00:00+09:00' },
  ],
  notices: [
    { id: 1, content: '11.04 21:00 제출 양식 같이 채우기' },
    { id: 2, content: '11.06까지 개인정보 수집·이용 동의서 받기' },
  ],
  checklist: [
    { id: 1, content: '제출 작품 · 기획서 PDF 10쪽 이내', done: true },
    { id: 2, content: '참가 신청서', done: true },
    { id: 3, content: '개인정보 수집·이용 동의서 (팀원 전원)', done: false },
  ],
};

const getPreviewState = (): ExpeditionDetailState => {
  if (preview === 'loading') return { status: 'loading' };
  if (preview === 'error') return { status: 'error' };
  if (preview === 'empty') return { status: 'success', data: { ...SAMPLE_DETAIL, notices: [], checklist: [] } };
  if (preview === 'issues') {
    return {
      status: 'success',
      data: {
        ...SAMPLE_DETAIL,
        isContestInfoOutdated: true,
        conditionIssues: [
          {
            id: 1,
            type: 'MISMATCH',
            message: '재학생만 참여할 수 있지만, 합류한 팀원 중 졸업생이 있어요.',
            members: [{ name: '이초원', savedInfo: '졸업', verdict: '재학생 조건 불일치' }],
          },
          { id: 2, type: 'MISMATCH', message: '현재 합류 2명 · 최소 3명 필요', members: [] },
          {
            id: 3,
            type: 'NEEDS_CHECK',
            message: '서울 현장 참석이 필요해요. 합류한 팀원 중 참석 가능 여부를 확인해야 하는 사람이 있어요.',
            members: [{ name: '김사바나', savedInfo: '참석 가능 지역 미입력', verdict: '확인 필요' }],
          },
        ],
        responses: [
          { memberId: 1, name: '김사바나', isMe: true, status: 'JOINED' },
          { memberId: 2, name: '이초원', isMe: false, status: 'JOINED' },
          { memberId: 3, name: '박공모', isMe: false, status: 'PENDING' },
        ],
      },
    };
  }
  return { status: 'success', data: SAMPLE_DETAIL };
};

// 저장 요청 흉내 (0.4초 뒤 성공, save-error면 실패)
const fakeSave = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(preview !== 'save-error'), 400));
// ---------------------------------------------------------------------------

// TODO: API 연결 시 실제 요청으로 교체
const saveStage = (_stage: ExpeditionStage) => fakeSave();
const saveChecklistToggle = (_id: number, _done: boolean) => fakeSave();
const saveChecklistDelete = (_id: number) => fakeSave();
const saveChecklistAdd = (_content: string) => fakeSave();
const saveChecklistUpdate = (_id: number, _content: string) => fakeSave();

// TODO: 라우터 구성 후 이동 연결
//  - 뒤로가기: B03에서 들어왔으면 B03 팀 소식, D01에서 들어왔으면 D01 오아시스
//  - 일정 & 준비사항 편집 / 새 공지: D03 일정·공지 수정
const goBack = () => {};
const goToScheduleEdit = () => {};

type SheetState = { type: 'stage'; initialStage?: ExpeditionStage } | { type: 'submit' } | null;
type ToastState = { variant: 'success' | 'error'; message: string } | null;

export default function ExpeditionDetailPage() {
  const [state] = useState(getPreviewState);
  const retry = () => {}; // TODO: API 연결 시 다시 요청

  const [detail, setDetail] = useState<ExpeditionDetail | null>(state.status === 'success' ? state.data : null);
  const [activeTab, setActiveTab] = useState<DetailTabId>('conditions');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const showSaveFailed = () => setToast({ variant: 'error', message: MESSAGES.saveFailed });

  const updateChecklist = (update: (items: ChecklistItem[]) => ChecklistItem[]) =>
    setDetail((prev) => (prev ? { ...prev, checklist: update(prev.checklist) } : prev));

  // 진행 단계 변경 (제출은 확인창을 한 번 더 거침)
  const changeStage = async (stage: ExpeditionStage) => {
    setIsSavingStage(true);
    const ok = await saveStage(stage);
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
  const toggleItem = async (id: number) => {
    const item = detail?.checklist.find((target) => target.id === id);
    if (!item) return;
    updateChecklist((items) => items.map((target) => (target.id === id ? { ...target, done: !item.done } : target)));
    if (!(await saveChecklistToggle(id, !item.done))) {
      updateChecklist((items) => items.map((target) => (target.id === id ? { ...target, done: item.done } : target)));
      showSaveFailed();
    }
  };

  const deleteItem = async (id: number) => {
    const index = detail?.checklist.findIndex((target) => target.id === id) ?? -1;
    const item = detail?.checklist[index];
    if (!item) return;
    updateChecklist((items) => items.filter((target) => target.id !== id));
    if (!(await saveChecklistDelete(id))) {
      updateChecklist((items) => [...items.slice(0, index), item, ...items.slice(index)]);
      showSaveFailed();
    }
  };

  // 추가·수정은 저장에 성공했을 때만 반영 (실패하면 입력 내용 유지)
  const addItem = async (content: string) => {
    const ok = await saveChecklistAdd(content);
    if (ok) updateChecklist((items) => [...items, { id: Date.now(), content, done: false }]); // TODO: 서버가 준 id 사용
    return ok;
  };

  const updateItem = async (id: number, content: string) => {
    const ok = await saveChecklistUpdate(id, content);
    if (ok) updateChecklist((items) => items.map((target) => (target.id === id ? { ...target, content } : target)));
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
            {detail.organizer} · 접수 마감 {formatDateTimeKST(detail.deadline)} · {formatDDay(detail.deadline)}
          </Meta>
        </Header>

        {detail.isContestInfoOutdated && <Notice icon={infoIcon}>{MESSAGES.outdated}</Notice>}

        <FullWidthButton
          variant="secondary"
          onClick={() => window.open(detail.contestUrl, '_blank', 'noopener,noreferrer')}
        >
          공고 원문 보기 ↗
        </FullWidthButton>

        <DetailTabs activeTab={activeTab} onChange={setActiveTab} />

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
            <Section title="공지" actionLabel="새 공지" onAction={goToScheduleEdit}>
              <NoticeList notices={detail.notices} />
            </Section>
            <Section title="제출 체크리스트" actionLabel="+ 추가" onAction={() => setIsAddingItem(true)}>
              <SubmitChecklist
                items={detail.checklist}
                isAdding={isAddingItem}
                onCancelAdd={() => setIsAddingItem(false)}
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
