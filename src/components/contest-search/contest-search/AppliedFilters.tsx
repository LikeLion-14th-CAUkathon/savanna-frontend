import styled from 'styled-components';
import Icon from '../Icon';
import chipRemoveIcon from '../../../assets/icons/contest-search/chip-remove.svg';
import refreshIcon from '../../../assets/icons/contest-search/refresh.svg';

interface AppliedFilter {
  key: string;
  label: string;
}

interface AppliedFiltersProps {
  filters: AppliedFilter[];
  onRemove: (key: string) => void;
  onReset: () => void;
}

// 검색 결과 위에 보여주는 '적용된 필터' 칩 목록
export default function AppliedFilters({ filters, onRemove, onReset }: AppliedFiltersProps) {
  return (
    <Row>
      {filters.map((filter) => (
        <Chip
          key={filter.key}
          type="button"
          aria-label={`${filter.label} 필터 해제`}
          onClick={() => onRemove(filter.key)}
        >
          {filter.label}
          <Icon src={chipRemoveIcon} size={12} />
        </Chip>
      ))}
      <ResetButton type="button" onClick={onReset}>
        <Icon src={refreshIcon} size={14} offsetX={1.75} offsetY={1.22} />
        필터 초기화
      </ResetButton>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px 6px 12px;
  border: 0;
  border-radius: 999px;
  background: #fff6dd;
  color: #d97700;
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;

const ResetButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border: 0;
  background: transparent;
  color: #5b5b5b;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
