import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import styled from 'styled-components';
import { getApiErrorMessage } from '../../api/client';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import Section from '../../components/oasis/detail/Section';
import TargetDateList from '../../components/oasis/schedule-edit/TargetDateList';
import NoticeEditor from '../../components/oasis/schedule-edit/NoticeEditor';
import type { EditableNotice } from '../../components/oasis/schedule-edit/NoticeEditor';
import {
  addNotice as addNoticeRequest,
  fetchScheduleEdit,
  removeNotice,
  saveStageTargets,
  updateNotice,
} from '../../components/oasis/oasisData';
import type { ExpeditionStage } from '../../types/oasis';
import type { ExpeditionNotice, ScheduleEditState, StageTarget } from '../../types/expedition';
import { formatMonthDay } from '../../utils/date';
import { OASIS_PATHS } from '../../routes/oasisPaths';

const MESSAGES = {
  loading: '일정 정보를 불러오는 중이에요.',
  error: '일정 정보를 불러오지 못했어요. 다시 시도해 주세요.',
  guide: "목표일·공지 변경을 '변경 저장'으로 한 번에 저장해요.",
  emptyNotice: '공지 내용을 입력해 주세요.',
  saved: '일정과 공지를 저장했어요.',
  saveFailed: '저장하지 못했어요. 다시 시도해 주세요.',
};

const toEditable = (notices: ExpeditionNotice[]): EditableNotice[] =>
  notices.map((notice) => ({ key: `saved-${notice.id}`, id: notice.id, content: notice.content, error: '' }));

