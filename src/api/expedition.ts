import { apiClient } from './client';
import type { AnnouncementResponse } from './announcement';
import type { ExpeditionStage, Page, PageParams } from './common';
import type { ProposalRecipient } from './proposal';

// ===== Types =====

/** 원정 준비 정보 */
export interface ExpeditionResponse {
  expeditionId: number;
  teamId: number;
  announcement: AnnouncementResponse;
  stage: ExpeditionStage;
  kickoffDate: string | null; // date
  draftDate: string | null; // date
  reviewDate: string | null; // date
  submitTargetDate: string | null; // date
  submissionCompleted: boolean;
  submissionCompletedAt: string | null; // date-time
}

/** 오아시스 원정 목록 아이템 */
export interface TeamExpeditionResponse {
  expeditionId: number;
  announcementId: number;
  title: string;
  deadline: string; // date
  stage: ExpeditionStage;
  joinedCount: number; // JOINED 응답 사용자 수
}

export interface ExpeditionStageRequest {
  stage: ExpeditionStage;
}

/** 준비 일정 수정 (생략 또는 null 필드는 기존 값 유지) */
export interface ExpeditionScheduleRequest {
  kickoffDate?: string | null; // date
  draftDate?: string | null; // date
  reviewDate?: string | null; // date
  submitTargetDate?: string | null; // date
}

/** 단계 변경 이력 */
export interface ExpeditionStageHistoryResponse {
  stageHistoryId: number;
  fromStage: ExpeditionStage;
  toStage: ExpeditionStage;
  changedBy: number; // userId
  changedAt: string; // date-time
}

/** 원정의 제안과 응답 현황 */
export interface ExpeditionProposalResponse {
  proposalId: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string; // date-time
  totalCount: number;
  joinedCount: number;
  declinedCount: number;
  pendingCount: number;
  recipients: ProposalRecipient[];
}

// ===== API =====

/**
 * 오아시스 원정 목록 조회 — GET /api/v1/teams/{teamId}/expeditions
 * - 공고 마감순, 마감·제출 완료 원정 포함
 */
export const getTeamExpeditions = async (teamId: number) => {
  const { data } = await apiClient.get<TeamExpeditionResponse[]>(
    `/api/v1/teams/${teamId}/expeditions`,
  );
  return data;
};

/** 원정 준비 정보 조회 — GET /api/v1/expeditions/{expeditionId} */
export const getExpedition = async (expeditionId: number) => {
  const { data } = await apiClient.get<ExpeditionResponse>(`/api/v1/expeditions/${expeditionId}`);
  return data;
};

/** 진행 단계 변경 — PATCH /api/v1/expeditions/{expeditionId}/stage */
export const changeExpeditionStage = async (expeditionId: number, body: ExpeditionStageRequest) => {
  const { data } = await apiClient.patch<ExpeditionResponse>(
    `/api/v1/expeditions/${expeditionId}/stage`,
    body,
  );
  return data;
};

/** 준비 일정 수정 — PATCH /api/v1/expeditions/{expeditionId}/schedule */
export const updateExpeditionSchedule = async (
  expeditionId: number,
  body: ExpeditionScheduleRequest,
) => {
  const { data } = await apiClient.patch<ExpeditionResponse>(
    `/api/v1/expeditions/${expeditionId}/schedule`,
    body,
  );
  return data;
};

/** 단계 변경 이력 조회 — GET /api/v1/expeditions/{expeditionId}/stage-histories */
export const getExpeditionStageHistories = async (expeditionId: number, params?: PageParams) => {
  const { data } = await apiClient.get<Page<ExpeditionStageHistoryResponse>>(
    `/api/v1/expeditions/${expeditionId}/stage-histories`,
    { params },
  );
  return data;
};

/** 원정의 제안과 응답 현황 조회 — GET /api/v1/expeditions/{expeditionId}/proposals */
export const getExpeditionProposals = async (expeditionId: number) => {
  const { data } = await apiClient.get<ExpeditionProposalResponse[]>(
    `/api/v1/expeditions/${expeditionId}/proposals`,
  );
  return data;
};
