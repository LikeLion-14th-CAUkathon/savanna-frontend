import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import { getAccessToken } from '../../api/client';
import { previewInvitation } from '../../api/invitation';
import type { InvitationPreviewResponse } from '../../api/invitation';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import InviteInfoField from '../../components/onboarding/InviteInfoField';

// A03 초대 확인·팀 합류
export default function InvitePage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  return <InvitationContent key={token} token={token} />;
}

function InvitationContent({ token }: { token: string | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState<InvitationPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [loadError, setLoadError] = useState(token ? '' : '초대 링크를 확인해 주세요.');
  const [message, setMessage] = useState('');

  // 초대 주소의 토큰으로 실제 팀 정보를 조회한다.
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    previewInvitation(token)
      .then((invitation) => {
        if (!controller.signal.aborted) setTeam(invitation);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404) {
          setLoadError('존재하지 않는 초대 링크예요.');
        } else if (status === 410) {
          setLoadError('만료되었거나 회수된 초대 링크예요.');
        } else {
          setLoadError('초대 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [token]);

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
        {isLoading && <Message role="status">초대 정보를 불러오고 있어요.</Message>}
        {loadError && <Message role="alert">{loadError}</Message>}
        {team && (
          <>
            <InviteInfoField label="팀명" value={team.teamName} />
            <InviteInfoField label="프로젝트 이름" value={team.projectName} />
            <InviteInfoField label="프로젝트 소개" value={team.projectIntro} />
            <InviteInfoField label="인원"
              value={`현재 ${team.memberCount}명 → 합류 후 ${team.memberCount + 1}명`} />
          </>
        )}
        {message && <Message role="status">{message}</Message>}
      </Content>
      <Footer>
        <JoinButton onClick={handleJoin} disabled={isLoading || !team}>합류하기</JoinButton>
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

// 조회 상태와 합류 안내
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