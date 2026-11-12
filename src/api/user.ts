import type { RegionCode } from '../utils/region';
import { apiClient } from './client';
import type { ApiResponse, EnrollmentStatus } from './common';

// 사용자 API는 성공 응답이 { status, message, data } 형태로 감싸져 온다.
// 지역은 API 코드('SEOUL')로 주고받는다. 화면 표시용 변환은 utils/region.ts 사용

// ===== Types =====

/** 내 정보 */
export interface MyInfoResponse {
  userId: number;
  email: string;
  name: string;
  universityName: string;
  enrollmentStatus: EnrollmentStatus;
  regions: RegionCode[];
  onboardingCompleted: boolean;
}

export interface UserUpdateRequest {
  name: string; // 공백 불가
  universityName?: string;
  enrollmentStatus?: EnrollmentStatus;
  regions?: RegionCode[]; // 전달 시 기존 목록 전체 교체
}

/** 내 정보 수정 결과 */
export interface UserUpdateResponse {
  userId: number;
  name: string;
  enrollmentStatus: EnrollmentStatus;
  regions: RegionCode[];
  onboardingCompleted: boolean;
}

// ===== API =====

/**
 * 내 정보 조회 — GET /api/v1/me
 * - 401: 유효하지 않거나 만료된 토큰 / 404: 사용자 정보 없음
 */
export const getMyInfo = async () => {
  const { data } = await apiClient.get<ApiResponse<MyInfoResponse>>('/api/v1/me');
  return data.data;
};

/**
 * 내 정보 수정 — PATCH /api/v1/me
 * - 최초 필수 정보 입력 완료 시 onboardingCompleted=true
 * - 400: 이름 공백, 유효하지 않은 학적 상태·지역 코드
 */
export const updateMyInfo = async (body: UserUpdateRequest) => {
  const { data } = await apiClient.patch<ApiResponse<UserUpdateResponse>>('/api/v1/me', body);
  return data.data;
};
