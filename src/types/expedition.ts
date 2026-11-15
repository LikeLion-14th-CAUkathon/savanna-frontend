import type { ExpeditionStage } from './oasis';


export type ResponseStatus = 'JOINED' | 'RESTING' | 'PENDING'; // 합류 / 쉬어가기 / 미응답

export type ConditionIssueType = 'MISMATCH' | 'NEEDS_CHECK'; // 불일치 / 확인 필요

export interface ConditionMember {
  name: string;
  savedInfo: string; // 저장된 정보
  verdict: string;   // 판정 결과
}

// 불일치·확인 필요 항목만
export interface ConditionIssue {
  id: number;
  type: ConditionIssueType;
  message: string;           
  members: ConditionMember[]; 
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
  organizer: string;          
  deadline: string;            
  contestUrl: string;          
  stage: ExpeditionStage;       
  isContestInfoOutdated: boolean; // 저장된 정보를 보여주는 중
  conditionIssues: ConditionIssue[];
  responses: MemberResponse[];
  stageTargets: StageTarget[];
  notices: ExpeditionNotice[];
  checklist: ChecklistItem[];
  myResponse: MyResponse | null; // 내 정보를 못 불러오면 null (응답 버튼 숨김)
}

/**
 * 이 원정에 대한 내 응답
 * - SENDER: 제안을 보낸 사람 / NONE: 제안 뒤에 팀에 합류해서 받은 제안 기록이 없음
 */
export type MyResponseStatus = 'SENDER' | 'JOINED' | 'RESTING' | 'PENDING' | 'NONE';

export interface MyResponse {
  status: MyResponseStatus;
  proposalRecipientId: number | null; // 응답할 때 쓰는 받은 제안 번호 (SENDER · NONE은 null)
}

export interface ScheduleEditData {
  expeditionId: number;
  contestTitle: string;
  applyStartAt: string | null; // 공식 접수 시작 (ISO 8601) — 확인용. 없으면 null
  deadline: string;      // 공식 접수 마감 (ISO 8601) — 확인용
  stage: ExpeditionStage;
  stageTargets: StageTarget[];
  notices: ExpeditionNotice[];
}

export type ScheduleEditState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: ScheduleEditData };

export type ExpeditionDetailState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: ExpeditionDetail };
