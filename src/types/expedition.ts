import type { ExpeditionStage } from './oasis';

// D02 원정 상세 화면 데이터 타입
// 기준: Figma 와이어프레임 「주석 · D02」
// TODO: 백엔드 API 명세(Swagger) 확정되면 필드 이름·값을 명세에 맞춰 수정

export type ResponseStatus = 'JOINED' | 'RESTING' | 'PENDING'; // 합류 / 쉬어가기 / 미응답

export type ConditionIssueType = 'MISMATCH' | 'NEEDS_CHECK'; // 불일치 / 확인 필요

export interface ConditionMember {
  name: string;
  savedInfo: string; // 저장된 정보. 예: '졸업'
  verdict: string;   // 판정 결과. 예: '재학생 조건 불일치'
}

// 충족한 조건은 내려오지 않음. 불일치·확인 필요 항목만
export interface ConditionIssue {
  id: number;
  type: ConditionIssueType;
  message: string;            // 예: '재학생만 참여할 수 있지만, 합류한 팀원 중 졸업생이 있어요.'
  members: ConditionMember[]; // 관련 팀원 (없으면 팀원 정보 확인 버튼 숨김)
}

export interface MemberResponse {
  memberId: number;
  name: string;
  isMe: boolean;
  status: ResponseStatus;
}

export interface StageTarget {
  stage: ExpeditionStage;
  targetDate: string | null; // 목표일 (ISO 8601)
}

export interface ExpeditionNotice {
  id: number;
  content: string;
}

export interface ChecklistItem {
  id: number;
  content: string;
  done: boolean;
}

export interface ExpeditionDetail {
  id: number;
  contestTitle: string;
  organizer: string;            // 주최
  deadline: string;             // 접수 마감 (ISO 8601)
  contestUrl: string;           // 공고 원문 주소
  stage: ExpeditionStage;       // 현재 진행 단계
  isContestInfoOutdated: boolean; // 최신 공고 정보를 못 받아와서 저장된 정보를 보여주는 중
  conditionIssues: ConditionIssue[];
  responses: MemberResponse[];
  stageTargets: StageTarget[];
  notices: ExpeditionNotice[];
  checklist: ChecklistItem[];
}

export type ExpeditionDetailState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: ExpeditionDetail };
