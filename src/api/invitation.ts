import { apiClient } from './client';
import type { ApiResponse, TeamRole } from './common';



// ===== Types =====

/**
 * 초대 상태
 * - EXPIRED는 과거 7일형 링크에서만 생긴다. 지금 영구 링크는 expiresAt: null이고 저절로 만료되지 않는다.
 */
export type InvitationStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

/** 초대 목록 아이템 */
export interface InvitationResponse {
  invitationId: number;
  teamId: number;
  token: string;
  inviteUrl: string; // 그대로 복사 · 공유하는 초대 주소
  createdAt: string; // date-time
  expiresAt: string | null; // date-time. 영구 링크면 null
  revokedAt: string | null; // date-time
  status: InvitationStatus;
}

/** 초대 링크 생성 결과 */
export interface InvitationCreateResponse {
  invitationId: number;
  teamId: number;
  token: string;
  inviteUrl: string; // 그대로 복사 · 공유하는 초대 주소
  expiresAt: string | null; // date-time. 영구 링크면 null
  status: InvitationStatus;
}

/** 팀의 현재 초대 링크 */
export interface InvitationCurrentResponse {
  inviteUrl: string; // 그대로 복사 · 공유하는 초대 주소
}

/** 초대 미리보기 */
export interface InvitationPreviewResponse {
  teamId: number;
  teamName: string;
  projectName: string;
  projectIntro: string;
  currentMemberCount: number; // 현재 팀원 수
  expectedMemberCount: number; // 합류 후 팀원 수 (current + 1)
  expiresAt: string | null; // date-time. 영구 링크면 null
}

/** 팀 합류 결과 */
export interface InvitationAcceptResponse {
  teamId: number;
  teamName: string;
  role: TeamRole; // MEMBER
}

// ===== API =====

/**
 * 팀의 현재 초대 링크 조회 — GET /api/v1/teams/{teamId}/invitations/current
 * - 팀원 누구나 같은 링크를 받는다. data.inviteUrl을 그대로 복사 · 공유한다
 * - 404: 현재 링크 없음 (팀장이 createInvitation으로 만들어야 함)
 */
export const getCurrentInvitation = async (teamId: number) => {
  const { data } = await apiClient.get<ApiResponse<InvitationCurrentResponse>>(
    `/api/v1/teams/${teamId}/invitations/current`,
  );
  return data.data;
};

/**
 * 팀 초대 목록 조회 — GET /api/v1/teams/{teamId}/invitations
 * - 팀장 전용
 * - 403: 팀장 아님 · 팀에 소속되지 않음 / 404: 존재하지 않는 팀
 */
export const getInvitations = async (teamId: number) => {
  const { data } = await apiClient.get<ApiResponse<InvitationResponse[]>>(
    `/api/v1/teams/${teamId}/invitations`,
  );
  return data.data;
};

/**
 * 팀 초대 링크 생성 — POST /api/v1/teams/{teamId}/invitations
 * - 팀장만 가능. 이미 영구 링크가 있으면 같은 토큰을 다시 준다
 * - 403: 팀장 아님 / 404: 존재하지 않는 팀
 */
export const createInvitation = async (teamId: number) => {
  const { data } = await apiClient.post<ApiResponse<InvitationCreateResponse>>(
    `/api/v1/teams/${teamId}/invitations`,
  );
  return data.data;
};

/**
 * 팀 초대 폐기 — DELETE /api/v1/teams/{teamId}/invitations/{invitationId}
 * - revokedAt 기록 (실제 삭제 아님). 응답에 data 없음
 * - 404: 팀 또는 초대 없음 / 409: 이미 회수된 링크
 */
export const revokeInvitation = async (teamId: number, invitationId: number) => {
  await apiClient.delete(`/api/v1/teams/${teamId}/invitations/${invitationId}`);
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
