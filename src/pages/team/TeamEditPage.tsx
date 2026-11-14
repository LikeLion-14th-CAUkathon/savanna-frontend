import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import TeamAvatar from '../../components/common/TeamAvatar';
import Toast from '../../components/toast/Toast';
import TeamInfoFields from '../../components/team/team-form/TeamInfoFields';
import TeamPhotoCaption from '../../components/team/team-form/TeamPhotoCaption';
import { getApiErrorMessage } from '../../api/client';
import { getTeamDetail, updateTeam, type TeamInfo } from '../../api/team';
import { resolveTeamId } from '../../components/team/team-space/teamSpaceData';
import type { TeamEditLocationState, TeamSpaceLocationState } from '../../types/team';
import { getTeamFormErrors, toTeamForm, toTeamRequest, type TeamForm } from '../../utils/teamForm';
import { useFileDataUrl } from '../../utils/useFileDataUrl';

const LOAD_FAILED = '팀 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
const SAVE_FAILED = '팀 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
const NO_TEAM = '소속된 팀이 없어요.';
const NO_PERMISSION = '이 팀의 정보를 수정할 수 없어요.';
const NOT_FOUND = '팀을 찾을 수 없어요.';

const getStatus = (error: unknown) => (isAxiosError(error) ? error.response?.status : undefined);

// 불러오기 실패 안내. 403은 팀에 소속되지 않음, 404는 없는 팀
const getLoadErrorMessage = (error: unknown) => {
  const status = getStatus(error);
  if (status === 403) return NO_PERMISSION;
  if (status === 404) return NOT_FOUND;
  return LOAD_FAILED;
};

// 저장 실패 안내. 400(필수 항목 공백 등)은 서버 메시지를 우선한다.
const getSaveErrorMessage = (error: unknown) => {
  const status = getStatus(error);
  if (status === 403) return NO_PERMISSION;
  if (status === 404) return NOT_FOUND;
  return getApiErrorMessage(error, SAVE_FAILED);
};

// 저장하지 않고 B02로 돌아간다. 이전 기록이 없으면(주소로 바로 들어옴) 팀 공간으로
const useGoBack = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/team', { replace: true });
  };
};

// B02 팀 정보 수정: 서버의 지금 팀 정보를 불러온 뒤, 그 값이 채워진 수정 폼을 연다.
export default function TeamEditPage() {
  const { search } = useLocation();
  const goBack = useGoBack();

  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let ignore = false;
    resolveTeamId(search)
      .then(async (teamId) => {
        if (ignore) return;
        if (teamId === null) {
          setLoadError(NO_TEAM);
          return;
        }
        const detail = await getTeamDetail(teamId);
        if (!ignore) setTeam(detail);
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(getLoadErrorMessage(error));
      });
    return () => {
      ignore = true;
    };
  }, [search]);

  if (team) return <TeamEditForm team={team} />;

  return (
    <Page>
      <AppBar title="팀 정보 수정" onBack={goBack} />
      <StatusMessage role={loadError ? 'alert' : 'status'}>
        {loadError || '팀 정보를 불러오고 있어요.'}
      </StatusMessage>
    </Page>
  );
}

function TeamEditForm({ team }: { team: TeamInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useGoBack();

  // 팀 프로필 사진은 팀 API에 필드가 없어 B02에서 넘겨받은 것만 쓴다.
  const editState = location.state as TeamEditLocationState | null;

  const [form, setForm] = useState<TeamForm>(() => toTeamForm(team));
  const [photo, setPhoto] = useState<File | null>(editState?.photo ?? null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 저장을 눌렀는지
  const [isSaving, setIsSaving] = useState(false); // 요청 중에는 버튼을 막아 중복 저장을 막는다
  // id: 같은 오류가 연달아 나도 토스트를 새로 띄운다.
  const [errorToast, setErrorToast] = useState<{ message: string; id: number } | null>(null);
  const closeToast = useCallback(() => setErrorToast(null), []);
  const photoUrl = useFileDataUrl(photo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (key: keyof TeamForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 저장을 누른 뒤부터 오류 문구를 보여준다.
  const errors = getTeamFormErrors(form);
  const hasError = Object.values(errors).some(Boolean);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 사진을 다시 골라도 반영되도록 비워 둔다
    if (file) setPhoto(file);
  };

  const handleSave = () => {
    setIsSubmitted(true);
    if (hasError) return;

    // 비운 선택 항목도 ''로 보내 기존 값을 지운다. 프로필 사진(photo)은 API 필드가 없어 보내지 않는다.
    const body = toTeamRequest(form);
    setIsSaving(true);
    updateTeam(team.teamId, body)
      .then(() => {
        // B02로 돌아간다. B02가 teamId로 수정된 정보를 다시 불러오고, 사진만 넘긴다.
        // 뒤로가기로 수정 폼에 다시 오지 않도록 replace
        const state: TeamSpaceLocationState = { photo };
        navigate(`/team?teamId=${team.teamId}`, { replace: true, state });
      })
      .catch((error: unknown) => {
        setIsSaving(false);
        setErrorToast((prev) => ({ message: getSaveErrorMessage(error), id: (prev?.id ?? 0) + 1 }));
      });
  };

  return (
    <Page>
      <AppBar title="팀 정보 수정" onBack={goBack} />

      <Content>
        <PhotoSection>
          {/* 사진이나 연필 버튼을 누르면 사진을 고른다. 연필 버튼 클릭도 여기로 올라온다. */}
          <PhotoArea onClick={() => fileInputRef.current?.click()}>
            <TeamAvatar teamName={form.name} photoUrl={photoUrl} editable />
          </PhotoArea>
          <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} />
          <TeamPhotoCaption help="사진을 눌러 바꿀 수 있어요." />
        </PhotoSection>

        <TeamInfoFields form={form} onChange={updateField} errors={isSubmitted ? errors : {}} />
      </Content>

      <Footer>
        <FooterButton variant="secondary" onClick={goBack}>
          취소
        </FooterButton>
        <FooterButton disabled={isSaving} onClick={handleSave}>
          저장
        </FooterButton>
      </Footer>

      {errorToast && (
        <ToastArea>
          <Toast key={errorToast.id} variant="error" onClose={closeToast}>
            {errorToast.message}
          </Toast>
        </ToastArea>
      )}
    </Page>
  );
}

const Page = styled.main`
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
  text-align: left;
`;

const StatusMessage = styled.p`
  padding: 40px 24px;
  color: #6b6b6b;
  font-size: 15px;
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 32px;
`;

const PhotoSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const PhotoArea = styled.div`
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

// 취소 · 저장 두 버튼을 같은 너비로 나란히
const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 20px;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

const FooterButton = styled(Button)`
  flex: 1;
  min-width: 0;
`;

// 하단 버튼 영역(12 + 52 + 34) 위 16px
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(98px + 16px);
  left: 50%;
  z-index: 102;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;