export default function ScheduleEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { expeditionId = '' } = useParams();
  const id = Number(expeditionId);

  const [state, setState] = useState<ScheduleEditState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  };
  const initial = state.status === 'success' ? state.data : null;

  const [targets, setTargets] = useState<StageTarget[]>([]);
  const [notices, setNotices] = useState<EditableNotice[]>([]);
  // 서버에 저장된 공지. 저장할 때 이것과 비교해서 추가·수정·삭제할 것을 고른다
  const [savedNotices, setSavedNotices] = useState<ExpeditionNotice[]>([]);

  useEffect(() => {
    let ignore = false; // 화면을 떠난 뒤 도착한 응답은 무시
    fetchScheduleEdit(id)
      .then((data) => {
        if (ignore) return;
        setState({ status: 'success', data });
        setTargets(data.stageTargets);
        setNotices(toEditable(data.notices));
        setSavedNotices(data.notices);
      })
      .catch(() => {
        if (!ignore) setState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

 
  const goBackToDetail = useCallback(() => {
    if (location.key !== 'default') navigate(-1);
    else navigate(`${OASIS_PATHS.expeditionDetail(expeditionId)}?tab=schedule`, { replace: true });
  }, [location.key, navigate, expeditionId]);

  const closeToast = useCallback(() => {
    setToast(null);
    if (isSaved) goBackToDetail(); // 저장 안내를 보여준 뒤 D02로
  }, [isSaved, goBackToDetail]);

  const changeTarget = (stage: ExpeditionStage, targetDate: string | null) =>
    setTargets((prev) => {
      const exists = prev.some((target) => target.stage === stage);
      if (!exists) return [...prev, { stage, targetDate }];
      return prev.map((target) => (target.stage === stage ? { ...target, targetDate } : target));
    });

  const addNotice = () => {
    const key = `new-${Date.now()}`;
    setNotices((prev) => [...prev, { key, id: null, content: '', error: '' }]);
    setFocusKey(key);
  };

  const changeNotice = (key: string, content: string) =>
    setNotices((prev) => prev.map((notice) => (notice.key === key ? { ...notice, content, error: '' } : notice)));

  const deleteNotice = (key: string) => setNotices((prev) => prev.filter((notice) => notice.key !== key));

  const handleSave = async () => {
    if (!initial || isSaving) return;

    // 비어 있는 공지는 저장하지 않고 해당 칸에 안내
    const checked = notices.map((notice) => ({ ...notice, error: notice.content.trim() ? '' : MESSAGES.emptyNotice }));
    setNotices(checked);
    if (checked.some((notice) => notice.error)) return;

    setIsSaving(true);

    // 하나씩 저장하면서 성공한 것은 바로 반영 → 중간에 실패해도 다시 저장할 때 중복 생성되지 않음
    let saved = savedNotices;
    const current = checked.map((notice) => ({ ...notice, content: notice.content.trim() }));
    try {
      await saveStageTargets(id, targets);

      const keptIds = new Set(current.map((notice) => notice.id));
      for (const notice of saved.filter((target) => !keptIds.has(target.id))) {
        await removeNotice(notice.id);
        saved = saved.filter((target) => target.id !== notice.id);
      }

      for (const notice of current) {
        if (notice.id === null) {
          const created = await addNoticeRequest(id, notice.content);
          notice.id = created.id;
          saved = [...saved, created];
        } else if (saved.find((target) => target.id === notice.id)?.content !== notice.content) {
          await updateNotice(notice.id, notice.content);
          saved = saved.map((target) => (target.id === notice.id ? { ...target, content: notice.content } : target));
        }
      }

      setIsSaved(true);
      setToast({ variant: 'success', message: MESSAGES.saved });
    } catch (error) {
      // 입력 내용은 그대로 유지. 목표일 순서가 맞지 않는 경우 등은 서버 안내 문구를 보여줌
      setToast({ variant: 'error', message: getApiErrorMessage(error, MESSAGES.saveFailed) });
    } finally {
      setSavedNotices(saved);
      setNotices(current);
      setIsSaving(false);
    }
  };

  if (!initial) {
    return (
      <Page aria-busy={state.status === 'loading'}>
        <AppBar title="일정 & 준비사항 편집" onBack={goBackToDetail} />
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
      <AppBar title="일정 & 준비사항 편집" onBack={goBackToDetail} />

      <Body>
        <ContestTitle>{initial.contestTitle}</ContestTitle>

        <Section title="공식 일정">
          <OfficialCard>
            <OfficialRow>
              <OfficialLabel>접수 시작</OfficialLabel>
              <OfficialValue>{initial.applyStartAt ? formatMonthDay(initial.applyStartAt) : '-'}</OfficialValue>
            </OfficialRow>
            <OfficialRow>
              <OfficialLabel>접수 마감</OfficialLabel>
              <OfficialValue>{formatMonthDay(initial.deadline)}</OfficialValue>
            </OfficialRow>
          </OfficialCard>
        </Section>

        <Section title="팀 준비 목표일">
          <TargetDateList currentStage={initial.stage} targets={targets} onChange={changeTarget} />
        </Section>

        <Section title="공지" actionLabel="+ 공지 추가" onAction={addNotice}>
          <NoticeEditor notices={notices} focusKey={focusKey} onChange={changeNotice} onDelete={deleteNotice} />
          <GuideText>{MESSAGES.guide}</GuideText>
        </Section>
      </Body>

      <BottomBar>
        <SaveButton disabled={isSaving || isSaved} onClick={handleSave}>
          변경 저장
        </SaveButton>
      </BottomBar>

      {toast && (
        <ToastArea>
          <Toast key={toast.message} variant={toast.variant} onClose={closeToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}
    </Page>
  );
}

const Page = styled.main`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: var(--color-bg);
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 32px;
`;

const ContestTitle = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 17px;
  font-weight: 700;
  word-break: keep-all;
`;

const OfficialCard = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
`;

const OfficialRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
`;

const OfficialLabel = styled.dt`
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const OfficialValue = styled.dd`
  margin: 0;
  color: var(--color-ink);
  font-weight: 700;
`;

const GuideText = styled.p`
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 300;
`;

// 화면 아래에 붙어 있는 저장 버튼 영역
const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  box-sizing: border-box;
  padding: 12px 24px 34px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
`;

const SaveButton = styled(Button)`
  width: 100%;
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
  bottom: 110px;
  left: 50%;
  z-index: 20;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;
