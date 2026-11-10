import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import InviteInfoField from '../../components/onboarding/InviteInfoField';

import { SAMPLE_TEAM } from '../../mocks/invite';

// A03 초대 확인·팀 합류
export default function InvitePage() {
  const navigate = useNavigate();

  return (
    <Page>
      <AppBar title="초대 확인 & 팀 합류" onBack={() => navigate(-1)} />
      <Content>
        <InviteInfoField label="팀명" value={SAMPLE_TEAM.name} />
        <InviteInfoField label="프로젝트 이름" value={SAMPLE_TEAM.projectName} />
        <InviteInfoField label="프로젝트 소개" value={SAMPLE_TEAM.description} />
        <InviteInfoField label="인원"
          value={`현재 ${SAMPLE_TEAM.memberCount}명 → 합류 후 ${SAMPLE_TEAM.memberCount + 1}명`} />
      </Content>
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
  padding-top: 58px;
  background: #fafaf8;
  color: #1e1e1e;
  line-height: normal;
`;

// 초대 팀 정보 영역
const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 26px;
`;