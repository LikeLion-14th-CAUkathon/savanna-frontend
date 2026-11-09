import type { ReactNode } from 'react';
import styled from 'styled-components';
import noticeIcon from '../../assets/icons/notice/notice-icon.svg';

interface NoticeProps {
  icon?: string;
  children?: ReactNode;
}

export default function Notice({
  icon = noticeIcon,
  children = '프로젝트 이름과 소개는 AI 공고 추천에 쓰여요.',
}: NoticeProps) {
  return (
    <NoticeBox>
      <NoticeIcon src={icon} alt="" />
      <NoticeText>{children}</NoticeText>
    </NoticeBox>
  );
}

const NoticeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 354px;
  max-width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #eef5e6;
  color: #3a7a2e;
  text-align: left;
`;

const NoticeIcon = styled.img`
  flex-shrink: 0; /* 글이 길어져도 아이콘이 찌그러지지 않게 */
`;

const NoticeText = styled.p`
  flex: 1;
  margin: 0;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 0;
`;
