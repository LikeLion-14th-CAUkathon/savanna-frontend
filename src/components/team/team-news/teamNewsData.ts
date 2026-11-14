// B03 팀 소식 API 호출 + 화면용 데이터 변환
// 제안 API 응답에 없는 값(프로젝트 이름 · 공고 마감일)은 내 팀 목록과 원정 정보에서 채운다.

import type { ProposalStatus } from '../../../api/common';
import { getExpedition } from '../../../api/expedition';
import {
  getProposalRecipients,
  getReceivedProposals,
  getSentProposals,
  markProposalResponsesRead,
  markReceivedProposalRead,
  respondToProposal,
} from '../../../api/proposal';
import { getMyTeams } from '../../../api/team';
import type { ReceivedProposal, SentProposal } from '../../../types/teamNews';

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

  const [received, sent] = await Promise.all([
    // 받은 제안에는 팀 · 마감일이 없어 원정 정보로 채운다. 못 불러오면 그 값만 비워 둔다.
    Promise.all(
      receivedItems.map(async (item): Promise<ReceivedProposal> => {
        const expedition = await getExpedition(item.expeditionId).catch(() => null);
        return {
          ...item,
          projectName: expedition ? projectNameOf(expedition.teamId) : null,
          deadline: expedition ? toDeadlineAt(expedition.announcement.deadline) : null,
        };
      }),
    ),
    Promise.all(
      sentItems.map(
        async (item): Promise<SentProposal> => ({
          ...item,
          projectName: projectNameOf(item.teamId),
          responses: await getProposalRecipients(item.proposalId),
        }),
      ),
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
