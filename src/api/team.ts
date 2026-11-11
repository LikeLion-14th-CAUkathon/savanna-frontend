import { apiClient } from './client';
import type { ApiResponse, TeamRole } from './common';

// 팀 API는 성공 응답이 { status, message, data } 형태로 감싸져 온다.

// ===== Types =====

/** 내 팀 목록 아이템 */
export interface MyTeamResponse {
  teamId: number;
  name: string;
  projectName: string;
  role: TeamRole; // 내 역할
}

export interface TeamCreateRequest {
  name: string; // 최대 100자
  projectName: string; // 최대 150자
  projectIntro: string; // 1자 이상
  githubUrl?: string; // http(s) URL 또는 빈 문자열
  presentationUrl?: string; // http(s) URL 또는 빈 문자열
  stack?: string; // 최대 500자
}

/** 팀 생성 결과 */
export interface TeamCreateResponse {
  teamId: number;
  name: string;
  role: TeamRole; // 생성자는 LEADER
}

/** 팀 기본 정보 */
export interface TeamInfo {
  teamId: number;
  name: string;
  projectName: string;
  projectIntro: string;
  githubUrl: string | null;
  presentationUrl: string | null;
  stack: string | null;
}

export interface TeamMember {
  userId: number;
  name: string;
  role: TeamRole;
}

/** 팀 상세 (기본 정보 + 팀원 목록) */
export interface TeamDetailResponse extends TeamInfo {
  members: TeamMember[];
}

/** 팀 수정 요청 (포함된 필드만 수정) */
export type TeamUpdateRequest = Partial<TeamCreateRequest>;

/** 팀 수정 결과 */
export type TeamUpdateResponse = TeamInfo;

// ===== API =====

/**
 * 내 팀 목록 조회 — GET /api/v1/teams
 * - 팀 선택 후 해당 teamId로 팀 공간 이동
 * - 404: 사용자 정보 없음
 */
export const getMyTeams = async () => {
  const { data } = await apiClient.get<ApiResponse<MyTeamResponse[]>>('/api/v1/teams');
  return data.data;
};

/**
 * 팀 생성 — POST /api/v1/teams
 * - 400: 필수값 누락, 잘못된 URL / 403: 온보딩 미완료
 */
export const createTeam = async (body: TeamCreateRequest) => {
  const { data } = await apiClient.post<ApiResponse<TeamCreateResponse>>('/api/v1/teams', body);
  return data.data;
};

/**
 * 팀 상세 조회 — GET /api/v1/teams/{teamId}
 * - 403: 팀에 소속되지 않음 / 404: 존재하지 않는 팀
 */
export const getTeamDetail = async (teamId: number) => {
  const { data } = await apiClient.get<ApiResponse<TeamDetailResponse>>(
    `/api/v1/teams/${teamId}`,
  );
  return data.data;
};

/**
 * 팀 기본정보 수정 — PATCH /api/v1/teams/{teamId}
 * - 400: 필수 항목 공백 / 403: 팀에 소속되지 않음 / 404: 존재하지 않는 팀
 */
export const updateTeam = async (teamId: number, body: TeamUpdateRequest) => {
  const { data } = await apiClient.patch<ApiResponse<TeamUpdateResponse>>(
    `/api/v1/teams/${teamId}`,
    body,
  );
  return data.data;
};
