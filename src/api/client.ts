import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, ApiResponse, TokenData } from './common';

// 서버 주소는 .env.local 의 VITE_API_BASE_URL 로 덮어쓸 수 있다.
export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'https://savannaexpedition.duckdns.org';

// ===== Access Token 관리 =====
// Access Token은 메모리에만 보관한다.
// Refresh Token은 서버가 쿠키(refreshToken)로 관리하므로 프론트에서 직접 다루지 않는다.
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// ===== Axios 인스턴스 =====
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // refreshToken 쿠키 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ===== 401 시 토큰 재발급 후 재요청 =====
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행한다.
let refreshPromise: Promise<string> | null = null;

/** refreshToken 쿠키로 Access Token을 재발급하고 메모리에 저장한다. */
export const refreshAccessToken = async (): Promise<TokenData> => {
  // 인터셉터 무한 루프를 막기 위해 apiClient가 아닌 axios로 직접 호출한다.
  const { data } = await axios.post<ApiResponse<TokenData>>(
    `${BASE_URL}/api/v1/auth/refresh`,
    null,
    { withCredentials: true },
  );
  setAccessToken(data.data.accessToken);
  return data.data;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    if (error.response?.status !== 401 || !originalConfig || originalConfig._retry) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      refreshPromise ??= refreshAccessToken()
        .then((token) => token.accessToken)
        .finally(() => {
          refreshPromise = null;
        });
      const newToken = await refreshPromise;
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalConfig);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

/** 에러 객체에서 서버 메시지를 꺼낸다. 없으면 fallback 반환. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = '요청 처리 중 오류가 발생했습니다.',
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};
