import { apiClient, BASE_URL, refreshAccessToken, setAccessToken } from './client';

// ===== Google 로그인 =====

/**
 * Google 로그인 시작 URL — GET /oauth2/authorization/google
 * - API 호출이 아니라 페이지 이동으로 사용: window.location.href = GOOGLE_LOGIN_URL
 * - 로그인 성공 후 토큰·온보딩 완료 여부를 프론트로 전달하는 방식은 백엔드 확인 필요
 *   (온보딩 미완료 → A02, 완료 → 팀 선택 또는 오아시스)
 */
export const GOOGLE_LOGIN_URL = `${BASE_URL}/oauth2/authorization/google`;

// ===== API =====

/**
 * Access Token 재발급
 * POST /api/v1/auth/refresh
 * - refreshToken 쿠키 사용. 성공 시 메모리의 Access Token도 갱신한다.
 * - 401 발생 시 client.ts 인터셉터에서 자동 호출되므로 보통 직접 호출할 필요는 없다.
 *   (앱 첫 진입 시 로그인 상태 복원 용도로 사용)
 */
export const refreshToken = () => refreshAccessToken();

/**
 * 로그아웃
 * POST /api/v1/auth/logout
 * - Refresh Token 무효화 및 인증 쿠키 정리. 응답 본문은 쓸 일이 없음
 */
export const logout = async () => {
  try {
    const { data } = await apiClient.post<unknown>('/api/v1/auth/logout');
    return data;
  } finally {
    setAccessToken(null);
  }
};
