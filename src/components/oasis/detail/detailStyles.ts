import styled from 'styled-components';

// 구역 안의 흰 카드
export const Card = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
`;

// 내용이 없을 때 안내 문구
export const EmptyText = styled.p`
  color: var(--color-text-tertiary);
  font-size: 14px;
  font-weight: 500;
`;
