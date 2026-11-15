// B02 팀 공간 API 호출 + 화면용 데이터 변환

import { createInvitation } from '../../../api/invitation';
import { getMyTeams, getTeamDetail, type TeamDetailResponse } from '../../../api/team';
import { getMyInfo } from '../../../api/user';

/**
 * 보여줄 팀 id. 한 사람은 한 팀에만 속하므로, 주소(?teamId=)에 없으면 내 팀 목록의 유일한 팀. 소속 팀이 없으면 null
 */
export async function resolveTeamId(search: string) {
  const teamId = Number(new URLSearchParams(search).get('teamId'));
  if (Number.isInteger(teamId) && teamId > 0) return teamId;
  const teams = await getMyTeams();
  return teams[0]?.teamId ?? null;
}

export interface TeamSpaceData {
  team: TeamDetailResponse; // 팀 사진(photoUrl) · 팀원 캐릭터(characterId) 포함
  myUserId: number;
}

/** 팀 공간 정보(팀 · 팀원 · 나). 소속 팀이 없으면 null */
export async function fetchTeamSpace(search: string): Promise<TeamSpaceData | null> {
  const [teamId, me] = await Promise.all([resolveTeamId(search), getMyInfo()]);
  if (teamId === null) return null;

  const team = await getTeamDetail(teamId);
  return { team, myUserId: me.userId };
}

// ===== 초대 링크 =====

const toInviteUrl = (token: string) => `${window.location.origin}/invite/${encodeURIComponent(token)}`;

export async function fetchInviteUrl(teamId: number) {
  const created = await createInvitation(teamId);
  return toInviteUrl(created.token);
}
