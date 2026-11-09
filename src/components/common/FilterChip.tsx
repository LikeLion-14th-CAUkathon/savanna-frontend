import type { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

type FilterChipProps = ComponentPropsWithoutRef<'button'> & {
  selected?: boolean;
};

export default function FilterChip({ children, selected = false, type = 'button', ...props }: FilterChipProps) {
  return (
    <ChipBox type={type} $selected={selected} aria-pressed={selected} {...props}>
      {children}
    </ChipBox>
  );
}

const ChipBox = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: 1px solid ${({ $selected }) => $selected ? 'transparent' : '#e7e5e0'};
  border-radius: 999px;
  background-color: ${({ $selected }) => $selected ? '#ffb72b' : '#ffffff'};
  color: ${({ $selected }) => $selected ? '#1e1e1e' : '#5b5b5b'};
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;
