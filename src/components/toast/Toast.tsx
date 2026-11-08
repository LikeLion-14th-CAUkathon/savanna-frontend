import { useEffect } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import successIcon from '../../assets/icons/toast/toast-success.svg';
import errorIcon from '../../assets/icons/toast/toast-error.svg';

type ToastVariant = 'success' | 'error'; // 토스트 종류를 Union Type으로 정의하기.

interface ToastProps {
  variant?: ToastVariant;   // 성공 / 오류 (기본값은 성공)
  children?: ReactNode;     // 안내 문구. 안 넘기면 종류에 맞는 기본 문구가 나옴
  duration?: number;        // 몇 ms 뒤에 자동으로 닫을지 (기본 2.5초)
  onClose?: () => void;     // 닫힐 때 실행할 함수. 부모가 토스트를 화면에서 없앨 때 씀
}

export default function Toast({
  variant = 'success',
  children,
  duration = 2500,
  onClose,
}: ToastProps) {
  // duration이 지나면 onClose를 실행해서 부모에게 "이제 닫아줘"라고 알림
  useEffect(() => {
    if (!onClose || duration <= 0) return; // onClose가 없거나 duration이 0 이하면 자동으로 안 닫음
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer); // 토스트가 사라질 때 타이머도 같이 정리
  }, [duration, onClose]);

  const isError = variant === 'error';

  return (
    <ToastBox role={isError ? 'alert' : 'status'}>
      <Badge $variant={variant}>
        <img src={isError ? errorIcon : successIcon} alt="" />
      </Badge>
      <ToastText>
        {children ?? (isError
          ? '복사하지 못했어요. 아래 주소를 직접 복사해 주세요.'
          : '초대 링크를 복사했어요.')}
      </ToastText>
    </ToastBox>
  );
}

const ToastBox = styled.div`
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
`;

const Badge = styled.span<{ $variant: ToastVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: ${({ $variant }) =>
    $variant === 'error' ? '#fce9e6' : '#eef3de'};
`;

const ToastText = styled.p`
  flex: 1;
  margin: 0;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
`;