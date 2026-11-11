import type { ReactNode } from 'react';
import styled from 'styled-components';

export type PillTone = 'amber' | 'green' | 'gray' | 'red';

const TONES: Record<PillTone, { bg: string; color: string }> = {
  amber: { bg: 'var(--color-amber-bg)', color: 'var(--color-orange)' },
  green: { bg: 'var(--color-green-bg)', color: 'var(--color-green-text)' },
  gray: { bg: 'var(--color-gray-bg)', color: 'var(--color-text-secondary)' },
  red: { bg: 'var(--color-error-bg)', color: 'var(--color-error)' },
};

interface StatusPillProps {
  tone: PillTone;
  children: ReactNode;
}

// 진행 단계·합류 상태·조건 판정 등에 쓰는 작은 둥근 배지
export default function StatusPill({ tone, children }: StatusPillProps) {
  return <Pill $tone={tone}>{children}</Pill>;
}

const Pill = styled.span<{ $tone: PillTone }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${({ $tone }) => TONES[$tone].bg};
  color: ${({ $tone }) => TONES[$tone].color};
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  white-space: nowrap;
`;
