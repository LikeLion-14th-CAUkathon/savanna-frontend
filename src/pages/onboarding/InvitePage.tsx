import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import { getAccessToken } from '../../api/client';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import InviteInfoField from '../../components/onboarding/InviteInfoField';

import { SAMPLE_TEAM } from '../../mocks/invite';

// A03 초대 확인·팀 합류
export default function InvitePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');

  // API 연결 후 팀 합류 요청과 성공·실패 처리
  const handleJoin = () => {
    // 구글 인증으로 페이지를 떠나도 초대 주소가 유지되도록 저장한다.
    sessionStorage.setItem('pendingInvitationUrl', location.pathname + location.search + location.hash);
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }
    setMessage('팀 합류 기능은 아직 연결되지 않았어요.');
  };

  return (
    <Page>
      <AppBar title="초대 확인 & 팀 합류" onBack={() => navigate(-1)} />
      <Content>
        <InviteInfoField label="팀명" value={SAMPLE_TEAM.name} />
        <InviteInfoField label="프로젝트 이름" value={SAMPLE_TEAM.projectName} />
        <InviteInfoField label="프로젝트 소개" value={SAMPLE_TEAM.description} />
        <InviteInfoField label="인원"
          value={`현재 ${SAMPLE_TEAM.memberCount}명 → 합류 후 ${SAMPLE_TEAM.memberCount + 1}명`} />
        {message && <Message role="status">{message}</Message>}
      </Content>
      <Footer>
        <JoinButton onClick={handleJoin}>합류하기</JoinButton>
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

// 합류 기능 미연동 안내
const Message = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 13px;
`;

// 하단 합류하기 영역
const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

// 공통 버튼의 너비만 확장
const JoinButton = styled(Button)`
  width: 100%;
`;