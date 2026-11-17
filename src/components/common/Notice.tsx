import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import noticeIcon from '../../assets/icons/notice/notice-icon.svg';
import warningIcon from '../../assets/icons/notice/info-warning.svg';

type NoticeTone = 'info' | 'warning';

interface NoticeProps {
  icon?: string;
  tone?: NoticeTone; // info: 초록 안내(기본) · warning: 노란 경고 (예: 원정 6개 제한)
  children?: ReactNode;
}

export default function Notice({
  icon,
  tone = 'info',
  children = '프로젝트 이름과 소개는 AI 공고 추천에 쓰여요.',
}: NoticeProps) {
  return (
    <NoticeBox $tone={tone}>
      <NoticeIcon src={icon ?? (tone === 'warning' ? warningIcon : noticeIcon)} alt="" />
      <NoticeText $tone={tone}>{children}</NoticeText>
    </NoticeBox>
  );
}

const NoticeBox = styled.div<{ $tone: NoticeTone }>`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #eef5e6;
  color: #3a7a2e;
  text-align: left;

  ${({ $tone }) =>
    $tone === 'warning' &&
    css`
      padding: 12px 14px;
      background-color: var(--color-amber-bg);
      color: var(--color-orange);
    `}
`;

const NoticeIcon = styled.img`
  flex-shrink: 0; /* 글이 길어져도 아이콘이 찌그러지지 않게 */
`;

const NoticeText = styled.p<{ $tone: NoticeTone }>`
  flex: 1;
  margin: 0;
  font-family: 'Pretendard', sans-serif;
  font-size: ${({ $tone }) => ($tone === 'warning' ? '14px' : '13px')};
  font-weight: ${({ $tone }) => ($tone === 'warning' ? 700 : 500)};
  line-height: normal;
  letter-spacing: 0;
`;
