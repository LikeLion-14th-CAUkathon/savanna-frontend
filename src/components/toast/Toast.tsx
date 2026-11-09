import { useEffect, useState } from 'react';
import styled from 'styled-components';
import successIcon from '../../assets/icons/toast/toast-success.svg';
import errorIcon from '../../assets/icons/toast/toast-error.svg';

interface ToastProps {
  variant?: 'success' | 'error'; // 성공 / 오류 (기본값은 성공)
  children: React.ReactNode;     // 페이지에서 전달하는 안내 문구
  onClose: () => void;           // 시간이 지나면 부모에게 "이제 닫아줘"라고 알림
}

export default function Toast({ variant = 'success', children, onClose }: ToastProps) {
  const isError = variant === 'error'; // 오류 토스트냐?
  const [isClosing, setIsClosing] = useState(false);

  // 1초 표시한 뒤 0.3초 동안 사라지고 부모에게 닫기를 알립니다.
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsClosing(true), 1000);
    const closeTimer = setTimeout(onClose, 1300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <Box $isClosing={isClosing} role={isError ? 'alert' : 'status'}>
      <Badge $isError={isError}>
        <img src={isError ? errorIcon : successIcon} alt="" />
      </Badge>
      <Text>{children}</Text>
    </Box>
  );
}

const Box = styled.div<{ $isClosing: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 354px;
  max-width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #3b2a16;
  color: #ffffff;
  text-align: left;
  opacity: ${({ $isClosing }) => ($isClosing ? 0 : 1)};
  transform: ${({ $isClosing }) => ($isClosing ? 'translateY(6px)' : 'translateY(0)')};
  transition: opacity 300ms ease, transform 300ms ease;
  pointer-events: ${({ $isClosing }) => ($isClosing ? 'none' : 'auto')};

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition: none;
  }
`;

const Badge = styled.span<{ $isError: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 글이 길어져도 동그라미가 찌그러지지 않게 */
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $isError }) => ($isError ? '#fce9e6' : '#eef3de')};
`;

const Text = styled.p`
  margin: 0;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
`;