// C04 공고 참여 제안 API 호출 + 화면용 데이터 변환

import { isAxiosError } from 'axios';
import { getTeamExpeditions } from '../../api/expedition';
import { createProposal } from '../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../api/team';
import { getMyInfo } from '../../api/user';
import { PROPOSAL_LIMIT_PER_TEAM, type ProposalTeam } from '../../types/proposal';
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

export type SendProposalError = 'duplicate' | 'limit' | 'unknown';

// 팀 제안 수가 한도에 닿아 보내지 않았을 때
class ProposalLimitError extends Error {}

/**
 * 참여 제안 보내기. 같은 팀이 같은 공고에 이미 보냈으면 서버가 거절한다.
 * 팀 전체 제안은 PROPOSAL_LIMIT_PER_TEAM개까지. 다른 팀원이 방금 보낸 것도 세도록 보내기 직전에 원정 수를 새로 센다.
 * (제안 하나가 원정 하나를 만든다. 원정 목록은 마감 · 제출 완료 원정도 포함)
 */
export async function sendProposal(announcementId: number, teamId: number, message: string) {
  const expeditions = await getTeamExpeditions(teamId);
  if (expeditions.length >= PROPOSAL_LIMIT_PER_TEAM) throw new ProposalLimitError();
  await createProposal(announcementId, { message, teamId });
}

// 전송 실패 이유. 같은 팀이 같은 공고에 이미 제안했으면 409(Conflict)로 온다(명세).
export function getSendProposalError(error: unknown): SendProposalError {
  if (error instanceof ProposalLimitError) return 'limit';
  return isAxiosError(error) && error.response?.status === 409 ? 'duplicate' : 'unknown';
}
