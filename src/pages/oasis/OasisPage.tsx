import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import TabBar from '../../components/layout/TabBar';
import type { TabId } from '../../components/layout/TabBar';
import ExpeditionStatusCard from '../../components/oasis/ExpeditionStatusCard';
import TeamSwitchButton from '../../components/oasis/TeamSwitchButton';
import ExpeditionSign from '../../components/oasis/ExpeditionSign';
import HomeSign from '../../components/oasis/HomeSign';
import MapNoticePopup from '../../components/oasis/MapNoticePopup';
import { formatDDay, isPastDeadline } from '../../utils/dday';
import { EXPEDITION_STAGE_LABEL } from '../../types/oasis';
import type { OasisExpedition, OasisState } from '../../types/oasis';
import shortMapImage from '../../assets/images/oasis/oasis-short-map.png';
import longMapImage from '../../assets/images/oasis/oasis-long-map.png';
import lionImage from '../../assets/images/oasis/lion.png';
import elephantImage from '../../assets/images/oasis/elephant.png';
import meerkatImage from '../../assets/images/oasis/meerkat.png';

const MESSAGES = {
  empty: '아직 시작한 원정이 없어요.',
  error: '원정을 불러오지 못했어요. 다시 시도해 주세요.',
  loading: '원정 지도를 불러오는 중이에요.',
};

const MAP_WIDTH = 402;
const TAB_BAR_HEIGHT = 75;

// 원정이 이 개수 이하면 노을까지 한 화면에 보이는 짧은 지도, 넘으면 끌어서 보는 긴 지도
const SHORT_MAP_MAX = 2;

// slots: 웅덩이 자리 (앞쪽일수록 오아시스에 가까움 → 마감이 가까운 원정부터 배치)
// home: 지도에 그려진 큰 표지판·오아시스 기준 위치
const MAPS = {
  short: {
    image: shortMapImage,
    height: 848.7,
    background: '#f6cf55',
    bottomSpace: 0,
    slots: [
      { left: 108, top: 340 },
      { left: 164, top: 180 },
    ],
    home: {
      board: { left: 27.75, top: 567.65, width: 204.5, height: 71.7 },
      ideaBadge: { left: 12, top: 556 },
      lion: { left: 223.41, top: 662.91, width: 72.952, height: 73.185 },
      elephant: { left: 17.22, top: 701.08, width: 73.307, height: 61.846 },
      meerkat: { left: 183.88, top: 713.23, width: 40.826, height: 51.538 },
    },
  },
  long: {
    image: longMapImage,
    height: 1206,
    background: '#fcd358',
    bottomSpace: TAB_BAR_HEIGHT, // 탭바에 오아시스가 가리지 않게
    // TODO: 원정이 7개 이상이면 6개까지만 보임
    slots: [
      { left: 44, top: 787 },
      { left: 128, top: 655 },
      { left: -36, top: 523 },
      { left: 64, top: 359 },
      { left: 120, top: 231 },
      { left: 152, top: 75 },
    ],
    home: {
      board: { left: 25, top: 998, width: 193, height: 64 },
      ideaBadge: { left: 12, top: 986 },
      lion: { left: 210, top: 1087, width: 73.185, height: 73.185 },
      elephant: { left: 21, top: 1120, width: 73.185, height: 61.846 },
      meerkat: { left: 173, top: 1130, width: 41.231, height: 51.538 },
    },
  },
};

