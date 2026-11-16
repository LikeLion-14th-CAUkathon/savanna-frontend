import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled, { keyframes } from 'styled-components';
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
  // AI 추천을 불러오는(새로 만드는) 중인지. 이 동안 추천 자리에 점 3개 로딩을 보여 준다.
  const [isRecommendLoading, setIsRecommendLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ContestFilters>(EMPTY_CONTEST_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 공고 목록과 AI 추천을 따로 불러온다. (처음 로딩 상태는 useState 초기값으로 처리)
  // AI 추천은 새로 만들 때 몇 초 걸릴 수 있어서, 전체 공고를 기다리게 하지 않고 먼저 보여 준다.
  // AI 추천은 실패해도(소속 팀 없음 · AI 미연결 등) 전체 공고는 보여 주고 추천 영역만 숨긴다.
  const loadContests = useCallback(() => {
    fetchContests()
      .then((contestList) => {
        setContests(contestList);
        setLoadState('success');
      })
      .catch(() => setLoadState('error'));

    fetchRecommendedContests()
      .catch((): RecommendedContest[] => [])
      .then((recommendedList) => {
        setRecommended(recommendedList);
        setIsRecommendLoading(false);
      });
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
    setIsRecommendLoading(true);
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
            {(isRecommendLoading || recommended.length > 0) && (
              <>
                <Section>
                  <HeadTexts>
                    <SectionTitleRow>
                      <Icon src={sparkIcon} size={20} offsetX={0.09} offsetY={-1.17} />
                      <SectionTitle>우리 팀 AI 추천</SectionTitle>
                    </SectionTitleRow>
                    <SectionDescription>
                      {isRecommendLoading
                        ? '우리 팀에 맞는 공고를 고르고 있어요.'
                        : `팀 프로젝트·분야와 잘 맞는 공고 ${recommended.length}개를 골랐어요.`}
                    </SectionDescription>
                  </HeadTexts>
                  {isRecommendLoading && (
                    <LoadingDots role="status" aria-label="AI 추천을 불러오는 중">
                      <span />
                      <span />
                      <span />
                    </LoadingDots>
                  )}
                </Section>
                {!isRecommendLoading && (
                  <RecommendList>
                    {recommended.map((contest) => (
                      <CardLink key={contest.id} to={`/contest/${contest.id}`}>
                        <RecommendCard contest={contest} />
                      </CardLink>
                    ))}
                  </RecommendList>
                )}
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
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }

  /* 태블릿·노트북에서는 가운데 폰 화면 프레임 안에서 스크롤한다. */
  @media (min-width: 481px) {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;

    /* 내용이 프레임보다 길면 헤더 등이 눌려 줄어들지 않고 스크롤되게 한다. */
    & > * {
      flex-shrink: 0;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }
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

// AI 추천 로딩: 점 3개가 차례로 통통 튄다.
const dotBounce = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-6px);
  }
`;

const LoadingDots = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-amber);
    animation: ${dotBounce} 1.2s ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 0.15s;
  }

  span:nth-child(3) {
    animation-delay: 0.3s;
  }

  /* 움직임 줄이기 설정이면 튀지 않고 깜빡이기만 한다. */
  @media (prefers-reduced-motion: reduce) {
    span {
      animation-name: none;
      opacity: 0.6;
    }
  }
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
