import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';
import { Card } from './detailStyles';
import checkedIcon from '../../../assets/icons/expedition-detail/checkbox-checked.svg';
import type { ChecklistItem } from '../../../types/expedition';

const MESSAGES = {
  empty: '체크리스트 항목을 입력해 주세요.',
  saveFailed: '저장하지 못했어요. 다시 시도해 주세요.',
};

interface SubmitChecklistProps {
  items: ChecklistItem[];
  onAdd: (content: string) => Promise<boolean>;       // 저장 성공 여부
  onUpdate: (id: number, content: string) => Promise<boolean>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

// 일정·제출 준비 탭 · 제출 체크리스트 (별도 저장 버튼 없이 바로 저장)
// 새 항목은 목록 마지막 줄의 입력칸에서 바로 추가
export default function SubmitChecklist({ items, onAdd, onUpdate, onToggle, onDelete }: SubmitChecklistProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState('');

  const [newDraft, setNewDraft] = useState('');
  const [newError, setNewError] = useState('');
  const savingRef = useRef(false); // 저장 중 중복 저장 방지 (Enter 후 blur 등)

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditDraft(item.content);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const submitEdit = async (item: ChecklistItem) => {
    if (savingRef.current) return;
    const content = editDraft.trim();
    if (!content) {
      setEditError(MESSAGES.empty);
      return;
    }
    if (content === item.content) {
      cancelEdit();
      return;
    }
    savingRef.current = true;
    const ok = await onUpdate(item.id, content);
    savingRef.current = false;
    if (ok) cancelEdit();
    else setEditError(MESSAGES.saveFailed); // 입력 내용은 그대로 두고 다시 시도
  };

  const clearAdd = () => {
    setNewDraft('');
    setNewError('');
  };

  const submitAdd = async () => {
    if (savingRef.current) return;
    const content = newDraft.trim();
    if (!content) {
      setNewError(MESSAGES.empty);
      return;
    }
    savingRef.current = true;
    const ok = await onAdd(content);
    savingRef.current = false;
    if (ok) clearAdd(); // 입력칸은 남겨둬서 이어서 추가할 수 있게
    else setNewError(MESSAGES.saveFailed);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>, item: ChecklistItem) => {
    if (event.nativeEvent.isComposing) return; // 한글 입력 중 Enter 무시
    if (event.key === 'Enter') submitEdit(item);
    if (event.key === 'Escape') cancelEdit();
  };

  const handleAddKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') submitAdd();
    if (event.key === 'Escape') clearAdd();
  };

  return (
    <ChecklistCard>
      <List>
        {items.map((item) => (
          <Row key={item.id}>
            <RowMain>
              <CheckButton
                type="button"
                role="checkbox"
                aria-checked={item.done}
                aria-label={item.content}
                onClick={() => onToggle(item.id)}
              >
                {item.done ? <img src={checkedIcon} alt="" /> : <EmptyBox />}
              </CheckButton>

              {editingId === item.id ? (
                <ItemInput
                  autoFocus
                  value={editDraft}
                  aria-invalid={!!editError}
                  aria-label="체크리스트 항목 수정"
                  onChange={(event) => {
                    setEditDraft(event.target.value);
                    setEditError('');
                  }}
                  onKeyDown={(event) => handleEditKeyDown(event, item)}
                  onBlur={() => submitEdit(item)}
                />
              ) : (
                <ItemText type="button" $done={item.done} onClick={() => startEdit(item)}>
                  {item.content}
                </ItemText>
              )}

              <DeleteButton type="button" aria-label={`${item.content} 삭제`} onClick={() => onDelete(item.id)}>
                ×
              </DeleteButton>
            </RowMain>
            {editingId === item.id && editError && <ErrorText role="alert">{editError}</ErrorText>}
          </Row>
        ))}

        {/* 목록 마지막 줄: 새 항목 입력 */}
        <Row>
          <RowMain>
            <PlusMark aria-hidden="true">+</PlusMark>
            <NewItemInput
              value={newDraft}
              placeholder="항목 내용 입력"
              aria-invalid={!!newError}
              aria-label="새 체크리스트 항목"
              onChange={(event) => {
                setNewDraft(event.target.value);
                setNewError('');
              }}
              onKeyDown={handleAddKeyDown}
            />
            <AddButton type="button" onClick={submitAdd}>
              추가
            </AddButton>
          </RowMain>
          {newError && <ErrorText role="alert">{newError}</ErrorText>}
        </Row>
      </List>
    </ChecklistCard>
  );
}

const ChecklistCard = styled(Card)`
  padding: 4px 16px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled.li`
  padding: 8px 0;

  & + & {
    border-top: 1px solid var(--color-gray-bg);
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CheckButton = styled.button`
  display: flex;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

const EmptyBox = styled.span`
  display: block;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  border: 2px solid #d7d4cd;
  border-radius: 6px;
  background: #ffffff;
`;

// 입력 줄 왼쪽의 '+' (체크박스 자리와 같은 너비)
const PlusMark = styled.span`
  flex-shrink: 0;
  width: 22px;
  color: var(--color-orange);
  font-family: 'Pretendard', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
`;

const AddButton = styled.button`
  flex-shrink: 0;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--color-orange);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const ItemText = styled.button<{ $done: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: ${({ $done }) => ($done ? 'var(--color-text-secondary)' : 'var(--color-ink)')};
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  overflow-wrap: anywhere;
  cursor: text;
`;

const ItemInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  border: 0;
  border-bottom: 1.5px solid var(--color-amber);
  background: transparent;
  color: var(--color-ink);
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  line-height: 1.4;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
  }

  &[aria-invalid='true'] {
    border-bottom-color: var(--color-error);
  }
`;

// 새 항목 입력칸: 평소엔 밑줄 없이 안내 문구만, 입력 중일 때만 밑줄
const NewItemInput = styled(ItemInput)`
  border-bottom-color: transparent;

  &:focus {
    border-bottom-color: var(--color-amber);
  }
`;

const DeleteButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
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
    border-radius: 4px;
  }
`;

const ErrorText = styled.p`
  margin-top: 6px;
  padding-left: 34px;
  color: var(--color-error);
  font-size: 12px;
`;
