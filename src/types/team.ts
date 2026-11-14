// B01 팀 생성 · B02 팀 정보 수정 → B02 팀 공간으로 이동할 때 넘기는 값 (라우터 state)
// 팀 정보 · 사진은 B02가 teamId로 서버에서 다시 불러온다.
export interface TeamSpaceLocationState {
  // 팀 생성 · 정보 저장은 됐지만 사진 업로드만 실패했을 때 B02에서 띄울 안내
  photoError?: string;
}
