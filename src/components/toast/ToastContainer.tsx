import styled from 'styled-components';
import Toast from './Toast';

type ToastResult = 'success' | 'error' | 'logout';

interface ToastContainerProps {
  result: ToastResult | null;
  onClose: () => void;
}

const messages: Record<ToastResult, string> = {
  success: '로그인에 성공했어요.',
  error: '로그인을 완료하지 못했어요. 다시 시도해 주세요.',
  logout: '로그아웃되었어요',
};

export default function ToastContainer({ result, onClose }: ToastContainerProps) {
  if (!result) return null;

  return (
    <ToastArea>
      <Toast key={result} variant={result === 'error' ? 'error' : 'success'} onClose={onClose}>
        {messages[result]}
      </Toast>
    </ToastArea>
  );
}

const ToastArea = styled.div`
  position: fixed;
  bottom: calc(91px + env(safe-area-inset-bottom));
  left: 50%;
  z-index: 200;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;