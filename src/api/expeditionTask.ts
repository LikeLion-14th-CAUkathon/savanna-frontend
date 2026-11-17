import { apiClient } from './client';

// 원정 공지(Task) API

// ===== Types =====

export interface ExpeditionTaskResponse {
  taskId: number;
  expeditionId: number;
  title: string;
  dueDate: string; // date
  dueTime: string | null; // 'HH:mm:ss', 시간 미정이면 null
  isDone: boolean;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

export interface ExpeditionTaskCreateRequest {
  title: string; // 최대 1000자
  dueDate: string; // date
  dueTime?: string; // 'HH:mm:ss' (선택)
}

/** 공지 수정 (생략 값은 유지, dueTime: null → 시간 삭제, isDone: false → 완료 취소) */
export interface ExpeditionTaskUpdateRequest {
  title?: string;
  dueDate?: string; // date
  dueTime?: string | null;
  isDone?: boolean;
}

// ===== API =====

/**
 * 공지 목록 조회 — GET /api/v1/expeditions/{expeditionId}/tasks
 * - 날짜·시간순, 같은 날짜의 시간 미정 공지는 마지막
 */
export const getExpeditionTasks = async (expeditionId: number) => {
  const { data } = await apiClient.get<ExpeditionTaskResponse[]>(
    `/api/v1/expeditions/${expeditionId}/tasks`,
  );
  return data;
};

/** 공지 추가 — POST /api/v1/expeditions/{expeditionId}/tasks */
export const createExpeditionTask = async (
  expeditionId: number,
  body: ExpeditionTaskCreateRequest,
) => {
  const { data } = await apiClient.post<ExpeditionTaskResponse>(
    `/api/v1/expeditions/${expeditionId}/tasks`,
    body,
  );
  return data;
};

/** 공지 수정 — PATCH /api/v1/expedition-tasks/{taskId} */
export const updateExpeditionTask = async (taskId: number, body: ExpeditionTaskUpdateRequest) => {
  const { data } = await apiClient.patch<ExpeditionTaskResponse>(
    `/api/v1/expedition-tasks/${taskId}`,
    body,
  );
  return data;
};

/** 공지 삭제 — DELETE /api/v1/expedition-tasks/{taskId} */
export const deleteExpeditionTask = async (taskId: number) => {
  await apiClient.delete(`/api/v1/expedition-tasks/${taskId}`);
};
