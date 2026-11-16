// B01 팀 생성 · B02 팀 정보 수정 → B02 팀 공간으로 이동할 때 넘기는 값 (라우터 state)
// 팀 정보 · 사진은 B02가 teamId로 서버에서 다시 불러온다.
export interface TeamSpaceLocationState {
  // 팀 생성 · 정보 저장은 됐지만 사진 업로드만 실패했을 때 B02에서 띄울 안내
  photoError?: string;
  // 팀 생성 직후 생성 응답의 초대 주소. 있으면 B02가 초대 링크를 따로 불러오지 않는다
  inviteUrl?: string;
}
