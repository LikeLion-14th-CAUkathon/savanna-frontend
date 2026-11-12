import { useCallback, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import Section from '../../components/oasis/detail/Section';
import TargetDateList from '../../components/oasis/schedule-edit/TargetDateList';
import NoticeEditor from '../../components/oasis/schedule-edit/NoticeEditor';
import type { EditableNotice } from '../../components/oasis/schedule-edit/NoticeEditor';
import type { ExpeditionStage } from '../../types/oasis';
import type { ExpeditionNotice, ScheduleEditData, ScheduleEditState, StageTarget } from '../../types/expedition';
import { formatMonthDay, formatMonthDayTime } from '../../utils/date';
import { OASIS_PATHS } from '../../routes/oasisPaths';

const MESSAGES = {
  loading: '일정 정보를 불러오는 중이에요.',
  error: '일정 정보를 불러오지 못했어요. 다시 시도해 주세요.',
  guide: "목표일·공지 변경을 '변경 저장'으로 한 번에 저장해요.",
  emptyNotice: '공지 내용을 입력해 주세요.',
  saved: '일정과 공지를 저장했어요.',
  saveFailed: '저장하지 못했어요. 다시 시도해 주세요.',
};

// ---------------------------------------------------------------------------
// 테스트용 임시 데이터 (TODO: API 연결 시 이 부분을 지우고 실제 요청·저장으로 교체)
// 주소 뒤에 붙여서 다른 상태 확인 (예: /oasis/expeditions/1/schedule?preview=empty):
//   ?preview=empty  공지 없음   ?preview=save-error  저장 실패
//   ?preview=loading  불러오는 중   ?preview=error  조회 실패
// ---------------------------------------------------------------------------
const preview = new URLSearchParams(window.location.search).get('preview');

const SAMPLE_SCHEDULE: ScheduleEditData = {
  expeditionId: 1,
  contestTitle: '헬스케어 AI 아이디어 공모전',
  applyStartAt: '2026-10-20T00:00:00+09:00',
  deadline: '2026-11-14T18:00:00+09:00',
  stage: 'DRAFT',
  stageTargets: [
    { stage: 'KICKOFF', targetDate: '2026-10-27T00:00:00+09:00' },
    { stage: 'DRAFT', targetDate: '2026-11-01T00:00:00+09:00' },
    { stage: 'FINAL_REVIEW', targetDate: '2026-11-05T00:00:00+09:00' },
    { stage: 'SUBMIT', targetDate: '2026-11-11T00:00:00+09:00' },
  ],
  notices: [
    { id: 1, content: '11.04 21:00 제출 양식 같이 채우기' },
    { id: 2, content: '11.06까지 개인정보 수집 & 이용 동의서 받기' },
  ],
};

const getPreviewState = (): ScheduleEditState => {
  if (preview === 'loading') return { status: 'loading' };
  if (preview === 'error') return { status: 'error' };
  if (preview === 'empty') return { status: 'success', data: { ...SAMPLE_SCHEDULE, notices: [] } };
  return { status: 'success', data: SAMPLE_SCHEDULE };
};

// 저장 요청(0.5초 뒤 성공, save-error면 실패)
const fakeSave = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(preview !== 'save-error'), 500));
// ---------------------------------------------------------------------------

// TODO: API 연결 시 실제 요청으로 교체
const saveSchedule = (_expeditionId: number, _targets: StageTarget[], _notices: ExpeditionNotice[]) => fakeSave();

const toEditable = (notices: ExpeditionNotice[]): EditableNotice[] =>
  notices.map((notice) => ({ key: `saved-${notice.id}`, id: notice.id, content: notice.content, error: '' }));

export default function ScheduleEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { expeditionId = '' } = useParams();

  const [state] = useState(getPreviewState);
  const retry = () => {}; // TODO: API 연결 시 다시 요청
  const initial = state.status === 'success' ? state.data : null;

  const [targets, setTargets] = useState<StageTarget[]>(initial?.stageTargets ?? []);
  const [notices, setNotices] = useState<EditableNotice[]>(toEditable(initial?.notices ?? []));
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
    const ok = await saveSchedule(
      initial.expeditionId,
      targets,
      checked.map((notice) => ({ id: notice.id ?? 0, content: notice.content.trim() })), 
    );
    setIsSaving(false);

    if (ok) {
      setIsSaved(true);
      setToast({ variant: 'success', message: MESSAGES.saved });
    } else {
      setToast({ variant: 'error', message: MESSAGES.saveFailed }); // 입력 내용은 그대로 유지
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
              <OfficialValue>{formatMonthDay(initial.applyStartAt)}</OfficialValue>
            </OfficialRow>
            <OfficialRow>
              <OfficialLabel>접수 마감</OfficialLabel>
              <OfficialValue>{formatMonthDayTime(initial.deadline)}</OfficialValue>
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
