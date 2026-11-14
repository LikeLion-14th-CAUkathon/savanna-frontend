import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import TabBar from '../../components/layout/TabBar';
import Icon from '../../components/contest-search/Icon';
import SearchBar from '../../components/contest-search/contest-search/SearchBar';
import RecommendCard from '../../components/contest-search/contest-search/RecommendCard';
import ContestCard from '../../components/contest-search/contest-search/ContestCard';
import FilterButton from '../../components/contest-search/contest-search/FilterButton';
import AppliedFilters from '../../components/contest-search/contest-search/AppliedFilters';
import StatusMessage from '../../components/contest-search/StatusMessage';
import FilterSheet from '../../components/contest-search/contest-filter/FilterSheet';
import { fetchContests, fetchRecommendedContests } from '../../components/contest-search/contestData';
import {
  CONTEST_STATUS_LABEL,
  EMPTY_CONTEST_FILTERS,
  type Contest,
  type ContestFilters,
  type RecommendedContest,
} from '../../types/contest';
import sparkIcon from '../../assets/icons/contest-search/spark.svg';
import sortIcon from '../../assets/icons/contest-search/sort.svg';

type LoadState = 'loading' | 'success' | 'error';

// C01 공고 찾기
export default function ContestSearchPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [recommended, setRecommended] = useState<RecommendedContest[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ContestFilters>(EMPTY_CONTEST_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 공고 목록과 AI 추천을 함께 불러온다. (처음 로딩 상태는 useState 초기값으로 처리)
  // AI 추천은 실패해도(소속 팀 없음 · AI 미연결 등) 전체 공고는 보여 주고 추천 영역만 숨긴다.
  const loadContests = useCallback(() => {
    Promise.all([fetchContests(), fetchRecommendedContests().catch((): RecommendedContest[] => [])])
      .then(([contestList, recommendedList]) => {
        setContests(contestList);
        setRecommended(recommendedList);
        setLoadState('success');
      })
      .catch(() => setLoadState('error'));
  }, []);

  useEffect(() => {
    loadContests();
  }, [loadContests]);

  const keyword = query.trim();
  // 검색어나 필터가 있으면 '검색 결과' 화면, 없으면 'AI 추천 + 전체 공고' 화면
  const filterCount = filters.categories.length + filters.statuses.length;
  const isSearching = keyword !== '' || filterCount > 0;

  const visibleContests = contests
    .filter((contest) => matchesKeyword(contest, keyword))
    .filter((contest) => matchesFilters(contest, filters))
    .sort((a, b) => a.dDay - b.dDay); // 마감 임박순

  // 결과 위에 보여줄 '적용된 필터' 칩. 분야와 접수 상태를 한 줄로 합친다.
  const appliedFilters = [
    ...filters.categories.map((category) => ({ key: `category:${category}`, label: category })),
    ...filters.statuses.map((status) => ({
      key: `status:${status}`,
      label: CONTEST_STATUS_LABEL[status],
    })),
  ];

  const retryLoad = () => {
    setLoadState('loading');
    loadContests();
  };

  const resetSearch = () => {
    setQuery('');
    setFilters(EMPTY_CONTEST_FILTERS);
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => ({
      categories: prev.categories.filter((category) => `category:${category}` !== key),
      statuses: prev.statuses.filter((status) => `status:${status}` !== key),
    }));
  };

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = useCallback(() => setIsFilterOpen(false), []);

  const applyFilters = (nextFilters: ContestFilters) => {
    setFilters(nextFilters);
    setIsFilterOpen(false);
  };

  return (
    <Page>
      {/* 헤더와 검색창은 스크롤해도 상단에 고정 */}
      <TopBar>
        <Header>
          <h1>공고 찾기</h1>
        </Header>
        <SearchArea>
          <SearchBar value={query} onChange={setQuery} />
        </SearchArea>
      </TopBar>

      <Body>
        {loadState === 'loading' && <StatusMessage title="공고를 불러오는 중이에요." />}

        {loadState === 'error' && (
          <>
            <Section>
              <SectionHead>
                <SectionTitle>검색 결과 0건</SectionTitle>
                <FilterButton count={filterCount} open={isFilterOpen} onClick={openFilter} />
              </SectionHead>
            </Section>
            <StatusMessage
              title="공고를 불러오지 못했어요."
              description="잠시 후 다시 시도해 주세요."
              actionLabel="다시 시도"
              onAction={retryLoad}
            />
          </>
        )}

        {loadState === 'success' && !isSearching && (
          <>
            {recommended.length > 0 && (
              <>
                <Section>
                  <HeadTexts>
                    <SectionTitleRow>
                      <Icon src={sparkIcon} size={20} offsetX={0.09} offsetY={-1.17} />
                      <SectionTitle>우리 팀 AI 추천</SectionTitle>
                    </SectionTitleRow>
                    <SectionDescription>
                      팀 프로젝트·분야와 잘 맞는 공고 {recommended.length}개를 골랐어요.
                    </SectionDescription>
                  </HeadTexts>
                </Section>
                <RecommendList>
                  {recommended.map((contest) => (
                    <CardLink key={contest.id} to={`/contest/${contest.id}`}>
                      <RecommendCard contest={contest} />
                    </CardLink>
                  ))}
                </RecommendList>
              </>
            )}

            <Section>
              <SectionHead>
                <HeadTexts>
                  <SectionTitle>전체 공고</SectionTitle>
                  <SortLabel />
                </HeadTexts>
                <FilterButton count={filterCount} open={isFilterOpen} onClick={openFilter} />
              </SectionHead>
              {visibleContests.length > 0 ? (
                <ContestList contests={visibleContests} />
              ) : (
                <StatusMessage title="등록된 공고가 없어요." />
              )}
            </Section>
          </>
        )}

        {loadState === 'success' && isSearching && (
          <>
            <Section>
              <SectionHead>
                <HeadTexts>
                  <SectionTitle>
                    검색 결과{' '}
                    {visibleContests.length > 0 ? (
                      <Count>{visibleContests.length}건</Count>
                    ) : (
                      '0건'
                    )}
                  </SectionTitle>
                  {visibleContests.length > 0 && <SortLabel />}
                </HeadTexts>
                <FilterButton count={filterCount} open={isFilterOpen} onClick={openFilter} />
              </SectionHead>

              {appliedFilters.length > 0 && (
                <AppliedFilters
                  filters={appliedFilters}
                  onRemove={removeFilter}
                  onReset={() => setFilters(EMPTY_CONTEST_FILTERS)}
                />
              )}

              {visibleContests.length > 0 && (
                <ContestList contests={visibleContests} highlight={keyword} />
              )}
            </Section>

            {visibleContests.length === 0 && (
              <StatusMessage
                title="조건에 맞는 공고가 없어요."
                description="검색어를 바꾸거나 전체 공고에서 찾아보세요."
                actionLabel="전체 공고 보기"
                onAction={resetSearch}
              />
            )}
          </>
        )}
      </Body>

      <BottomBar>
        <TabBar activeTab="search" />
      </BottomBar>

      {isFilterOpen && (
        <FilterSheet initialFilters={filters} onApply={applyFilters} onClose={closeFilter} />
      )}
    </Page>
  );
}

