import styled from 'styled-components';
import { EmptyText } from '../detail/detailStyles';

export interface EditableNotice {
  key: string;      // 화면용 고유값 (새 공지는 아직 id가 없음)
  id: number | null;
  content: string;
  error: string;    // 비어 있으면 저장할 때 안내 문구가 들어감
}

interface NoticeEditorProps {
  notices: EditableNotice[];
  focusKey: string | null; // 방금 추가한 공지 입력칸에 바로 커서
  onChange: (key: string, content: string) => void;
  onDelete: (key: string) => void;
}

// D03 · 공지 입력칸 목록 (날짜·시간은 공지 내용에 같이 적음)
export default function NoticeEditor({ notices, focusKey, onChange, onDelete }: NoticeEditorProps) {
  return (
    <Card>
      {notices.length === 0 ? (
        <EmptyText>등록된 공지가 없어요.</EmptyText>
      ) : (
        <List>
          {notices.map((notice, index) => (
            <Item key={notice.key}>
              <Row>
                <NoticeInput
                  rows={1}
                  value={notice.content}
                  placeholder="공지 내용 입력"
                  autoFocus={notice.key === focusKey}
                  aria-label={`공지 ${index + 1}`}
                  aria-invalid={!!notice.error}
                  onChange={(event) => onChange(notice.key, event.target.value)}
                />
                <DeleteButton type="button" aria-label={`공지 ${index + 1} 삭제`} onClick={() => onDelete(notice.key)}>
                  ×
                </DeleteButton>
              </Row>
              {notice.error && <ErrorText role="alert">{notice.error}</ErrorText>}
            </Item>
          ))}
        </List>
      )}
    </Card>
  );
}

const Card = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
`;

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
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 내용 길이에 맞춰 높이가 늘어나는 입력칸
const NoticeInput = styled.textarea`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
  color: var(--color-ink);
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  line-height: 1.4;
  resize: none;
  field-sizing: content;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-amber);
  }

  &[aria-invalid='true'] {
    border-color: var(--color-error);
  }
`;

const DeleteButton = styled.button`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-tertiary);
  font-family: 'Pretendard', sans-serif;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    border-radius: 6px;
  }
`;

const ErrorText = styled.p`
  padding-left: 4px;
  color: var(--color-error);
  font-size: 12px;
`;
