import type { ReceivedProposal, SentProposal } from '../types/teamNews';

// B03 팀 소식 예시 데이터 (피그마 B03-01 시안 기준).
// TODO: API 연결 시 getReceivedProposals · getSentProposals · getProposalRecipients 응답으로 교체
export const MOCK_RECEIVED_PROPOSALS: ReceivedProposal[] = [
  {
    proposalRecipientId: 11,
    proposalId: 101,
    expeditionId: 201,
    announcementId: 1,
    announcementTitle: '청년 사회문제 해결 해커톤',
    senderName: '이초원',
    message: '마감까지 5일 남았어요! 우리 ‘AI 수면 습관 코치’ 프로젝트로 함께 도전해 봐요.',
    status: 'PENDING',
    createdAt: '2026-11-13T09:20:00+09:00',
    readAt: null,
    projectName: 'AI 수면 습관 코치',
    deadline: '2026-11-18T23:59:00+09:00',
    senderCharacterId: 'elephant',
  },
];

export const MOCK_SENT_PROPOSALS: SentProposal[] = [
  {
    proposalId: 301,
    expeditionId: 401,
    teamId: 1,
    announcementId: 2,
    announcementTitle: '헬스케어 AI 아이디어 공모전',
    message: '헬스케어 공모전 같이 나가 봐요!',
    createdAt: '2026-10-30T14:00:00+09:00',
    projectName: 'AI 수면 습관 코치',
    responses: {
      proposalId: 301,
      totalCount: 3,
      joinedCount: 1,
      declinedCount: 1,
      pendingCount: 1,
      recipients: [
        { proposalRecipientId: 31, userId: 2, name: '이초원', status: 'JOINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'elephant' },
        { proposalRecipientId: 32, userId: 3, name: '박공모', status: 'DECLINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'giraffe' },
        { proposalRecipientId: 33, userId: 5, name: '정미래', status: 'PENDING', readAt: null, respondedAt: null, responseVersion: 0, responseUnread: false, characterId: 'cheetah' },
      ],
    },
  },
  {
    proposalId: 302,
    expeditionId: 402,
    teamId: 1,
    announcementId: 3,
    announcementTitle: '서울 청년 현장 아이디어톤',
    message: '현장 아이디어톤 어때요?',
    createdAt: '2026-10-28T10:00:00+09:00',
    projectName: 'AI 수면 습관 코치',
    responses: {
      proposalId: 302,
      totalCount: 3,
      joinedCount: 2,
      declinedCount: 0,
      pendingCount: 1,
      recipients: [
        { proposalRecipientId: 34, userId: 2, name: '이초원', status: 'JOINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'elephant' },
        { proposalRecipientId: 35, userId: 3, name: '박공모', status: 'JOINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'giraffe' },
        { proposalRecipientId: 36, userId: 5, name: '정미래', status: 'PENDING', readAt: null, respondedAt: null, responseVersion: 0, responseUnread: false, characterId: 'cheetah' },
      ],
    },
  },
  {
    proposalId: 303,
    expeditionId: 403,
    teamId: 1,
    announcementId: 4,
    announcementTitle: '오픈데이터 앱 디자인 챌린지',
    message: '디자인 챌린지도 도전해 봐요.',
    createdAt: '2026-10-21T18:30:00+09:00',
    projectName: 'AI 수면 습관 코치',
    responses: {
      proposalId: 303,
      totalCount: 3,
      joinedCount: 0,
      declinedCount: 3,
      pendingCount: 0,
      recipients: [
        { proposalRecipientId: 37, userId: 2, name: '이초원', status: 'DECLINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'elephant' },
        { proposalRecipientId: 38, userId: 3, name: '박공모', status: 'DECLINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'giraffe' },
        { proposalRecipientId: 39, userId: 5, name: '정미래', status: 'DECLINED', readAt: null, respondedAt: null, responseVersion: 1, responseUnread: false, characterId: 'cheetah' },
      ],
    },
  },
];
