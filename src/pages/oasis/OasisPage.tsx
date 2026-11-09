import { useLayoutEffect, useRef } from 'react';
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
import mapImage from '../../assets/images/oasis/oasis-long-map.png';
import lionImage from '../../assets/images/oasis/lion.png';
import elephantImage from '../../assets/images/oasis/elephant.png';
import meerkatImage from '../../assets/images/oasis/meerkat.png';

const MESSAGES = {
  empty: '아직 시작한 원정이 없어요.',
  error: '원정을 불러오지 못했어요. 다시 시도해 주세요.',
  loading: '원정 지도를 불러오는 중이에요.',
};

const MAP_WIDTH = 402;
const MAP_HEIGHT = 1206;
const TAB_BAR_HEIGHT = 75;

const POND_SLOTS = [
  { left: 44, top: 787 },
  { left: 128, top: 655 },
  { left: -36, top: 523 },
  { left: 64, top: 359 },
  { left: 120, top: 231 },
  { left: 152, top: 75 },
];

// 지도에 그려진 큰 표지판·오아시스 기준 위치
const HOME = {
  board: { left: 25, top: 998, width: 193, height: 64 },
  ideaBadge: { left: 12, top: 986 },
  lion: { left: 210, top: 1087, width: 73.185, height: 73.185 },
  elephant: { left: 21, top: 1120, width: 73.185, height: 61.846 },
  meerkat: { left: 173, top: 1130, width: 41.231, height: 51.538 },
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

// TODO: API 연결 시 실제 요청 결과로 교체. 지금은 화면 확인용으로 status를 바꿔가며 볼 수 있음
//  - { status: 'loading' } / { status: 'error' } / { status: 'success', data: { ..., expeditions: [] } }
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const PREVIEW_STATE: OasisState = {
  status: 'success',
  data: {
    teamId: 1,
    teamName: '사바나 탐험대',
    memberCount: 3,
    ideaCount: 4,
    hasNewTeamNews: true,
    expeditions: [
      { id: 1, contestTitle: '헬스케어 AI 아이디어 공모전', deadline: daysFromNow(14), stage: 'DRAFT', participantCount: 2 },
      { id: 2, contestTitle: '청년 사회문제 해결 해커톤', deadline: daysFromNow(5), stage: 'KICKOFF', participantCount: 1 },
      { id: 3, contestTitle: '서울 청년 현장 아이디어톤', deadline: daysFromNow(10), stage: 'KICKOFF', participantCount: 1 },
    ],
  },
};

// TODO: 라우터 구성 후 각 화면으로 이동 연결
//  - 원정 표지판 → D02 원정 상세 / 우리 팀 프로젝트 → B02 팀 공간 / 공고 찾기 → C01 공고 찾기 / 하단 탭 → 각 탭 화면
const goToExpeditionDetail = (_expeditionId: number) => {};
const goToTeamSpace = () => {};
const goToContestSearch = () => {};
const handleTabChange = (_tab: TabId) => {};

export default function OasisPage() {
  const state = PREVIEW_STATE;
  const retry = () => {}; // TODO: API 연결 시 다시 요청

  const mapRef = useRef<HTMLDivElement>(null);

  const data = state.status === 'success' ? state.data : null;
  const expeditions = data ? sortByDeadline(data.expeditions) : [];
  const visibleExpeditions = expeditions.slice(0, POND_SLOTS.length);
  const hasExpedition = expeditions.length > 0;

  const nextOpen = expeditions.find((expedition) => !isPastDeadline(expedition.deadline));
  const nextDeadline = data ? (nextOpen ? formatDDay(nextOpen.deadline) : '-') : undefined;

  // 처음엔 지도 맨 아래(우리 팀 오아시스)가 보이게
  useLayoutEffect(() => {
    const map = mapRef.current;
    if (map) map.scrollTop = map.scrollHeight;
  }, [state.status]);

  return (
    <Stage aria-busy={state.status === 'loading'}>
      <MapScroller ref={mapRef}>
        <MapContent>
          <MapImage src={mapImage} alt="" />

          <Character style={{ ...HOME.elephant, transform: 'scaleX(-1)' }} aria-hidden="true">
            <CharacterImage
              src={elephantImage}
              alt=""
              style={{ left: '-11.04%', top: '-24.56%', width: '123.67%', height: '146.58%' }}
            />
          </Character>
          <Character style={HOME.meerkat} aria-hidden="true">
            <CharacterImage
              src={meerkatImage}
              alt=""
              style={{ left: '-31.37%', top: '-16.99%', width: '169.64%', height: '134.38%' }}
            />
          </Character>
          <Character style={HOME.lion} aria-hidden="true">
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
                left={POND_SLOTS[index].left}
                top={POND_SLOTS[index].top}
                title={expedition.contestTitle}
                dDayLabel={formatDDay(expedition.deadline)}
                progressLabel={formatProgress(expedition)}
                onClick={() => goToExpeditionDetail(expedition.id)}
              />
            ))
            .reverse()}

          <HomeSign ideaCount={data?.ideaCount} board={HOME.board} badge={HOME.ideaBadge} onClick={goToTeamSpace} />
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
        <TabBar activeTab="oasis" onTabChange={handleTabChange} hasNew={data?.hasNewTeamNews ?? false} />
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
  background: #fcd358;
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
  height: ${MAP_HEIGHT}px;
  margin-bottom: ${TAB_BAR_HEIGHT}px; /* 탭바에 오아시스가 가리지 않게 */
`;

const MapImage = styled.img`
  display: block;
  width: ${MAP_WIDTH}px;
  height: ${MAP_HEIGHT}px;
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
  top: 38px;
  left: 24px;
`;

const TeamSwitchArea = styled.div`
  position: absolute;
  top: 124px;
  left: 230px;
  max-width: 156px;
`;

const PopupArea = styled.div`
  position: absolute;
  top: 180px;
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