const sortByDeadline = (expeditions: OasisExpedition[]) =>
  [...expeditions].sort((a, b) => {
    const aPast = isPastDeadline(a.deadline);
    const bPast = isPastDeadline(b.deadline);
    if (aPast !== bPast) return aPast ? 1 : -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

const formatProgress = (expedition: OasisExpedition) =>
  `${EXPEDITION_STAGE_LABEL[expedition.stage]} · 참여 ${expedition.participantCount}명`;

// ---------------------------------------------------------------------------
// 테스트용 임시 데이터 (TODO: API 연결 시 이 부분을 지우고 실제 요청 결과로 교체)
// 기본은 데이터가 없는 상태(원정 없음). 주소 뒤에 붙여서 다른 상태 확인:
//   ?preview=1 ~ ?preview=6  원정 개수 (2개까지 짧은 지도, 3개부터 긴 지도)
//   ?preview=loading 불러오는 중   ?preview=error  조회 실패
// ---------------------------------------------------------------------------
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const SAMPLE_TEAM = {
  teamId: 1,
  teamName: '사바나 탐험대',
  memberCount: 3,
  ideaCount: 0,
  hasNewTeamNews: false,
};

const SAMPLE_EXPEDITIONS: OasisExpedition[] = [
  { id: 1, contestTitle: '헬스케어 AI 아이디어 공모전', deadline: daysFromNow(14), stage: 'DRAFT', participantCount: 2 },
  { id: 2, contestTitle: '청년 사회문제 해결 해커톤', deadline: daysFromNow(5), stage: 'KICKOFF', participantCount: 1 },
  { id: 3, contestTitle: '서울 청년 현장 아이디어톤', deadline: daysFromNow(10), stage: 'KICKOFF', participantCount: 1 },
  { id: 4, contestTitle: '대학생 서비스 기획 경진대회', deadline: daysFromNow(21), stage: 'FINAL_REVIEW', participantCount: 3 },
  { id: 5, contestTitle: '오픈데이터 앱 디자인 챌린지', deadline: daysFromNow(30), stage: 'KICKOFF', participantCount: 2 },
  { id: 6, contestTitle: '환경 아이디어 공모전', deadline: daysFromNow(2), stage: 'SUBMIT', participantCount: 3 },
];

const getPreviewState = (): OasisState => {
  const preview = new URLSearchParams(window.location.search).get('preview');
  if (preview === 'loading') return { status: 'loading' };
  if (preview === 'error') return { status: 'error' };
  const count = Number(preview);
  if (count > 0) {
    return {
      status: 'success',
      data: { ...SAMPLE_TEAM, ideaCount: 4, hasNewTeamNews: true, expeditions: SAMPLE_EXPEDITIONS.slice(0, count) },
    };
  }
  return { status: 'success', data: { ...SAMPLE_TEAM, expeditions: [] } };
};
// ---------------------------------------------------------------------------


const goToExpeditionDetail = (_expeditionId: number) => {};
const goToTeamSpace = () => {};
const goToContestSearch = () => {};
const handleTabChange = (_tab: TabId) => {};

export default function OasisPage() {
  const [state] = useState(getPreviewState);
  const retry = () => {}; // TODO: API 연결 시 다시 요청

  const mapRef = useRef<HTMLDivElement>(null);

  const data = state.status === 'success' ? state.data : null;
  const expeditions = data ? sortByDeadline(data.expeditions) : [];
  const hasExpedition = expeditions.length > 0;
  const map = expeditions.length <= SHORT_MAP_MAX ? MAPS.short : MAPS.long;
  const visibleExpeditions = expeditions.slice(0, map.slots.length);

  const nextOpen = expeditions.find((expedition) => !isPastDeadline(expedition.deadline));
  const nextDeadline = data ? (nextOpen ? formatDDay(nextOpen.deadline) : '-') : undefined;

  // 처음엔 지도 맨 아래(우리 팀 오아시스)가 보이게
  useLayoutEffect(() => {
    const scroller = mapRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [state.status, map]);

  return (
    <Stage aria-busy={state.status === 'loading'} style={{ background: map.background }}>
      <MapScroller ref={mapRef}>
        <MapContent style={{ height: map.height, marginBottom: map.bottomSpace }}>
          <MapImage src={map.image} alt="" style={{ height: map.height }} />

          <Character style={{ ...map.home.elephant, transform: 'scaleX(-1)' }} aria-hidden="true">
            <CharacterImage
              src={elephantImage}
              alt=""
              style={{ left: '-11.04%', top: '-24.56%', width: '123.67%', height: '146.58%' }}
            />
          </Character>
          <Character style={map.home.meerkat} aria-hidden="true">
            <CharacterImage
              src={meerkatImage}
              alt=""
              style={{ left: '-31.37%', top: '-16.99%', width: '169.64%', height: '134.38%' }}
            />
          </Character>
          <Character style={map.home.lion} aria-hidden="true">
            <CharacterImage
              src={lionImage}
              alt=""
              style={{ left: '-16.14%', top: '-16.61%', width: '133.12%', height: '132.7%' }}
            />
          </Character>

         
          {visibleExpeditions
            .map((expedition, index) => (
              <ExpeditionSign
                key={expedition.id}
                left={map.slots[index].left}
                top={map.slots[index].top}
                title={expedition.contestTitle}
                dDayLabel={formatDDay(expedition.deadline)}
                progressLabel={formatProgress(expedition)}
                onClick={() => goToExpeditionDetail(expedition.id)}
              />
            ))
            .reverse()}

          <HomeSign ideaCount={data?.ideaCount} board={map.home.board} badge={map.home.ideaBadge} onClick={goToTeamSpace} />
        </MapContent>
      </MapScroller>

      <StatusArea>
        <ExpeditionStatusCard
          memberCount={data?.memberCount}
          expeditionCount={data?.expeditions.length}
          nextDeadline={nextDeadline}
        />
      </StatusArea>

      {data && (
        <TeamSwitchArea>
          <TeamSwitchButton teamName={data.teamName} />
        </TeamSwitchArea>
      )}

      {state.status === 'loading' && <VisuallyHidden role="status">{MESSAGES.loading}</VisuallyHidden>}

      {state.status === 'error' && (
        <PopupArea>
          <MapNoticePopup message={MESSAGES.error} actionLabel="다시 시도" onAction={retry} isError />
        </PopupArea>
      )}

      {data && !hasExpedition && (
        <PopupArea>
          <MapNoticePopup message={MESSAGES.empty} actionLabel="공고 찾기" onAction={goToContestSearch} />
        </PopupArea>
      )}

      <TabBarArea>
        <TabBar activeTab="oasis" onTabChange={handleTabChange} hasNew={data?.hasNewTeamNews ?? false} rounded />
      </TabBarArea>
    </Stage>
  );
}

const Stage = styled.main`
  position: relative;
  width: ${MAP_WIDTH}px;
  height: 874px;
  margin: 0 auto;
  overflow: hidden;
`;

// 지도만 위아래로 끌어서 보는 영역 (상단 카드·하단 탭바는 고정)
const MapScroller = styled.div`
  position: absolute;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MapContent = styled.div`
  position: relative;
  width: ${MAP_WIDTH}px;
`;

const MapImage = styled.img`
  display: block;
  width: ${MAP_WIDTH}px;
  pointer-events: none;
  user-select: none;
`;

const Character = styled.div`
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`;

const CharacterImage = styled.img`
  position: absolute;
  max-width: none;
`;

const StatusArea = styled.div`
  position: absolute;
  top: 58px;
  left: 24px;
`;

const TeamSwitchArea = styled.div`
  position: absolute;
  top: 133px;
  left: 246px;
  max-width: 140px;
`;

const PopupArea = styled.div`
  position: absolute;
  top: 192px;
  left: 24px;
`;

const TabBarArea = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
`;

const VisuallyHidden = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
