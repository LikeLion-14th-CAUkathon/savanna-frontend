import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import TabBar from '../../components/layout/TabBar';
import ExpeditionStatusCard from '../../components/oasis/ExpeditionStatusCard';
import TeamSwitchButton from '../../components/oasis/TeamSwitchButton';
import ExpeditionSign from '../../components/oasis/ExpeditionSign';
import HomeSign from '../../components/oasis/HomeSign';
import MapNoticePopup from '../../components/oasis/MapNoticePopup';
import { fetchOasisHome } from '../../components/oasis/oasisData';
import { formatDDay, isPastDeadline } from '../../utils/dday';
import { EXPEDITION_STAGE_LABEL } from '../../types/oasis';
import { OASIS_PATHS } from '../../routes/oasisPaths';
import type { OasisExpedition, OasisState } from '../../types/oasis';
import shortMapImage from '../../assets/images/oasis/oasis-short-map.webp';
import longMapImage from '../../assets/images/oasis/oasis-long-map.webp';
import lionImage from '../../assets/images/oasis/lion.webp';
import elephantImage from '../../assets/images/oasis/elephant.webp';
import meerkatImage from '../../assets/images/oasis/meerkat.webp';

const MESSAGES = {
  empty: '아직 시작한 원정이 없어요.',
  noTeam: '아직 소속된 팀이 없어요.',
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
    skyColor: '#feb056',    
    groundColor: '#f6cf55',
    bottomSpace: 874 - 848.7, 
    slots: [
      { left: 108, top: 340 },
      { left: 164, top: 180 },
    ],
    home: {
      board: { left: 27.75, top: 567.65, width: 204.5, height: 71.7 },
      lion: { left: 223.41, top: 662.91, width: 72.952, height: 73.185 },
      elephant: { left: 17.22, top: 701.08, width: 73.307, height: 61.846 },
      meerkat: { left: 183.88, top: 713.23, width: 40.826, height: 51.538 },
    },
  },
  long: {
    image: longMapImage,
    height: 1206,
    skyColor: '#fda852',
    groundColor: '#fcd358',
    bottomSpace: TAB_BAR_HEIGHT, // 탭바에 오아시스가 가리지 않게
  
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

// 아직 주소가 없는 화면 (TODO: 해당 화면 주소가 생기면 연결)
//  - 우리 팀 프로젝트 → B02 팀 공간 / 하단 탭: 팀 공간, 마이페이지
const CONTEST_SEARCH_PATH = '/contest'; // C01 공고 찾기 (App.tsx 기준)
const TEAM_CREATE_PATH = '/team/create'; // B01 팀 생성 (App.tsx 기준)
const goToTeamSpace = () => {};

export default function OasisPage() {
  const navigate = useNavigate();
  const goToExpeditionDetail = (expeditionId: number) => navigate(OASIS_PATHS.expeditionDetail(expeditionId));
  const goToContestSearch = () => navigate(CONTEST_SEARCH_PATH);
  const goToTeamCreate = () => navigate(TEAM_CREATE_PATH);

  const [state, setState] = useState<OasisState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    let ignore = false; // 화면을 떠난 뒤 도착한 응답은 무시
    fetchOasisHome()
      .then((home) => {
        if (!ignore) setState(home ? { status: 'success', data: home } : { status: 'noTeam' });
      })
      .catch(() => {
        if (!ignore) setState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

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
    <Stage aria-busy={state.status === 'loading'} style={{ background: map.skyColor }}>
      <MapScroller ref={mapRef}>
        <MapContent style={{ paddingBottom: map.bottomSpace, background: map.groundColor }}>
          <MapImage src={map.image} alt="" style={{ height: map.height }} />

          <Character src={elephantImage} alt="" style={map.home.elephant} />
          <Character src={meerkatImage} alt="" style={map.home.meerkat} />
          <Character src={lionImage} alt="" style={map.home.lion} />

         
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

          <HomeSign board={map.home.board} onClick={goToTeamSpace} />
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

      {state.status === 'noTeam' && (
        <PopupArea>
          <MapNoticePopup message={MESSAGES.noTeam} actionLabel="팀 만들기" onAction={goToTeamCreate} />
        </PopupArea>
      )}

      {data && !hasExpedition && (
        <PopupArea>
          <MapNoticePopup message={MESSAGES.empty} actionLabel="공고 찾기" onAction={goToContestSearch} />
        </PopupArea>
      )}

      <TabBarArea>
        <TabBar activeTab="oasis" hasNew={data?.hasNewTeamNews ?? false} rounded />
      </TabBarArea>
    </Stage>
  );
}


// 지도가 화면보다 길면 지도 영역만 끌어서 봄
const Stage = styled.main`
  position: relative;
  width: ${MAP_WIDTH}px;
  max-width: 100%;
  height: 100svh;
  margin: 0 auto;
  overflow: hidden;
`;

// 지도만 위아래로 끌어서 보는 영역 (상단 카드·하단 탭바는 고정)
const MapScroller = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// 화면이 지도보다 길면 지도를 아래에 붙이고 남는 공간은 위(하늘)로
const MapContent = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${MAP_WIDTH}px;
  margin-top: auto;
`;

const MapImage = styled.img`
  display: block;
  width: ${MAP_WIDTH}px;
  pointer-events: none;
  user-select: none;
`;

const Character = styled.img`
  position: absolute;
  display: block;
  pointer-events: none;
  user-select: none;
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
