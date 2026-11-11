import styled from 'styled-components';
import { Card, EmptyText } from './detailStyles';
import noticeDot from '../../../assets/icons/expedition-detail/notice-dot.svg';
import type { ExpeditionNotice } from '../../../types/expedition';

interface NoticeListProps {
  notices: ExpeditionNotice[];
}

// 일정·제출 준비 탭 · 공지 목록
export default function NoticeList({ notices }: NoticeListProps) {
  return (
    <Card>
      {notices.length === 0 ? (
        <EmptyText>등록된 공지가 없어요.</EmptyText>
      ) : (
        <List>
          {notices.map((notice) => (
            <Item key={notice.id}>
              <img src={noticeDot} alt="" />
              <Content>{notice.content}</Content>
            </Item>
          ))}
        </List>
      )}
    </Card>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    flex-shrink: 0;
  }
`;

const Content = styled.p`
  flex: 1;
  min-width: 0;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;
