import type { ProposalNotificationResponse } from '../api/proposal';
import type { ReceivedProposal, SentProposal } from '../types/teamNews';

// 팀 소식 알림 점 계산. 아래 둘 중 하나라도 있으면 점을 보여준다.
// - 아직 확인하지 않은 새 제안 (받은 제안의 readAt이 없음)
// - 내가 보낸 제안에 대한 팀원의 새 응답 · 응답 변경 (responseUnread)
// TODO: API 연결 시 getProposalNotifications() 응답으로 교체 (같은 모양으로 반환한다)
export function getTeamNewsNotification(
  receivedProposals: ReceivedProposal[],
  sentProposals: SentProposal[],
): ProposalNotificationResponse {
  const unreadProposalCount = receivedProposals.filter((proposal) => proposal.readAt === null).length;
  const unreadResponseCount = sentProposals
    .flatMap((proposal) => proposal.responses.recipients)
    .filter((recipient) => recipient.responseUnread).length;

  return {
    hasUnread: unreadProposalCount > 0 || unreadResponseCount > 0,
    unreadProposalCount,
    unreadResponseCount,
  };
}
