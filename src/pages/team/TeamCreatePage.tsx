import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import { getApiErrorMessage } from '../../api/client';
import { createTeam } from '../../api/team';
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

// B01 팀 생성
export default function TeamCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<TeamForm>(EMPTY_TEAM_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 팀 생성을 눌렀는지
  const [isSending, setIsSending] = useState(false); // 요청 중에는 버튼을 막아 중복 생성을 막는다
  // id: 같은 오류가 연달아 나도 토스트를 새로 띄운다.
  const [errorToast, setErrorToast] = useState<{ message: string; id: number } | null>(null);
  const closeToast = useCallback(() => setErrorToast(null), []);

  const updateField = (key: keyof TeamForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 팀 생성을 누른 뒤부터 오류 문구를 보여준다.
  const errors = getTeamFormErrors(form);
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (hasError) return;

    const body = toTeamRequest(form);
    setIsSending(true);
    // 프로필 사진(photo)은 팀 API에 필드가 없어 아직 보내지 않는다.
    createTeam(body)
      .then(({ teamId }) => {
        // B02 팀 공간으로 이동하며 입력한 정보를 넘긴다. 뒤로가기로 생성 폼에 다시 돌아오지 않도록 replace
        // TODO: B02가 API로 연결되면 teamId로 팀 상세를 불러오고 state는 사진만 남긴다.
        const state: TeamSpaceLocationState = { createdTeam: body, photo };
        navigate(`/team?teamId=${teamId}`, { replace: true, state });
      })
      .catch((error: unknown) => {
        setIsSending(false);
        setErrorToast((prev) => ({ message: getCreateErrorMessage(error), id: (prev?.id ?? 0) + 1 }));
      });
  };

  return (
    <Page>
      <AppBar title="팀 생성" />

      <Content>
        <TeamPhotoPicker photo={photo} onChange={setPhoto} />

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
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;
