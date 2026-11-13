import styled from 'styled-components';

// 팀 소식 카드 공통 틀 (흰 바탕 + 회색 테두리 + 아래 그림자)
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;
