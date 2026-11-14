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
  min-height: 100dvh;
  background-color: #ffffff;

  /* 태블릿·데스크톱에서는 폰 화면을 정가운데에 둔다. */
  @media (min-width: 481px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// 모바일 화면 배치: 로고는 위, 카드는 아래에 두고 남는 높이는 가운데 간격이 차지한다.
const Screen = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 402px;
  min-height: 100dvh;
  margin: 0 auto;
  /* Figma 기준 높이(874px)보다 길면 남는 높이를 위아래 여백으로 나눠 가운데 간격이 넓어지지 않게 한다. */
  padding: calc(clamp(40px, 7dvh, 60px) + max(0px, (100dvh - 874px) / 2)) 14px
    max(calc(clamp(40px, 7dvh, 63px) + max(0px, (100dvh - 874px) / 2)), env(safe-area-inset-bottom));
  overflow: hidden;
  background-color: #feb055;

  /* 모바일에서는 화면 너비를 꽉 채운다. */
  @media (max-width: 480px) {
    max-width: none;
  }

  /* 태블릿·데스크톱에서는 Figma 폰 화면 크기(402×874)로 고정하고, 화면이 더 짧으면 높이만 맞춘다. */
  @media (min-width: 481px) {
    height: min(874px, 100dvh);
    min-height: 0;
    padding: 60px 14px 63px;
  }
`;

// 풍경은 화면 아래에 붙이고, 위쪽 하늘 영역은 최소 160px을 남긴다.
const MapBackground = styled.img.attrs({ src: backgroundImage, alt: '', draggable: false })`
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: 100%;
  height: auto;
  max-height: calc(100% - 160px);
  object-fit: cover;
  object-position: center top;
  /* 이미지 위쪽 경계를 하늘색과 부드럽게 연결한다. */
  mask-image: linear-gradient(to bottom, transparent, #000 100px);
  pointer-events: none;
`;

// 상단 그라데이션
const TopFade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 265px;
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
  /* Figma 비율(402px 화면에서 319px)로 화면 너비에 맞추고, 화면 높이 680px 이하에서는 높이에 맞춰 줄어든다. */
  width: min(85%, 46.9dvh);
  aspect-ratio: 319 / 180;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
  animation: ${logoAppear} 1s ease-out;

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
