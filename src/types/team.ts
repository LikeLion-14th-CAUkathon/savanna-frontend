import type { TeamCreateRequest, TeamInfo } from '../api/team';

// B01 팀 생성 · B02 팀 정보 수정 → B02 팀 공간으로 이동할 때 함께 넘기는 값 (라우터 state)
// TODO: API 연결 후에는 teamId로 getTeamDetail을 다시 불러오고 이 state는 없앤다.
export interface TeamSpaceLocationState {
  createdTeam?: TeamCreateRequest; // 새로 만들었거나 수정한 팀 정보
  photo?: File | null; // 고른 팀 프로필 사진 (팀 API에 아직 사진 필드가 없음)
}

// B02 팀 공간 → B02 팀 정보 수정으로 이동할 때 넘기는 지금 팀 정보
export interface TeamEditLocationState {
  team: TeamInfo;
  photo?: File | null;
}
