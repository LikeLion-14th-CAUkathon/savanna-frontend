import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

export interface EditableNotice {
  key: string;      // 화면용 고유값 (새 공지는 아직 id가 없음)
  id: number | null;
  content: string;
  error: string;    // 비어 있으면 저장할 때 안내 문구가 들어감
}

interface NoticeEditorProps {
  notices: EditableNotice[];
  draft: string;                       // 맨 아래 '추가' 줄에 입력 중인 내용
  onDraftChange: (content: string) => void;
  onAdd: () => void;                   // '추가' 또는 Enter
  onChange: (key: string, content: string) => void;
  onDelete: (key: string) => void;
}

// D03 · 공지 입력칸 목록 + 맨 아래 새 공지 입력 줄 (날짜·시간은 공지 내용에 같이 적음)
export default function NoticeEditor({ notices, draft, onDraftChange, onAdd, onChange, onDelete }: NoticeEditorProps) {
  const handleDraftKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return; // 한글 입력 중 Enter 무시
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onAdd();
    }
  };

  return (
    <Card>
      {notices.map((notice, index) => (
        <Item key={notice.key}>
          <Row>
            <NoticeInput
              rows={1}
              value={notice.content}
              placeholder="공지 내용 입력"
              aria-label={`공지 ${index + 1}`}
              aria-invalid={!!notice.error}
              onChange={(event) => onChange(notice.key, event.target.value)}
            />
            <SideButton type="button" aria-label={`공지 ${index + 1} 삭제`} onClick={() => onDelete(notice.key)}>
              ×
            </SideButton>
          </Row>
          {notice.error && <ErrorText role="alert">{notice.error}</ErrorText>}
        </Item>
      ))}

      {/* 새 공지 입력 줄 */}
      <Row>
        <NoticeInput
          rows={1}
          value={draft}
          placeholder={notices.length === 0 ? '공지를 추가해주세요' : '항목 내용 입력'}
          aria-label="새 공지"
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleDraftKeyDown}
        />
        <SideButton type="button" $add onClick={onAdd}>
          추가
        </SideButton>
      </Row>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: #ffffff;
`;

const Item = styled.div`
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
  min-height: 45px;
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

// 오른쪽 32px 버튼: 삭제(×) · 추가
const SideButton = styled.button<{ $add?: boolean }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $add }) => ($add ? 'var(--color-orange)' : 'var(--color-text-tertiary)')};
  font-family: 'Pretendard', sans-serif;
  font-size: ${({ $add }) => ($add ? '14px' : '17px')};
  font-weight: 700;
  white-space: nowrap;
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
