import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { refreshToken } from '../../api/auth';
import { getMyInfo } from '../../api/user';
import { getMyTeams } from '../../api/team';
import styled, { keyframes } from 'styled-components';
import LoginCard from '../../components/onboarding/LoginCard';
import backgroundImage from '../../assets/images/background/표지판 없는 노을빛 구불길 풍경 1.webp';
import logo from '../../assets/images/login/logo.webp';

interface LoginPageProps {
  onGoogleLogin: () => void;
  onLoginResult: (result: 'success' | 'error') => void;
}

export default function LoginPage({ onGoogleLogin, onLoginResult }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGoogleSuccess = searchParams.get('google') === 'success';
  const isGoogleFail = searchParams.get('google') === 'fail';
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'error'>(
    isGoogleSuccess ? 'loading' : 'idle',
  );
  const loginRequest = useRef<Promise<{ path: string; autoJoin?: boolean }> | null>(null);

  // 구글 인증 후 돌아왔을 때만 CSRF 확인과 Access Token 발급을 진행한다.
  useEffect(() => {
    // 구글 인증 자체가 실패해서 돌아온 경우에도 실패 토스트를 표시한다.
    if (isGoogleFail) {
      onLoginResult('error');
      return;
    }
    if (!isGoogleSuccess) return;
    const controller = new AbortController();
    // 개발 모드에서도 로그인 확인과 팀 조회가 중복되지 않도록 재사용한다.
    loginRequest.current ??= refreshToken().then(async () => {
      const user = await getMyInfo();
      if (!user.onboardingCompleted) return { path: '/profile' };

      const invitationUrl = sessionStorage.getItem('pendingInvitationUrl');
      if (invitationUrl?.startsWith('/invite?')) {
        return { path: invitationUrl, autoJoin: true };
      }

      // 일반 접속한 기존 사용자는 소속 팀 유무에 따라 이동한다.
      const teams = await getMyTeams();
      return { path: teams.length > 0 ? '/oasis' : '/team/create' };
    });
    loginRequest.current
      .then(({ path, autoJoin }) => {
        if (controller.signal.aborted) return;
        onLoginResult('success');
        navigate(path, { replace: true, state: { autoJoin } });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoginStatus('error');
        onLoginResult('error');
      });
    return () => controller.abort();
  }, [isGoogleSuccess, isGoogleFail, navigate, onLoginResult]);

  return (
    <Page>
      <Screen>
        <MapBackground />
        <TopFade />
        <LogoFrame>
          <LogoImage src={logo} alt="사바나 원정" />
        </LogoFrame>

        <LoginCard onGoogleLogin={onGoogleLogin} isLoading={loginStatus === 'loading'}>
          {loginStatus === 'loading' && <p role="status">로그인을 확인하고 있어요.</p>}
        </LoginCard>
      </Screen>
    </Page>
  );
}

// 전체 배경
const Page = styled.main`
  min-height: 100svh;
  background-color: #ffffff;
`;

// 모바일 화면 배치
const Screen = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  padding: clamp(24px, calc(100svh - 680px), 60px) 14px
    clamp(24px, calc(100svh - 677px), 63px);
  justify-content: center;
  /* 기본 화면 높이에서는 기존 배치를 유지하고, 긴 화면의 가운데 간격을 제한한다. */
  gap: clamp(24px, calc(100svh - 607px), 245px);
  overflow: hidden;
  background-color: #feb055;

  /* 모바일에서는 화면 너비에 맞춰 양옆 여백을 없앤다. */
  @media (max-width: 480px) {
    width: 100%;
    /* 주소창을 제외한 높이에 맞추고, 내용이 넘치면 세로로 늘어난다. */
    min-height: 100dvh;
    padding: clamp(24px, 5dvh, 48px) 14px;
    gap: clamp(64px, calc(100dvh - 607px), 245px);
    /* 짧은 화면에서는 로고와 카드의 크기를 같은 기준으로 조절한다. */
    --login-scale: min(1px, 100dvh / 800);
  }
`;

// 풍경 위쪽을 하늘색과 겹쳐 이미지 시작 경계를 부드럽게 연결한다.
const MapBackground = styled.div`
  position: absolute;
  inset: 160px 0 0;
  background-image: url('${backgroundImage}');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  mask-image: linear-gradient(to bottom, transparent, #000 100px);
  pointer-events: none;
`;

// 상단 그라데이션
const TopFade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background: linear-gradient(
    to bottom,
    rgba(255, 247, 234, 0.88) 0%,
    rgba(255, 247, 234, 0.55) 45%,
    rgba(255, 247, 234, 0) 100%
  );
  pointer-events: none;
`;

const logoAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 로고 영역
const LogoFrame = styled.div`
  position: relative;
  width: min(319px, 85%);
  aspect-ratio: 319 / 180;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
  animation: ${logoAppear} 1s ease-out;

  @media (max-width: 480px) {
    width: min(319px, 85%, calc(319 * var(--login-scale)));
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 로고 크기와 위치
const LogoImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 110%;
  height: auto;
  transform: translate(-50%, -50%);
`;
