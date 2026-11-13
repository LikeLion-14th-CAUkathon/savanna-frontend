import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Notice from '../../components/common/Notice';
import Input from '../../components/common/Input';
import CollapseToggle from '../../components/common/CollapseToggle';
import Button from '../../components/common/Button';
import TeamPhotoPicker from '../../components/team/team-create/TeamPhotoPicker';
import type { TeamCreateRequest } from '../../api/team';

type TeamForm = Required<TeamCreateRequest>;

const EMPTY_FORM: TeamForm = {
  name: '',
  projectName: '',
  projectIntro: '',
  githubUrl: '',
  presentationUrl: '',
  stack: '',
};

const URL_ERROR = 'https:// 또는 http://로 시작하는 링크를 입력해 주세요.';

// 선택 링크는 비어 있거나 http(s)://로 시작해야 한다.
const isValidUrl = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' || /^https?:\/\/\S+$/i.test(trimmed);
};

// B01 팀 생성
export default function TeamCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<TeamForm>(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 팀 생성을 눌렀는지

  const updateField = (key: keyof TeamForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 팀 생성을 누른 뒤부터 오류 문구를 보여준다.
  const errors = {
    name: !form.name.trim() ? '팀 이름을 입력해 주세요.' : undefined,
    projectName: !form.projectName.trim() ? '프로젝트 이름을 입력해 주세요.' : undefined,
    projectIntro: !form.projectIntro.trim() ? '프로젝트 소개를 입력해 주세요.' : undefined,
    githubUrl: !isValidUrl(form.githubUrl) ? URL_ERROR : undefined,
    presentationUrl: !isValidUrl(form.presentationUrl) ? URL_ERROR : undefined,
  };
  const visibleError = (key: keyof typeof errors) => (isSubmitted ? errors[key] : undefined);
  const hasError = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (hasError) return;

    const body: TeamCreateRequest = {
      name: form.name.trim(),
      projectName: form.projectName.trim(),
      projectIntro: form.projectIntro.trim(),
      githubUrl: form.githubUrl.trim(),
      presentationUrl: form.presentationUrl.trim(),
      stack: form.stack.trim(),
    };
    // TODO: createTeam(body) 연결 후 성공 시에만 이동하도록 변경. 프로필 사진(photo)은 API 필드가 없어 아직 보내지 않음
    console.log('팀 생성 요청', body, photo);

    // B02 팀 공간으로 이동. 뒤로가기로 생성 폼에 다시 돌아오지 않도록 replace
    navigate('/team', { replace: true });
  };

  return (
    <Page>
      <AppBar title="팀 생성" onBack={() => navigate(-1)} />

      <Content>
        <TeamPhotoPicker photo={photo} onChange={setPhoto} />

        <Notice />

        <Input
          label="팀 이름"
          mark="required"
          value={form.name}
          onChange={updateField('name')}
          placeholder="예) 사바나 탐험대"
          error={visibleError('name')}
        />
        <Input
          label="프로젝트 이름"
          mark="required"
          value={form.projectName}
          onChange={updateField('projectName')}
          placeholder="예) AI 수면 습관 코치"
          error={visibleError('projectName')}
        />
        <Input
          label="프로젝트 소개"
          mark="required"
          multiline
          value={form.projectIntro}
          onChange={updateField('projectIntro')}
          placeholder="어떤 문제를 누구를 위해 해결하는 프로젝트인지, 주요 기능과 함께 적어 주세요."
          error={visibleError('projectIntro')}
        />

        <CollapseToggle defaultExpanded>
          <ExtraFields>
            <Input
              label="깃허브 링크"
              mark="optional"
              type="url"
              value={form.githubUrl}
              onChange={updateField('githubUrl')}
              placeholder="https://"
              error={visibleError('githubUrl')}
            />
            <Input
              label="발표자료 링크"
              mark="optional"
              type="url"
              value={form.presentationUrl}
              onChange={updateField('presentationUrl')}
              placeholder="https://"
              error={visibleError('presentationUrl')}
            />
            <Input
              label="기술 스택"
              mark="optional"
              value={form.stack}
              onChange={updateField('stack')}
              placeholder="예) React, Node.js"
            />
          </ExtraFields>
        </CollapseToggle>
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

// 추가 정보 펼침 영역. 접기 줄과 첫 입력칸 사이도 20px
const ExtraFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
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
