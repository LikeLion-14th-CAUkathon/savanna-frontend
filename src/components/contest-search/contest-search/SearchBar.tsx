import styled from 'styled-components';
import Icon from '../Icon';
import searchIcon from '../../../assets/icons/contest-search/search.svg';
import searchFilledIcon from '../../../assets/icons/contest-search/search-filled.svg';
import clearIcon from '../../../assets/icons/contest-search/clear.svg';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '공고명·주최 기관 검색',
}: SearchBarProps) {
  const hasValue = value !== '';

  return (
    <Box>
      {/* 검색어가 있으면 진한 돋보기 아이콘 */}
      <Icon src={hasValue ? searchFilledIcon : searchIcon} size={20} />
      <SearchInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="공고 검색"
        enterKeyHint="search"
      />
      {hasValue && (
        <ClearButton type="button" aria-label="검색어 지우기" onClick={() => onChange('')}>
          <Icon src={clearIcon} size={20} />
        </ClearButton>
      )}
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 2px solid #e7e5e0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 0 rgba(30, 30, 30, 0.1);

  &:focus-within {
    border-color: #ffb72b;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;

  &::placeholder {
    color: #999896;
  }

  /* 브라우저 기본 지우기(x) 버튼은 숨기고 디자인의 버튼을 쓴다 */
  &::-webkit-search-cancel-button {
    appearance: none;
  }
`;

const ClearButton = styled.button`
  display: flex;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 999px;
  }
`;
