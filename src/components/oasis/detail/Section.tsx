import type { ReactNode } from 'react';
import styled from 'styled-components';

interface SectionProps {
  title: string;
  actionLabel?: string;       // 제목 옆 작은 버튼 (예: '변경', '+ 추가')
  onAction?: () => void;
  children: ReactNode;
}

// 원정 상세의 구역: 제목 줄 + 흰 카드
export default function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <Wrapper>
      <LabelRow>
        <Title>{title}</Title>
        {actionLabel && (
          <ActionButton type="button" onClick={onAction}>
            {actionLabel}
          </ActionButton>
        )}
      </LabelRow>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
`;

const ActionButton = styled.button`
  padding: 5px 12px;
  border: 0;
  border-radius: 999px;
  background: var(--color-green-bg);
  color: var(--color-green-text);
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-green-text);
    outline-offset: 2px;
  }
`;