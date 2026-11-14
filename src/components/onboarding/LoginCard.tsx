import type { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import Button from '../common/Button';
import googleLogo from '../../assets/icons/login/google-logo.webp';

interface LoginCardProps {
  onGoogleLogin: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export default function LoginCard({ onGoogleLogin, isLoading = false, children }: LoginCardProps) {
  return (
    <Card>
      <Copy>
        <Tagline>함께라서 더 멀리</Tagline>
        <Title>
          좋은 도전을 찾고,
          <br />
          끝까지 가는 여정
        </Title>
        <Description>
          흩어졌던 팀을 다시 모아
          <br />
          우리의 다음 원정을 시작해요.
        </Description>
      </Copy>

      {children}
      <GoogleButton onClick={onGoogleLogin} disabled={isLoading}>
        <GoogleLogo>
          <img src={googleLogo} alt="" />
        </GoogleLogo>
        구글로 계속하기
      </GoogleButton>
    </Card>
  );
}

// 화면 진입 시 카드가 서서히 나타난다.
const appear = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// 로그인 카드: 크기는 화면 높이 680px 이하부터 조금씩 줄어든다.
const Card = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 4.1dvh, 28px);
  width: 100%;
  box-sizing: border-box;
  padding: clamp(24px, 4.1dvh, 28px) clamp(22px, 3.8dvh, 26px);
  border: 2px solid #e7e5e0;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow:
    0 8px 20px rgba(59, 42, 22, 0.18),
    0 3px 0 #d7d4cd;
  animation: ${appear} 2s ease 0.3s backwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 문구 가운데 정렬
const Copy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 1.8dvh, 12px);
  text-align: center;
`;

// 제목 위 안내 문구
const Tagline = styled.p`
  padding: 5px 12px;
  border-radius: 999px;
  background-color: #fff6dd;
  color: var(--color-orange);
  font-family: 'CookieRun', sans-serif;
  font-size: clamp(13px, 2.2dvh, 15px);
  font-weight: 400;
  line-height: 17px;
  letter-spacing: -0.3px;
`;

// 로그인 제목
const Title = styled.h1`
  margin: 0;
  color: var(--color-ink);
  font-family: 'CookieRun', sans-serif;
  font-size: clamp(24px, 4.1dvh, 28px);
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.28px;
`;

// 제목 아래 설명
const Description = styled.p`
  color: #5b5b5b;
  font-family: 'CookieRun', sans-serif;
  font-size: clamp(15px, 2.6dvh, 18px);
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: -0.18px;
`;

// 구글 로그인 버튼
const GoogleButton = styled(Button)`
  position: relative;
  width: 100%;
  height: clamp(44px, 7.6dvh, 52px);
  font-size: clamp(15px, 2.5dvh, 17px);
  line-height: 20px;
  letter-spacing: 0;
  padding: 0 46px;
`;

// 버튼 왼쪽 구글 로고
const GoogleLogo = styled.span`
  position: absolute;
  left: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ffffff;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
