import type { TeamCreateRequest } from '../api/team';

// B01 팀 생성 → B02 팀 공간으로 이동할 때 함께 넘기는 값 (라우터 state)
// TODO: API 연결 후에는 createTeam 응답의 teamId로 getTeamDetail을 불러오고 이 state는 없앤다.
export interface TeamSpaceLocationState {
  createdTeam?: TeamCreateRequest;
  photo?: File | null; // B01에서 고른 팀 프로필 사진 (팀 생성 API에 아직 사진 필드가 없음)
}
