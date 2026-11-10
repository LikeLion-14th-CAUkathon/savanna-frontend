import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';

// A03 초대 확인·팀 합류
export default function InvitePage() {
  const navigate = useNavigate();

  return (
    <Page>
      <AppBar title="초대 확인 & 팀 합류" onBack={() => navigate(-1)} />
      {/* 다음 단계에서 초대 팀 정보 표시 */}
      <Content />
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
