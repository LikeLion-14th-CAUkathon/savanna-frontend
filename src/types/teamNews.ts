import type {
  ProposalRecipient,
  ProposalRecipientsResponse,
  ReceivedProposalResponse,
  SentProposalResponse,
} from '../api/proposal';

// B03 팀 소식 화면에서 쓰는 정보.
// 아래 추가 필드는 제안 API 응답에 없는 값이라 내 팀 목록 · 원정 정보에서 채운다(teamNewsData).
// 못 구하면 null이고, 화면에서 그 부분만 빼고 보여준다.

/** 받은 제안 + 화면에 필요한 추가 정보 */
export interface ReceivedProposal extends ReceivedProposalResponse {
  projectName: string | null; // 제안한 팀의 프로젝트 이름
  deadline: string | null; // 공고 마감 일시 (D-day 표시)
  senderCharacterId?: string; // 보낸 사람 캐릭터 id (API에 없어 기본 캐릭터)
}

/** 보낸 제안의 팀원별 응답 + 캐릭터 */
export interface SentProposalRecipient extends ProposalRecipient {
  characterId?: string;
}

/** 보낸 제안 + 응답 현황 */
export interface SentProposal extends SentProposalResponse {
  projectName: string | null; // 보낸 팀의 프로젝트 이름
  responses: Omit<ProposalRecipientsResponse, 'recipients'> & {
    recipients: SentProposalRecipient[];
  };
}
