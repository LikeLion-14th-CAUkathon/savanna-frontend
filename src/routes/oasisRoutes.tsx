import type { RouteObject } from 'react-router';
import OasisPage from '../pages/oasis/OasisPage';
import ExpeditionDetailPage from '../pages/oasis/ExpeditionDetailPage';
import ScheduleEditPage from '../pages/oasis/ScheduleEditPage';

// D. 오아시스 영역 라우트 (D 담당만 수정). 주소는 oasisPaths.ts
export const oasisRoutes: RouteObject[] = [
  { path: '/oasis', element: <OasisPage /> },
  { path: '/oasis/expeditions/:expeditionId', element: <ExpeditionDetailPage /> },
  { path: '/oasis/expeditions/:expeditionId/schedule', element: <ScheduleEditPage /> },
];