function matchesKeyword(contest: Contest, keyword: string) {
  if (keyword === '') return true;
  const lowerKeyword = keyword.toLowerCase();
  return (
    contest.title.toLowerCase().includes(lowerKeyword) ||
    contest.host.toLowerCase().includes(lowerKeyword)
  );
}

// 분야 · 접수 상태 각각 고른 게 없으면 전체, 있으면 그중 하나에 해당해야 한다.
function matchesFilters(contest: Contest, filters: ContestFilters) {
  const categoryOk = filters.categories.length === 0 || filters.categories.includes(contest.category);
  const statusOk = filters.statuses.length === 0 || filters.statuses.includes(contest.status);
  return categoryOk && statusOk;
}

function SortLabel() {
  return (
    <Sort>
      <Icon src={sortIcon} size={14} />
      마감 임박순
    </Sort>
  );
}

function ContestList({ contests, highlight }: { contests: Contest[]; highlight?: string }) {
  return (
    <List>
      {contests.map((contest) => (
        <li key={contest.id}>
          <CardLink to={`/contest/${contest.id}`}>
            <ContestCard contest={contest} highlight={highlight} />
          </CardLink>
        </li>
      ))}
    </List>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  background: #fafaf8;
`;

const SearchArea = styled.div`
  padding: 8px 24px 12px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 24px;

  h1 {
    color: #1e1e1e;
    font-size: 22px;
    font-weight: 700;
  }
`;

const Body = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0 32px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
`;

const HeadTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionTitle = styled.h2`
  color: #1e1e1e;
  font-size: 17px;
  font-weight: 700;
`;

const Count = styled.span`
  color: #d97700;
`;

const SectionDescription = styled.p`
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;

const Sort = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 500;
`;

const RecommendList = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 24px 6px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  & > * {
    scroll-snap-align: start;
    scroll-margin-left: 24px;
  }
`;

// 카드 전체를 눌러 C03 공고 상세로 이동
const CardLink = styled(Link)`
  display: flex;
  flex-shrink: 0;
  border-radius: 16px;
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
`;
