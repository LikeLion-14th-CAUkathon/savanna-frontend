import type { RouteObject } from 'react-router';
import OasisPage from '../pages/oasis/OasisPage';
import ExpeditionDetailPage from '../pages/oasis/ExpeditionDetailPage';

// D. 오아시스 영역 주소 (D 담당만 수정)
// 다른 화면에서 D 화면으로 이동할 때도 이 값을 가져다 쓰기
export const OASIS_PATHS = {
  home: '/oasis',                                                              // D01 오아시스
  expeditionDetail: (expeditionId: number) => `/oasis/expeditions/${expeditionId}`,      // D02 원정 상세
  scheduleEdit: (expeditionId: number) => `/oasis/expeditions/${expeditionId}/edit`,     // D03 일정·공지 수정 (화면 만들면 아래에 추가)
};

export const oasisRoutes: RouteObject[] = [
  { path: '/oasis', element: <OasisPage /> },
  { path: '/oasis/expeditions/:expeditionId', element: <ExpeditionDetailPage /> },
];
