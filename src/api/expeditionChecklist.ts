import { apiClient } from './client';

// 원정 제출 체크리스트 API

// ===== Types =====

export interface ExpeditionChecklistResponse {
  checklistId: number;
  expeditionId: number;
  title: string;
  isChecked: boolean;
  sortOrder: number;
}

export interface ExpeditionChecklistListResponse {
  items: ExpeditionChecklistResponse[]; // sortOrder순
  completedCount: number;
  totalCount: number;
  progress: string;
}

export interface ExpeditionChecklistCreateRequest {
  title: string; // 최대 1000자
  sortOrder?: number; // 생략 시 마지막에 추가
}

/** 체크/수정 (생략 또는 null 필드는 유지) */
export interface ExpeditionChecklistUpdateRequest {
  title?: string;
  isChecked?: boolean;
  sortOrder?: number;
}

// ===== API =====

/** 제출 체크리스트 조회 — GET /api/v1/expeditions/{expeditionId}/checklists */
export const getExpeditionChecklists = async (expeditionId: number) => {
  const { data } = await apiClient.get<ExpeditionChecklistListResponse>(
    `/api/v1/expeditions/${expeditionId}/checklists`,
  );
  return data;
};

/** 제출 체크리스트 항목 추가 — POST /api/v1/expeditions/{expeditionId}/checklists */
export const createExpeditionChecklist = async (
  expeditionId: number,
  body: ExpeditionChecklistCreateRequest,
) => {
  const { data } = await apiClient.post<ExpeditionChecklistResponse>(
    `/api/v1/expeditions/${expeditionId}/checklists`,
    body,
  );
  return data;
};

/** 제출 체크리스트 체크/수정 — PATCH /api/v1/expedition-checklists/{checklistId} */
export const updateExpeditionChecklist = async (
  checklistId: number,
  body: ExpeditionChecklistUpdateRequest,
) => {
  const { data } = await apiClient.patch<ExpeditionChecklistResponse>(
    `/api/v1/expedition-checklists/${checklistId}`,
    body,
  );
  return data;
};

/** 제출 체크리스트 항목 삭제 — DELETE /api/v1/expedition-checklists/{checklistId} */
export const deleteExpeditionChecklist = async (checklistId: number) => {
  await apiClient.delete(`/api/v1/expedition-checklists/${checklistId}`);
};
