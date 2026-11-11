// D. 오아시스 영역 주소 (D 담당만 수정)
// 다른 화면에서 D 화면으로 이동할 때도 이 값을 가져다 쓰기
export const OASIS_PATHS = {
  home: '/oasis',                                                                    // D01 오아시스
  expeditionDetail: (expeditionId: number | string) => `/oasis/expeditions/${expeditionId}`,       // D02 원정 상세
  scheduleEdit: (expeditionId: number | string) => `/oasis/expeditions/${expeditionId}/schedule`, // D03 일정 & 준비사항 편집
};
