import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import TeamPhotoPicker from '../../components/team/team-create/TeamPhotoPicker';
import TeamInfoFields from '../../components/team/team-form/TeamInfoFields';
import type { TeamSpaceLocationState } from '../../types/team';
import { EMPTY_TEAM_FORM, getTeamFormErrors, toTeamRequest, type TeamForm } from '../../utils/teamForm';

// B01 팀 생성
export default function TeamCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<TeamForm>(EMPTY_TEAM_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 팀 생성을 눌렀는지

  const updateField = (key: keyof TeamForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 팀 생성을 누른 뒤부터 오류 문구를 보여준다.
  const errors = getTeamFormErrors(form);
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (hasError) return;

    const body = toTeamRequest(form);
    // TODO: createTeam(body) 연결 후 성공 시에만 이동하도록 변경. 프로필 사진(photo)은 API 필드가 없어 아직 보내지 않음
    console.log('팀 생성 요청', body, photo);

    // B02 팀 공간으로 이동하며 입력한 정보를 넘긴다. 뒤로가기로 생성 폼에 다시 돌아오지 않도록 replace
    const state: TeamSpaceLocationState = { createdTeam: body, photo };
    navigate('/team', { replace: true, state });
  };

  return (
    <Page>
      <AppBar title="팀 생성" />

      <Content>
        <TeamPhotoPicker photo={photo} onChange={setPhoto} />

        <TeamInfoFields form={form} onChange={updateField} errors={isSubmitted ? errors : {}} />
      </Content>

      <Footer>
        <SubmitButton onClick={handleSubmit}>팀 생성</SubmitButton>
      </Footer>
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
