import styled from 'styled-components';
import LoginCard from '../../components/onboarding/LoginCard';
import backgroundImage from '../../assets/images/background/표지판 없는 노을빛 구불길 풍경 1.png';
import logo from '../../assets/images/login/logo.png';

interface LoginPageProps {
  onGoogleLogin: () => void;
}

export default function LoginPage({ onGoogleLogin }: LoginPageProps) {
  return (
    <Page>
      <Screen>
        <MapBackground />
        <TopFade />
        <LogoFrame>
          <LogoImage src={logo} alt="사바나 원정" />
        </LogoFrame>

        <LoginCard onGoogleLogin={onGoogleLogin} />
      </Screen>
    </Page>
  );
}

// 전체 배경
const Page = styled.main`
  min-height: 100svh;
  background-color: var(--color-cream);
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
  padding: 62px 14px 87px;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  background-color: #feb055;

  /* 모바일에서는 화면 너비에 맞춰 양옆 여백을 없앤다. */
  @media (max-width: 480px) {
    width: 100%;
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

// 로고 바깥 여백 자르기
const LogoFrame = styled.div`
  position: relative;
  width: min(319px, 85%);
  aspect-ratio: 319 / 180;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
  overflow: hidden;
`;

// 로고 크기와 위치
const LogoImage = styled.img`
  position: absolute;
  top: -20.36%;
  left: 50%;
  transform: translateX(-50%);
  width: 104.92%;
  height: 139.77%;
`;
