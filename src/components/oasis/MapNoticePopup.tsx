import styled from 'styled-components';
import Button from '../common/Button';

interface MapNoticePopupProps {
  message: string;      // 예: '아직 시작한 원정이 없어요.'
  actionLabel: string;  // 예: '공고 찾기', '다시 시도'
  onAction: () => void;
  isError?: boolean;    // 조회 실패 안내면 화면 낭독기에 바로 읽어줌
}

// 지도 위에 띄우는 안내 (원정 없음 / 조회 실패)
export default function MapNoticePopup({ message, actionLabel, onAction, isError = false }: MapNoticePopupProps) {
  return (
    <Popup role={isError ? 'alert' : 'status'}>
      <Message>{message}</Message>
      <ActionButton onClick={onAction}>{actionLabel}</ActionButton>
    </Popup>
  );
}

const Popup = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
  width: 354px;
  max-width: 100%;
  padding: 24px 20px 20px;
  border: 2px solid #fff0cc;
  border-radius: 20px;
  background: var(--color-cream);
  box-shadow: var(--shadow-float), 0 3px 0 var(--color-sand);
`;

const Message = styled.p`
  width: 100%;
  color: var(--color-brown);
  font-family: var(--font-concept);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.18px;
  text-align: center;
  word-break: keep-all;
  text-wrap: balance; /* 두 줄이 되면 길이를 비슷하게 나눔 */
`;

// 공통 Button(primary)을 그대로 쓰고 글꼴만 컨셉 글꼴로 바꿈
const ActionButton = styled(Button)`
  width: 100%;
  color: var(--color-brown);
  font-family: var(--font-concept);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.18px;
`;
