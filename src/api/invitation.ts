import { apiClient } from './client';
import type { ApiResponse, TeamRole } from './common';

// 초대 API는 성공 응답이 { status, message, data } 형태로 감싸져 온다.

// ===== Types =====

/**
 * 초대 상태
 * - 명세 예시에는 ACTIVE, REVOKED만 있음
 * - EXPIRED는 "만료 시각 기준으로 상태 계산" 로직으로 추정. 백엔드 확인 필요
 */
export type InvitationStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

/** 초대 목록 아이템 */
export interface InvitationResponse {
  invitationId: number;
  createdBy: number; // userId
  createdAt: string; // date-time
  expiresAt: string; // date-time
  revokedAt: string | null; // date-time
  status: InvitationStatus;
}

/**
 * 초대 링크 생성 결과
 * - inviteUrl은 생성 시점에만 받을 수 있으므로 필요하면 보관할 것 (7일 유효)
 */
export interface InvitationCreateResponse {
  invitationId: number;
  inviteUrl: string;
  createdAt: string; // date-time
  expiresAt: string; // date-time
}

/** 초대 폐기 결과 */
export interface InvitationRevokeResponse {
  invitationId: number;
  revokedAt: string; // date-time
}

/** 초대 미리보기 */
export interface InvitationPreviewResponse {
  teamId: number;
  teamName: string;
  projectName: string;
  projectIntro: string;
  memberCount: number;
  expiresAt: string; // date-time
}

/** 팀 합류 결과 */
export interface InvitationAcceptResponse {
  teamId: number;
  teamName: string;
  role: TeamRole; // MEMBER
  joinedAt: string; // date-time
}

// ===== API =====

/**
 * 팀 초대 목록 조회 — GET /api/v1/teams/{teamId}/invitations
 * - 403: 팀에 소속되지 않음 / 404: 존재하지 않는 팀
 */
export const getInvitations = async (teamId: number) => {
  const { data } = await apiClient.get<ApiResponse<InvitationResponse[]>>(
    `/api/v1/teams/${teamId}/invitations`,
  );
  return data.data;
};

/**
 * 팀 초대 링크 생성 — POST /api/v1/teams/{teamId}/invitations
 * - 403: 팀에 소속되지 않음 / 404: 존재하지 않는 팀
 */
export const createInvitation = async (teamId: number) => {
  const { data } = await apiClient.post<ApiResponse<InvitationCreateResponse>>(
    `/api/v1/teams/${teamId}/invitations`,
  );
  return data.data;
};

/**
 * 팀 초대 폐기 — DELETE /api/v1/teams/{teamId}/invitations/{invitationId}
 * - revokedAt 기록 (실제 삭제 아님)
 * - 404: 팀 또는 초대 없음 / 409: 이미 회수된 링크
 */
export const revokeInvitation = async (teamId: number, invitationId: number) => {
  const { data } = await apiClient.delete<ApiResponse<InvitationRevokeResponse>>(
    `/api/v1/teams/${teamId}/invitations/${invitationId}`,
  );
  return data.data;
};

/**
 * 초대 미리보기 — GET /api/v1/invitations/{token}
 * - 로그인 전에도 조회 가능
 * - 404: 존재하지 않는 링크 / 410: 만료 또는 회수된 링크
 */
export const previewInvitation = async (token: string) => {
  const { data } = await apiClient.get<ApiResponse<InvitationPreviewResponse>>(
    `/api/v1/invitations/${encodeURIComponent(token)}`,
  );
  return data.data;
};

/**
 * 팀 합류 — POST /api/v1/invitations/{token}/accept
 * - 403: 온보딩 미완료 / 404: 존재하지 않는 링크
 * - 409: 이미 소속된 팀 / 410: 만료 또는 회수된 링크
 */
export const acceptInvitation = async (token: string) => {
  const { data } = await apiClient.post<ApiResponse<InvitationAcceptResponse>>(
    `/api/v1/invitations/${encodeURIComponent(token)}/accept`,
  );
  return data.data;
};
