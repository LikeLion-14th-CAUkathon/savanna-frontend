// 팀 화면끼리 이동할 때 함께 넘기는 값 (라우터 state)
// 팀 정보는 각 화면이 주소의 teamId로 서버에서 불러오고, 팀 API에 필드가 없는 프로필 사진만 넘긴다.

// B01 팀 생성 · B02 팀 정보 수정 → B02 팀 공간
export interface TeamSpaceLocationState {
  photo?: File | null; // 고른 팀 프로필 사진
}

// B02 팀 공간 → B02 팀 정보 수정
export interface TeamEditLocationState {
  photo?: File | null;
}
