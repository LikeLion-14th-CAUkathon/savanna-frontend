// API 공통 타입
// 출처: Swagger (http://52.78.153.97:8080/swagger-ui/index.html)
// - date      → 'YYYY-MM-DD' 문자열
// - time      → 'HH:mm:ss' 문자열
// - date-time → ISO 8601 문자열
// - int64     → number

// ===== Enum =====

/** 공고 분야 */
export type AnnouncementField =
  | 'IDEA_PLANNING' // 아이디어·기획
  | 'DEVELOPMENT_HACKATHON' // 개발·해커톤
  | 'DESIGN' // 디자인
  | 'SOCIAL_ESG'; // 사회·ESG

/** 공고 접수 상태 */
export type AnnouncementStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';

/** 공고 지원 방식 */
export type ApplicationMethod = 'WEB' | 'EMAIL' | 'OTHER';

/** 참가 조건 판정 결과 */
export type EligibilityStatus = 'SATISFIED' | 'MISMATCH' | 'TEAM_INFO_REQUIRED';

/** 원정 진행 단계 */
export type ExpeditionStage = 'KICKOFF' | 'DRAFT' | 'REVIEW' | 'SUBMITTED';

/** 참여 제안 응답 상태 (합류 / 쉬어가기 / 미응답) */
export type ProposalStatus = 'PENDING' | 'JOINED' | 'DECLINED';

/** 재학 상태 */
export type EnrollmentStatus = 'ENROLLED' | 'ON_LEAVE' | 'GRADUATED';

/** 팀 내 역할 */
export type TeamRole = 'LEADER' | 'MEMBER';

/** 추천 생성 출처 */
export type RecommendationSource = 'AI' | 'MOCK';

// ===== 공통 응답 =====

/** 서버 공통 래퍼 응답 (에러 응답 및 일부 API에서 사용) */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * 에러 응답 — 서버에 두 가지 형식이 섞여 있다. 둘 다 message는 있다.
 * - 인증 오류 등: { status: 401, message: '인증이 필요합니다.', data: null }
 * - 요청 검증 오류 등: { code: 'INVALID_REQUEST', message: '잘못된 요청입니다.', errors: [] }
 */
export type ApiErrorResponse =
  | ApiResponse<null>
  | { code: string; message: string; errors: unknown[] };

/** 토큰 재발급 응답 data */
export interface TokenData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/** Spring Page 응답 */
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 (0부터 시작)
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  sort: SortObject;
  pageable: PageableObject;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  offset: number;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  sort: SortObject;
  unpaged: boolean;
}

/** 페이지네이션 요청 파라미터 (기본값: page=0, size=10) */
export interface PageParams {
  page?: number;
  size?: number;
}
