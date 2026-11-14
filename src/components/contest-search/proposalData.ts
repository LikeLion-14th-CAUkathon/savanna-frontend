// C04 공고 참여 제안 API 호출 + 화면용 데이터 변환

import { isAxiosError } from 'axios';
import { createProposal } from '../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../api/team';
import { getMyInfo } from '../../api/user';
import type { ProposalTeam } from '../../types/proposal';

/** 제안을 보낼 내 팀(프로젝트 · 받는 사람). 소속 팀이 없으면 null */
export async function fetchProposalTeam(): Promise<ProposalTeam | null> {
  const [teams, me] = await Promise.all([getMyTeams(), getMyInfo()]);
  // TODO: 팀 전환 기능이 생기면 선택한 팀으로. 지금은 오아시스처럼 첫 번째 팀
  const team = teams[0];
  if (!team) return null;

  const detail = await getTeamDetail(team.teamId);
  return {
    teamId: team.teamId,
    projectName: detail.projectName,
    // 받는 사람은 나를 뺀 팀원. 팀 API에 캐릭터 정보가 없어 화면에서 기본 캐릭터로 보여준다.
    members: detail.members
      .filter((member) => member.userId !== me.userId)
      .map((member) => ({ id: member.userId, name: member.name })),
  };
}

export type SendProposalError = 'duplicate' | 'unknown';

/** 참여 제안 보내기. 같은 팀이 같은 공고에 이미 보냈으면 서버가 거절한다. */
export async function sendProposal(announcementId: number, teamId: number, message: string) {
  await createProposal(announcementId, { message, teamId });
}

// 전송 실패 이유. 중복 제안은 409(Conflict)로 온다고 보고 따로 안내한다.
export function getSendProposalError(error: unknown): SendProposalError {
  return isAxiosError(error) && error.response?.status === 409 ? 'duplicate' : 'unknown';
}
