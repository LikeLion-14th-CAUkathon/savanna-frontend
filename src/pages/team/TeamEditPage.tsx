import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import TeamAvatar from '../../components/common/TeamAvatar';
import TeamInfoFields from '../../components/team/team-form/TeamInfoFields';
import TeamPhotoCaption from '../../components/team/team-form/TeamPhotoCaption';
import { MOCK_TEAM_SPACE } from '../../mocks/team';
import type { TeamEditLocationState, TeamSpaceLocationState } from '../../types/team';
import { getTeamFormErrors, toTeamForm, toTeamRequest, type TeamForm } from '../../utils/teamForm';
import { useFileDataUrl } from '../../utils/useFileDataUrl';

// B02 팀 정보 수정: 지금 팀 정보가 채워진 채로 열리고, 저장하면 B02 팀 공간에 반영한다.
export default function TeamEditPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // B02에서 넘겨준 지금 팀 정보. 주소로 바로 들어온 경우엔 목업을 쓴다.
  // TODO: API 연결 시 getTeamDetail(teamId) 응답으로 교체
  const editState = location.state as TeamEditLocationState | null;
  const team = editState?.team ?? MOCK_TEAM_SPACE.team;

  const [form, setForm] = useState<TeamForm>(() => toTeamForm(team));
  const [photo, setPhoto] = useState<File | null>(editState?.photo ?? null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 저장을 눌렀는지
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

  // 저장하지 않고 B02로 돌아간다.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/team', { replace: true });
  };

  const handleSave = () => {
    setIsSubmitted(true);
    if (hasError) return;

    const body = toTeamRequest(form);
    // TODO: updateTeam(team.teamId, body) 연결 후 성공 시에만 이동. 프로필 사진(photo)은 API 필드가 없어 아직 보내지 않음
    console.log('팀 정보 수정 요청', team.teamId, body, photo);

    const state: TeamSpaceLocationState = { createdTeam: body, photo };
    navigate('/team', { replace: true, state });
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
        <FooterButton onClick={handleSave}>저장</FooterButton>
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
