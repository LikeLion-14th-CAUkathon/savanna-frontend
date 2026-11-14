// B02 팀 공간 API 호출 + 화면용 데이터 변환

import { createInvitation, getInvitations } from '../../../api/invitation';
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
// 초대 링크 주소(inviteUrl)는 만들 때만 받을 수 있어서, 만든 링크를 이 브라우저에 보관해 두고 다시 쓴다.
// 보관한 링크가 없거나 만료 · 회수됐으면 새로 만든다. (링크는 7일 유효)

interface SavedInvite {
  invitationId: number;
  inviteUrl: string;
  expiresAt: string;
}

const inviteKey = (teamId: number) => `savanna:team-invite:${teamId}`;

// 사생활 보호 모드 등에서 저장소를 못 쓰면 매번 새 링크를 만든다.
const readSavedInvite = (teamId: number): SavedInvite | null => {
  try {
    const raw = localStorage.getItem(inviteKey(teamId));
    return raw ? (JSON.parse(raw) as SavedInvite) : null;
  } catch {
    return null;
  }
};

const saveInvite = (teamId: number, invite: SavedInvite) => {
  try {
    localStorage.setItem(inviteKey(teamId), JSON.stringify(invite));
  } catch {
    // 저장하지 못해도 이번 화면에서는 링크를 쓸 수 있다.
  }
};

// 만료 직전 링크는 복사해 보내는 사이 만료될 수 있어 1시간 여유를 둔다.
const EXPIRY_MARGIN_MS = 60 * 60 * 1000;

/** 팀 초대 링크. 쓸 수 있는 링크가 있으면 그대로, 없으면 새로 만든다. */
export async function fetchInviteUrl(teamId: number) {
  const saved = readSavedInvite(teamId);
  if (saved && Date.parse(saved.expiresAt) - EXPIRY_MARGIN_MS > Date.now()) {
    const invitations = await getInvitations(teamId);
    const current = invitations.find((invitation) => invitation.invitationId === saved.invitationId);
    if (current?.status === 'ACTIVE' && current.revokedAt === null) return saved.inviteUrl;
  }

  const created = await createInvitation(teamId);
  saveInvite(teamId, {
    invitationId: created.invitationId,
    inviteUrl: created.inviteUrl,
    expiresAt: created.expiresAt,
  });
  return created.inviteUrl;
}
