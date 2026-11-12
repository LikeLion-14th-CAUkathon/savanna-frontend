import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '../../common/Button';
import FilterChip from '../../common/FilterChip';
import Icon from '../Icon';
import {
  CONTEST_CATEGORIES,
  CONTEST_STATUSES,
  CONTEST_STATUS_LABEL,
  EMPTY_CONTEST_FILTERS,
  type ContestFilters,
} from '../../../types/contest';
import closeIcon from '../../../assets/icons/contest-search/close.svg';

interface FilterSheetProps {
  initialFilters: ContestFilters;              // 시트를 열 때 이미 적용돼 있던 조건
  onApply: (filters: ContestFilters) => void;  // '적용하기'를 눌렀을 때
  onClose: () => void;                         // 닫기 · 바깥 영역 · Esc (적용하지 않음)
}

// C02 공고 필터 바텀시트. 부모가 열 때만 렌더링한다.
export default function FilterSheet({ initialFilters, onApply, onClose }: FilterSheetProps) {
  // '적용하기' 전까지는 시트 안에서만 바뀌는 임시 선택값
  const [draft, setDraft] = useState<ContestFilters>(initialFilters);
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  // 열리면 시트로 포커스를 옮기고, Esc로 닫을 수 있게 한다.
  useEffect(() => {
    sheetRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <Scrim onClick={onClose} aria-hidden="true" />
      <Sheet ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <Handle aria-hidden="true" />

        <TitleRow>
          <Title id={titleId}>공고 필터</Title>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            <Icon src={closeIcon} size={22} />
          </CloseButton>
        </TitleRow>

        <Group>
          <GroupLabel>
            <strong>분야</strong>
            <span>여러 개 고를 수 있어요</span>
          </GroupLabel>
          <Chips>
            {CONTEST_CATEGORIES.map((category) => (
              <FilterChip
                key={category}
                selected={draft.categories.includes(category)}
                onClick={() =>
                  setDraft((prev) => ({ ...prev, categories: toggleItem(prev.categories, category) }))
                }
              >
                {category}
              </FilterChip>
            ))}
          </Chips>
        </Group>

        <Group>
          <GroupLabel>
            <strong>접수 상태</strong>
          </GroupLabel>
          <Chips>
            {CONTEST_STATUSES.map((status) => (
              <FilterChip
                key={status}
                selected={draft.statuses.includes(status)}
                onClick={() =>
                  setDraft((prev) => ({ ...prev, statuses: toggleItem(prev.statuses, status) }))
                }
              >
                {CONTEST_STATUS_LABEL[status]}
              </FilterChip>
            ))}
          </Chips>
        </Group>

        <Actions>
          <ResetButton variant="secondary" onClick={() => setDraft(EMPTY_CONTEST_FILTERS)}>
            초기화
          </ResetButton>
          <ApplyButton onClick={() => onApply(draft)}>적용하기</ApplyButton>
        </Actions>
      </Sheet>
    </>
  );
}

// 목록에 있으면 빼고, 없으면 넣는다.
function toggleItem<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(30, 30, 30, 0.45);
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  max-height: 90svh;
  overflow-y: auto;
  padding: 12px 24px 34px;
  border-radius: 24px 24px 0 0;
  background: #fafaf8;
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
  transform: translateX(-50%);
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  text-align: left;
  outline: none;
`;

const Handle = styled.div`
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #d7d4cd;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: #1e1e1e;
  font-size: 20px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: -2px;
    border-radius: 8px;
  }
`;

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  strong {
    color: #1e1e1e;
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: #999896;
    font-size: 13px;
    font-weight: 400;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ResetButton = styled(Button)`
  flex-shrink: 0;
  width: 112px;
`;

const ApplyButton = styled(Button)`
  flex: 1;
  min-width: 0;
`;
