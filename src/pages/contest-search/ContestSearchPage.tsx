import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import TabBar from '../../components/layout/TabBar';
import Icon from '../../components/contest-search/Icon';
import SearchBar from '../../components/contest-search/SearchBar';
import RecommendCard from '../../components/contest-search/RecommendCard';
import ContestCard from '../../components/contest-search/ContestCard';
import FilterButton from '../../components/contest-search/FilterButton';
import AppliedFilters from '../../components/contest-search/AppliedFilters';
import StatusMessage from '../../components/contest-search/StatusMessage';
import { fetchContests, fetchRecommendedContests } from '../../mocks/contests';
import {
  CONTEST_STATUS_LABEL,
  type Contest,
  type ContestStatus,
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
  // 상태 필터. C02 공고 필터 화면이 연결되면 그 화면에서 값을 채운다.
  const [statusFilters, setStatusFilters] = useState<ContestStatus[]>([]);

  // 공고 목록과 AI 추천을 함께 불러온다. (처음 로딩 상태는 useState 초기값으로 처리)
  const loadContests = useCallback(() => {
    Promise.all([fetchContests(), fetchRecommendedContests()])
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
  const isSearching = keyword !== '' || statusFilters.length > 0;

  const visibleContests = contests
    .filter((contest) => matchesKeyword(contest, keyword))
    .filter((contest) => statusFilters.length === 0 || statusFilters.includes(contest.status))
    .sort((a, b) => a.dDay - b.dDay); // 마감 임박순

  const retryLoad = () => {
    setLoadState('loading');
    loadContests();
  };

  const resetSearch = () => {
    setQuery('');
    setStatusFilters([]);
  };

  const removeStatusFilter = (status: string) => {
    setStatusFilters((prev) => prev.filter((item) => item !== status));
  };

  const openFilter = () => {
    // TODO: C02 공고 필터 화면 연결
  };

  return (
    <Page>
      <Header>
        <h1>공고 찾기</h1>
      </Header>

      <Body>
        <Section>
          <SearchBar value={query} onChange={setQuery} />
        </Section>

        {loadState === 'loading' && <StatusMessage title="공고를 불러오는 중이에요." />}

        {loadState === 'error' && (
          <>
            <Section>
              <SectionHead>
                <SectionTitle>검색 결과 0건</SectionTitle>
                <FilterButton count={statusFilters.length} onClick={openFilter} />
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
                    <RecommendCard key={contest.id} contest={contest} />
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
                <FilterButton onClick={openFilter} />
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
                <FilterButton count={statusFilters.length} onClick={openFilter} />
              </SectionHead>

              {statusFilters.length > 0 && (
                <AppliedFilters
                  filters={statusFilters.map((status) => ({
                    key: status,
                    label: CONTEST_STATUS_LABEL[status],
                  }))}
                  onRemove={removeStatusFilter}
                  onReset={() => setStatusFilters([])}
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
        {/* TODO: 라우터 연결 후 탭 이동 처리 */}
        <TabBar activeTab="search" onTabChange={() => {}} />
      </BottomBar>
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
          <ContestCard contest={contest} highlight={highlight} />
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
  padding: 8px 0 32px;
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
