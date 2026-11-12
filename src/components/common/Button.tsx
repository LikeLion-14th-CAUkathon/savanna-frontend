import type { ComponentPropsWithoutRef } from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
}

// 종류별로 달라지는 것: 배경, 테두리, 아래 그림자
const variantStyles = {
  primary: css`
    background: #ffb72b;
    border: 2px solid transparent;
    box-shadow: 0 4px 0 #d9890a;
  `,
  secondary: css`
    background: #ffffff;
    border: 2px solid #e7e5e0;
    box-shadow: 0 4px 0 #e2e0da;
  `,
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <StyledButton type={type} $variant={variant} {...props}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 52px;
  padding: 0 24px;
  border-radius: 16px;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  ${({ $variant }) => variantStyles[$variant]}

  /* 비활성: 종류와 상관없이 회색 배경 + 연한 글자, 그림자 없음 */
  &:disabled {
    background: #efeeea;
    border-color: transparent;
    box-shadow: none;
    color: #c4c3c0;
    cursor: not-allowed;
  }
`;