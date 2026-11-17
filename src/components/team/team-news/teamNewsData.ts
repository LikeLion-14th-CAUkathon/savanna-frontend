// B03 팀 소식 API 호출 + 화면용 데이터 변환
// 제안 API 응답에 없는 값(프로젝트 이름 · 공고 마감일 · 팀원 캐릭터)은 내 팀 목록 · 팀 상세 · 원정 정보에서 채운다.

import type { ProposalStatus } from '../../../api/common';
import { getExpedition, getExpeditionProposals } from '../../../api/expedition';
import {
  getProposalRecipients,
  getReceivedProposals,
  getSentProposals,
  markProposalResponsesRead,
  markReceivedProposalRead,
  respondToProposal,
} from '../../../api/proposal';
import { getMyTeams, getTeamDetail } from '../../../api/team';
import type { ReceivedProposal, SentProposal } from '../../../types/teamNews';
import { toCharacterId } from '../../../utils/character';

// 서버는 마감 날짜('2026-11-14')만 준다. 그날 끝까지로 보고 D-day를 계산한다. (C03과 같은 기준)
const toDeadlineAt = (date: string) => `${date}T23:59:59+09:00`;

/** 받은 제안 · 보낸 제안(+ 팀원별 응답 현황). 둘 다 최신순 */
export async function fetchTeamNews(): Promise<{ received: ReceivedProposal[]; sent: SentProposal[] }> {
  const [receivedItems, sentItems, myTeams] = await Promise.all([
    getReceivedProposals(),
    getSentProposals(),
    getMyTeams(),
  ]);
  const projectNameOf = (teamId: number) =>
    myTeams.find((team) => team.teamId === teamId)?.projectName ?? null;

  // 제안 API에는 캐릭터가 없다. 보낸 사람 · 받는 사람은 모두 내 팀원이라(한 사람 한 팀) 팀 상세의 지금 캐릭터로 찾는다.
  // 팀 상세는 매번 새로 불러오므로 팀원이 캐릭터를 바꿔 저장하면 모든 팀원 화면에 같은 캐릭터가 보인다.
  // 못 불러오면 기본 캐릭터로 보여준다.
  const myTeam = myTeams[0];
  const members = myTeam ? ((await getTeamDetail(myTeam.teamId).catch(() => null))?.members ?? []) : [];
  const characterOf = (userId: number | null | undefined) =>
    toCharacterId(members.find((member) => member.userId === userId)?.characterId);

  const [received, sent] = await Promise.all([
    // 받은 제안에는 팀 · 마감일 · 보낸 사람 id가 없어 원정 정보와 원정의 제안 목록으로 채운다. 못 불러오면 그 값만 비워 둔다.
    Promise.all(
      receivedItems.map(async (item): Promise<ReceivedProposal> => {
        const [expedition, expeditionProposals] = await Promise.all([
          getExpedition(item.expeditionId).catch(() => null),
          getExpeditionProposals(item.expeditionId).catch(() => null),
        ]);
        const senderId = expeditionProposals?.find((proposal) => proposal.proposalId === item.proposalId)?.senderId;
        return {
          ...item,
          projectName: expedition ? projectNameOf(expedition.teamId) : null,
          deadline: expedition ? toDeadlineAt(expedition.announcement.deadline) : null,
          senderCharacterId: characterOf(senderId),
        };
      }),
    ),
    Promise.all(
      sentItems.map(async (item): Promise<SentProposal> => {
        const responses = await getProposalRecipients(item.proposalId);
        return {
          ...item,
          projectName: projectNameOf(item.teamId),
          responses: {
            ...responses,
            recipients: responses.recipients.map((recipient) => ({
              ...recipient,
              characterId: characterOf(recipient.userId),
            })),
          },
        };
      }),
    ),
  ]);

  return { received, sent };
}

/** 받은 제안에 합류 / 쉬어가기로 응답. 서버가 반영한 상태를 돌려준다. */
export async function sendResponse(proposalRecipientId: number, status: Exclude<ProposalStatus, 'PENDING'>) {
  const result = await respondToProposal(proposalRecipientId, { status });
  return result.status;
}

/** 화면에 보여준 받은 제안을 읽음 처리 (알림 점에서 빠진다) */
export async function markReceivedRead(proposals: ReceivedProposal[]) {
  const unread = proposals.filter((proposal) => proposal.readAt === null);
  await Promise.all(unread.map((proposal) => markReceivedProposalRead(proposal.proposalRecipientId)));
}

/** 화면에 보여준 보낸 제안의 새 응답 · 응답 변경을 확인 처리. 처리할 게 없으면 false */
export async function markResponsesRead(proposal: SentProposal) {
  const unread = proposal.responses.recipients.filter((recipient) => recipient.responseUnread);
  if (unread.length === 0) return false;
  await markProposalResponsesRead(proposal.proposalId, {
    responses: unread.map(({ proposalRecipientId, responseVersion }) => ({ proposalRecipientId, responseVersion })),
  });
  return true;
}
