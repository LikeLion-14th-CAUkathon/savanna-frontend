import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import { getApiErrorMessage } from '../../api/client';
import { createTeam, getMyTeams, uploadTeamPhoto } from '../../api/team';
import { getTeamPhotoError, getTeamPhotoUploadErrorMessage } from '../../utils/teamPhoto';
import TeamPhotoPicker from '../../components/team/team-create/TeamPhotoPicker';
import TeamInfoFields from '../../components/team/team-form/TeamInfoFields';
import type { TeamSpaceLocationState } from '../../types/team';
import { EMPTY_TEAM_FORM, getTeamFormErrors, toTeamRequest, type TeamForm } from '../../utils/teamForm';

const CREATE_FAILED = '팀을 만들지 못했어요. 잠시 후 다시 시도해 주세요.';
const ONBOARDING_REQUIRED = '프로필 입력을 먼저 마쳐 주세요.';

// 실패 안내 문구. 403은 온보딩(프로필 입력) 미완료, 그 밖엔 서버 메시지를 우선한다.
const getCreateErrorMessage = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 403
    ? ONBOARDING_REQUIRED
    : getApiErrorMessage(error, CREATE_FAILED);

// B01 팀 생성. 한 사람은 한 팀에만 속하므로, 이미 팀이 있으면 폼 대신 B02 팀 공간으로 보낸다.
export default function TeamCreatePage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let ignore = false;
    getMyTeams()
      .then((teams) => {
        if (ignore) return;
        // 뒤로가기로 생성 화면에 다시 오지 않도록 replace
        if (teams[0]) navigate(`/team?teamId=${teams[0].teamId}`, { replace: true });
        else setIsChecking(false);
      })
      // 확인하지 못하면 폼을 보여준다. 이미 팀이 있으면 생성 요청에서 서버가 다시 막는다.
      .catch(() => {
        if (!ignore) setIsChecking(false);
      });
    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <Page>
        <AppBar title="팀 생성" />
        <CheckingMessage role="status">잠시만 기다려 주세요.</CheckingMessage>
      </Page>
    );
  }

  return <TeamCreateForm />;
}

function TeamCreateForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<TeamForm>(EMPTY_TEAM_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 팀 생성을 눌렀는지
  const [isSending, setIsSending] = useState(false); // 요청 중에는 버튼을 막아 중복 생성을 막는다
  // id: 같은 오류가 연달아 나도 토스트를 새로 띄운다.
  const [errorToast, setErrorToast] = useState<{ message: string; id: number } | null>(null);
  const closeToast = useCallback(() => setErrorToast(null), []);

  const showError = (message: string) =>
    setErrorToast((prev) => ({ message, id: (prev?.id ?? 0) + 1 }));

  const updateField = (key: keyof TeamForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 서버가 받지 않는 사진(JPEG · PNG 아님, 5MB 초과)은 고르지 않은 것으로 하고 안내한다.
  const changePhoto = (file: File | null) => {
    const photoError = file && getTeamPhotoError(file);
    if (photoError) {
      setPhoto(null);
      showError(photoError);
      return;
    }
    setPhoto(file);
  };

  // 팀 생성을 누른 뒤부터 오류 문구를 보여준다.
  const errors = getTeamFormErrors(form);
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = async () => {
    setIsSubmitted(true);
    if (hasError) return;

    setIsSending(true);
    let teamId: number;
    let inviteUrl: string;
    try {
      ({ teamId, inviteUrl } = await createTeam(toTeamRequest(form)));
    } catch (error) {
      setIsSending(false);
      showError(getCreateErrorMessage(error));
      return;
    }

    // 사진은 팀을 만든 뒤 따로 올린다. 실패해도 팀은 만들어졌으니 B02로 가서 안내한다.
    // 초대 링크는 팀을 만들 때 자동으로 생기므로 생성 응답의 주소를 그대로 넘긴다.
    const state: TeamSpaceLocationState = { inviteUrl };
    if (photo) {
      await uploadTeamPhoto(teamId, photo).catch((error: unknown) => {
        state.photoError = `팀은 만들었지만 ${getTeamPhotoUploadErrorMessage(error)}`;
      });
    }

    // B02가 teamId로 팀 정보 · 사진을 불러온다. 뒤로가기로 생성 폼에 다시 돌아오지 않도록 replace
    navigate(`/team?teamId=${teamId}`, { replace: true, state });
  };

  return (
    <Page>
      <AppBar title="팀 생성" />

      <Content>
        <TeamPhotoPicker photo={photo} onChange={changePhoto} />

        <TeamInfoFields form={form} onChange={updateField} errors={isSubmitted ? errors : {}} />
      </Content>

      <Footer>
        <SubmitButton disabled={isSending} onClick={handleSubmit}>
          팀 생성
        </SubmitButton>
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
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  text-align: left;

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

const CheckingMessage = styled.p`
  margin: 0;
  padding: 80px 24px 40px;
  color: #5b5b5b;
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

const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

const SubmitButton = styled(Button)`
  width: 100%;
`;

// 하단 버튼 영역(12 + 52 + 34) 위 16px
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(98px + 16px);
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
