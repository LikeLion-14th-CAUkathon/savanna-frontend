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
  photoUrl: string | null; // 팀 프로필 사진 (600초 임시 URL). 미설정은 null
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
  photoUrl: string | null; // 생성 직후엔 null. 사진은 생성 후 uploadTeamPhoto로 올린다
  inviteUrl: string; // 팀을 만들 때 자동으로 생기는 초대 주소. 초대 생성 API를 따로 부를 필요 없음
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
  photoUrl: string | null; // 팀 프로필 사진 (600초 임시 URL). 미설정은 null
}

export interface TeamMember {
  userId: number;
  name: string;
  role: TeamRole;
  characterId: number | null; // 선택 캐릭터 번호(1~9). 미설정은 null
}

/** 팀 상세 (기본 정보 + 팀원 목록) */
export interface TeamDetailResponse extends TeamInfo {
  members: TeamMember[];
}

/**
 * 팀 수정 요청 (포함된 필드만 수정)
 * - photoUrl: 빈 문자열이면 사진 삭제, 생략이면 유지. URL 직접 입력은 불가(업로드는 uploadTeamPhoto)
 */
export type TeamUpdateRequest = Partial<TeamCreateRequest> & { photoUrl?: '' };

/** 팀 수정 결과 (팀 상세와 같은 모양) */
export type TeamUpdateResponse = TeamDetailResponse;

/** 팀 사진 업로드 결과 */
export interface TeamPhotoResponse {
  photoUrl: string; // 임시 조회 URL
  expiresInSeconds: number; // 600
}

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

/**
 * 팀 사진 업로드 · 교체 — POST /api/v1/teams/{teamId}/photo (multipart, 필드명 file)
 * - 팀장만 가능. JPEG · PNG, 5 MiB 이하
 * - 400: 누락 · 손상 이미지, 해상도 초과 / 403: 팀장 아님 / 404: 팀 없음
 * - 413: 5 MiB 초과 / 415: JPEG · PNG 아님 / 503: 저장소 오류
 */
export const uploadTeamPhoto = async (teamId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  // 기본 Content-Type(application/json)을 덮어써야 axios가 boundary를 붙여 multipart로 보낸다.
  const { data } = await apiClient.post<ApiResponse<TeamPhotoResponse>>(
    `/api/v1/teams/${teamId}/photo`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
};
