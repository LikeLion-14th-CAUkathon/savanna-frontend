// C04 공고 참여 제안에서 쓰는 정보

export interface ProposalMember {
  id: number; // userId
  name: string;
  characterId?: string; // onboarding/profileOptions의 캐릭터 id. 없으면 기본 캐릭터
}

// 제안을 보내는 내 팀
export interface ProposalTeam {
  teamId: number;
  projectName: string;
  members: ProposalMember[]; // 제안을 받을 팀원 (나 제외)
}

export const PROPOSAL_MESSAGE_MAX = 200;
