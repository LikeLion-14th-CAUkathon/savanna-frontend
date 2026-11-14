// C04 공고 참여 제안 API 호출 + 화면용 데이터 변환

import { isAxiosError } from 'axios';
import { createProposal } from '../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../api/team';
import { getMyInfo } from '../../api/user';
import type { ProposalTeam } from '../../types/proposal';
import { toCharacterId } from '../../utils/character';

/** 제안을 보낼 내 팀(프로젝트 · 받는 사람). 소속 팀이 없으면 null */
export async function fetchProposalTeam(): Promise<ProposalTeam | null> {
  const [teams, me] = await Promise.all([getMyTeams(), getMyInfo()]);
  // 한 사람은 한 팀에만 속한다.
  const team = teams[0];
  if (!team) return null;

  const detail = await getTeamDetail(team.teamId);
  return {
    teamId: team.teamId,
    projectName: detail.projectName,
    // 받는 사람은 나를 뺀 팀원. 캐릭터를 고르지 않은 팀원은 화면에서 기본 캐릭터로 보여준다.
    members: detail.members
      .filter((member) => member.userId !== me.userId)
      .map((member) => ({ id: member.userId, name: member.name, characterId: toCharacterId(member.characterId) })),
  };
}

export type SendProposalError = 'duplicate' | 'unknown';

/** 참여 제안 보내기. 같은 팀이 같은 공고에 이미 보냈으면 서버가 거절한다. */
export async function sendProposal(announcementId: number, teamId: number, message: string) {
  await createProposal(announcementId, { message, teamId });
}

// 전송 실패 이유. 같은 팀이 같은 공고에 이미 제안했으면 409(Conflict)로 온다(명세).
export function getSendProposalError(error: unknown): SendProposalError {
  return isAxiosError(error) && error.response?.status === 409 ? 'duplicate' : 'unknown';
}
