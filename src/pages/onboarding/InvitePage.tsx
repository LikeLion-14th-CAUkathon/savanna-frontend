import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import { acceptInvitation, previewInvitation } from '../../api/invitation';
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
  const [isJoining, setIsJoining] = useState(false);
  const joinInProgress = useRef(false);
  const autoJoinStarted = useRef(false);
  const autoJoin = (location.state as { autoJoin?: boolean } | null)?.autoJoin === true;

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

  // 합류 결과의 팀 ID를 팀 공간에 전달한다.
  const handleJoin = useCallback(async () => {
    if (!token || !team || joinInProgress.current) return;
    joinInProgress.current = true;
    // 구글 인증으로 페이지를 떠나도 초대 주소가 유지되도록 저장한다.
    sessionStorage.setItem('pendingInvitationUrl', location.pathname + location.search + location.hash);
    setIsJoining(true);
    setMessage('');
    try {
      const joinedTeam = await acceptInvitation(token);
      sessionStorage.removeItem('pendingInvitationUrl');
      navigate(`/team?teamId=${joinedTeam.teamId}`, { replace: true });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        navigate('/login');
      } else if (status === 403) {
        navigate('/profile');
      } else if (status === 409) {
        sessionStorage.removeItem('pendingInvitationUrl');
        navigate(`/team?teamId=${team.teamId}`, { replace: true });
      } else if (status === 404 || status === 410) {
        setTeam(null);
        setLoadError('초대 링크가 유효하지 않아요. 새 초대 링크를 받아 주세요.');
        sessionStorage.removeItem('pendingInvitationUrl');
      } else {
        setMessage('팀에 합류하지 못했어요. 다시 시도해 주세요.');
      }
    } finally {
      joinInProgress.current = false;
      setIsJoining(false);
    }
  }, [token, team, location.pathname, location.search, location.hash, navigate]);

  // 로그인·정보 입력을 마치고 돌아오면 한 번만 자동으로 합류한다.
  useEffect(() => {
    if (!autoJoin || !team || autoJoinStarted.current) return;
    const timer = window.setTimeout(() => {
      autoJoinStarted.current = true;
      void handleJoin();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoJoin, team, handleJoin]);

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
        <JoinButton onClick={handleJoin} disabled={isLoading || !team || isJoining}>
          {isJoining ? '합류하고 있어요.' : '합류하기'}
        </JoinButton>
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