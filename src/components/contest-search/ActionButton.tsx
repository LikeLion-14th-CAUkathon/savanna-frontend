import type { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

type ActionButtonProps = ComponentPropsWithoutRef<'button'>;

// 결과 없음 · 조회 실패 안내 아래에 쓰는 흰색 M(44px) 버튼 ("전체 공고 보기", "다시 시도")
export default function ActionButton({ children, type = 'button', ...props }: ActionButtonProps) {
  return (
    <StyledButton type={type} {...props}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;
