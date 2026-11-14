import { apiClient } from './client';
import type {
  AnnouncementField,
  AnnouncementStatus,
  ApplicationMethod,
  EligibilityStatus,
  Page,
  PageParams,
  RecommendationSource,
} from './common';

// ===== Types =====

/** 공고 목록 아이템 */
export interface AnnouncementResponse {
  announcementId: number;
  title: string;
  host: string;
  field: AnnouncementField;
  applicationStartsAt: string; // date-time
  deadline: string; // date
}

/** 공고 상세 */
export interface AnnouncementDetailResponse {
  announcementId: number;
  title: string;
  host: string;
  field: AnnouncementField;
  applicationStartsAt: string; // date-time
  deadline: string; // date
  receptionStatus: AnnouncementStatus;
  enrollmentRequirement: string;
  minMembers: number;
  maxMembers: number;
  region: string;
  theme: string;
  evaluationCriteria: string;
  applicationMethod: ApplicationMethod;
  submissionRequirements: string;
  sourceUrl: string;
  applyUrl: string;
  participationRegion: string;
  posterUrl: string;
  applicationPeriodRaw: string;
  applicationInstructions: string;
  formNote: string;
  lengthNote: string;
  teamType: string;
  csvRequiredRegionRaw: string;
  venueNote: string;
  detailStatus: string;
  dateSource: string;
}

export interface AnnouncementListParams extends PageParams {
  keyword?: string;
  field?: AnnouncementField;
  status?: AnnouncementStatus;
}

/** 공고 생성 요청 (테스트용) */
export interface AnnouncementCreateRequest {
  title: string;
  deadline: string; // date
  field: AnnouncementField;
  host: string;
  applicationStartsAt?: string; // date-time
  minMembers?: number;
  maxMembers?: number;
  evaluationCriteria?: string;
  enrollmentRequirement?: string;
  region?: string;
  theme?: string;
  applicationMethod?: ApplicationMethod;
  submissionRequirements?: string;
  sourceUrl?: string;
  applyUrl?: string;
  applicationPeriodValid?: boolean;
  memberRangeValid?: boolean;
}

/** 참가 조건 항목 */
export interface EligibilityCondition {
  code: string;
  status: EligibilityStatus;
  message: string;
}

/** 공고 참가 조건 확인 결과 */
export interface AnnouncementEligibilityResponse {
  announcementId: number;
  teamId: number;
  status: EligibilityStatus;
  conditions: EligibilityCondition[];
}

/** 팀 AI 추천 공고 */
export interface AnnouncementRecommendationResponse {
  announcementId: number;
  title: string;
  host: string;
  field: AnnouncementField;
  deadline: string; // date
  status: AnnouncementStatus;
  score: number;
  reason: string; // 추천 이유
  eligibility: AnnouncementEligibilityResponse;
  generatedAt: string; // date-time
  source: RecommendationSource;
  stale: boolean;
}

// ===== API =====

/** 공고 목록 조회 — GET /api/v1/announcements */
export const getAnnouncements = async (params?: AnnouncementListParams) => {
  const { data } = await apiClient.get<Page<AnnouncementResponse>>('/api/v1/announcements', {
    params,
  });
  return data;
};

/** 공고 상세 조회 — GET /api/v1/announcements/{announcementId} */
export const getAnnouncement = async (announcementId: number) => {
  const { data } = await apiClient.get<AnnouncementDetailResponse>(
    `/api/v1/announcements/${announcementId}`,
  );
  return data;
};

/**
 * 공고 참가 조건 확인 — GET /api/v1/announcements/{announcementId}/eligibility
 * - 팀 연동 전이거나 정보가 불충분하면 status = TEAM_INFO_REQUIRED
 */
export const checkEligibility = async (announcementId: number, teamId?: number) => {
  const { data } = await apiClient.get<AnnouncementEligibilityResponse>(
    `/api/v1/announcements/${announcementId}/eligibility`,
    { params: { teamId } },
  );
  return data;
};

/** 공고 생성 (테스트 목적) — POST /api/v1/announcements */
export const createAnnouncement = async (body: AnnouncementCreateRequest) => {
  const { data } = await apiClient.post<AnnouncementResponse>('/api/v1/announcements', body);
  return data;
};

/**
 * 우리 팀 AI 추천 목록 조회 — GET /api/v1/teams/{teamId}/recommendations
 * - 저장된 추천을 점수순으로 반환 (AI 호출 없음)
 */
export const getRecommendations = async (teamId: number) => {
  const { data } = await apiClient.get<AnnouncementRecommendationResponse[]>(
    `/api/v1/teams/${teamId}/recommendations`,
  );
  return data;
};

/**
 * 우리 팀 AI 추천 재생성 — POST /api/v1/teams/{teamId}/recommendations/refresh
 * - 실제 AI 미연결 시 503
 */
export const refreshRecommendations = async (teamId: number) => {
  const { data } = await apiClient.post<AnnouncementRecommendationResponse[]>(
    `/api/v1/teams/${teamId}/recommendations/refresh`,
  );
  return data;
};
