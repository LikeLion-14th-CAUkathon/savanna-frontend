import styled from 'styled-components';
import ActionButton from './ActionButton';

interface StatusMessageProps {
  title: string;
  description?: string;
  actionLabel?: string;   // 있으면 아래에 버튼을 보여줌
  onAction?: () => void;
}

// 결과 없음 · 조회 실패 · 불러오는 중처럼 목록 대신 보여주는 안내 영역
export default function StatusMessage({ title, description, actionLabel, onAction }: StatusMessageProps) {
  return (
    <Wrapper>
      <Texts>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </Texts>
      {actionLabel && (
        <ActionButton onClick={onAction}>{actionLabel}</ActionButton>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px 24px;
  text-align: center;
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const Title = styled.p`
  color: #1e1e1e;
  font-size: 17px;
  font-weight: 700;
`;

const Description = styled.p`
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;
