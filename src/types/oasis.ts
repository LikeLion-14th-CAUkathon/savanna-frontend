// 오아시스(D01) 화면 데이터 타입
// 기준: Figma 와이어프레임 「주석 · D01」 필수 UI
// TODO: 백엔드 API 명세(Swagger) 확정되면 필드 이름·값을 명세에 맞춰 수정

// 원정 진행 단계 (D02 진행 단계 선택창 기준)
export type ExpeditionStage = 'KICKOFF' | 'DRAFT' | 'FINAL_REVIEW' | 'SUBMIT';

export const EXPEDITION_STAGE_LABEL: Record<ExpeditionStage, string> = {
  KICKOFF: '킥오프',
  DRAFT: '초안 작성',
  FINAL_REVIEW: '최종 검토',
  SUBMIT: '제출',
};

// 원정 = 팀이 참여 제안을 보낸 공고
export interface OasisExpedition {
  id: number;
  contestTitle: string;     // 공고명
  deadline: string;         // 접수 마감 일시 (ISO 8601). D-day는 화면에서 계산
  stage: ExpeditionStage;   // 현재 진행 단계
  participantCount: number; // 실제로 합류한 인원
}

// 화면 상태: 불러오는 중 / 실패 / 성공
export type OasisState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: OasisHome };

export interface OasisHome {
  teamId: number;
  teamName: string;
  memberCount: number;
  hasNewTeamNews: boolean;        // 하단 '팀 공간' 탭 새 소식 표시. TODO: 별도 API인지 백엔드 확인
  expeditions: OasisExpedition[]; // 진행 중 원정
}
