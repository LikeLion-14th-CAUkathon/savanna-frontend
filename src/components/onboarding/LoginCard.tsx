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

// 로그인 카드
const Card = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 374px;
  box-sizing: border-box;
  padding: 28px 26px;
  border: 2px solid #e7e5e0;
  border-radius: 24px;
  background-color: #ffffff;
  box-shadow:
    0 8px 20px rgba(59, 42, 22, 0.18),
    0 3px 0 #d7d4cd;
  animation: ${appear} 2s ease 0.3s backwards;

  @media (max-width: 480px) {
    max-width: calc(374 * var(--login-scale));
    padding: calc(28 * var(--login-scale)) calc(26 * var(--login-scale));
    gap: calc(28 * var(--login-scale));
  }


  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 문구 가운데 정렬
const Copy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  @media (max-width: 480px) {
    gap: calc(12 * var(--login-scale));
  }
`;

// 제목 위 안내 문구
const Tagline = styled.p`
  padding: 5px 12px;
  border-radius: 999px;
  background-color: #fff6dd;
  color: var(--color-orange);
  font-family: 'CookieRun', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: -0.3px;
  @media (max-width: 480px) {
    font-size: max(12px, calc(15 * var(--login-scale)));
  }
`;

// 로그인 제목
const Title = styled.h1`
  margin: 0;
  color: var(--color-ink);
  font-family: 'CookieRun', sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 35px;
  letter-spacing: -0.28px;
  @media (max-width: 480px) {
    font-size: max(22px, calc(28 * var(--login-scale)));
    line-height: 1.25;
  }
`;

// 제목 아래 설명
const Description = styled.p`
  color: #5b5b5b;
  font-family: 'CookieRun', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 23px;
  letter-spacing: -0.18px;
  @media (max-width: 480px) {
    font-size: max(14px, calc(18 * var(--login-scale)));
    line-height: 1.3;
  }
`;

// 구글 로그인 버튼
const GoogleButton = styled(Button)`
  position: relative;
  width: 100%;
  font-size: 17px;
  line-height: 20px;
  letter-spacing: 0;
  padding: 0 46px;
  @media (max-width: 480px) {
    height: max(44px, calc(52 * var(--login-scale)));
    font-size: max(14px, calc(17 * var(--login-scale)));
  }
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
