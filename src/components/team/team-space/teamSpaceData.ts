// B02 팀 공간 API 호출 + 화면용 데이터 변환

import { isAxiosError } from 'axios';
import { createInvitation, getCurrentInvitation } from '../../../api/invitation';
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

/**
 * 팀의 현재 초대 링크. 서버가 준 inviteUrl을 그대로 쓴다.
 * 링크가 없으면(404) 팀장은 새로 만들고, 팀원은 null (팀장이 만들 때까지 기다린다)
 */
export async function fetchInviteUrl(teamId: number, isLeader: boolean): Promise<string | null> {
  try {
    const current = await getCurrentInvitation(teamId);
    return current.inviteUrl;
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  }
  if (!isLeader) return null;
  const created = await createInvitation(teamId);
  return created.inviteUrl;
}
