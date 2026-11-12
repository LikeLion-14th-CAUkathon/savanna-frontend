import { useState } from 'react';
import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import Button from '../../common/Button';
import FilterChip from '../../common/FilterChip';
import {
  CONTEST_CATEGORIES,
  CONTEST_STATUSES,
  CONTEST_STATUS_LABEL,
  EMPTY_CONTEST_FILTERS,
  type ContestFilters,
} from '../../../types/contest';

interface FilterSheetProps {
  initialFilters: ContestFilters;              // 시트를 열 때 이미 적용돼 있던 조건
  onApply: (filters: ContestFilters) => void;  // '적용하기'를 눌렀을 때
  onClose: () => void;                         // 닫기 · 바깥 영역 · Esc (적용하지 않음)
}

// C02 공고 필터 바텀시트. 부모가 열 때만 렌더링한다.
export default function FilterSheet({ initialFilters, onApply, onClose }: FilterSheetProps) {
  // '적용하기' 전까지는 시트 안에서만 바뀌는 임시 선택값
  const [draft, setDraft] = useState<ContestFilters>(initialFilters);

  return (
    <BottomSheet title="공고 필터" onClose={onClose}>
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
    </BottomSheet>
  );
}

// 목록에 있으면 빼고, 없으면 넣는다.
function toggleItem<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

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
