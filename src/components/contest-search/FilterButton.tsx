import styled from 'styled-components';
import Icon from './Icon';
import filterIcon from '../../assets/icons/contest-search/filter.svg';
import filterActiveIcon from '../../assets/icons/contest-search/filter-active.svg';

interface FilterButtonProps {
  count?: number;        // 적용된 필터 개수. 1 이상이면 주황색으로 강조
  onClick?: () => void;
}

export default function FilterButton({ count = 0, onClick }: FilterButtonProps) {
  const isActive = count > 0;

  return (
    <Button type="button" $active={isActive} onClick={onClick}>
      <Icon src={isActive ? filterActiveIcon : filterIcon} size={16} />
      {isActive ? `필터 ${count}` : '필터'}
    </Button>
  );
}

const Button = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 36px;
  padding: 0 14px 0 12px;
  border: 2px solid ${({ $active }) => ($active ? '#ffb72b' : '#e7e5e0')};
  border-radius: 999px;
  background: ${({ $active }) => ($active ? '#fff6dd' : '#ffffff')};
  box-shadow: 0 2px 0 rgba(30, 30, 30, 0.1);
  color: ${({ $active }) => ($active ? '#d97700' : '#1e1e1e')};
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;
