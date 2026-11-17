import { apiClient } from './client';
import type { ProposalStatus } from './common';

// ===== Types =====

export interface ProposalCreateRequest {
  message: string; // 최대 2000자
  teamId?: number;
}

export interface ProposalCreateResponse {
  proposalId: number;
  expeditionId: number;
}

/** 제안 수신자별 응답 */
export interface ProposalRecipient {
  proposalRecipientId: number;
  userId: number;
  name: string;
  status: ProposalStatus;
  readAt: string | null; // date-time
  respondedAt: string | null; // date-time
  responseVersion: number;
  responseUnread: boolean;
}

/** 보낸 제안 응답 현황 */
export interface ProposalRecipientsResponse {
  proposalId: number;
  totalCount: number;
  joinedCount: number;
  declinedCount: number;
  pendingCount: number;
  recipients: ProposalRecipient[];
}

/** 내가 보낸 제안 */
export interface SentProposalResponse {
  proposalId: number;
  expeditionId: number;
  teamId: number;
  announcementId: number;
  announcementTitle: string;
  message: string;
  createdAt: string; // date-time
}

export interface ProposalResponsesReadRequest {
  responses: {
    proposalRecipientId: number;
    responseVersion?: number;
  }[]; // 최대 100개
}

export interface ProposalResponsesReadResponse {
  proposalId: number;
  acknowledgedCount: number;
}

/** 팀 소식 알림 점 */
export interface ProposalNotificationResponse {
  hasUnread: boolean;
  unreadProposalCount: number;
  unreadResponseCount: number;
}

/** 내가 받은 참여 제안 */
export interface ReceivedProposalResponse {
  proposalRecipientId: number;
  proposalId: number;
  expeditionId: number;
  announcementId: number;
  announcementTitle: string;
  senderName: string;
  message: string;
  status: ProposalStatus;
  createdAt: string; // date-time
  readAt: string | null; // date-time
}

export interface ProposalPendingCountResponse {
  pendingCount: number;
}

export interface ProposalResponseRequest {
  status: ProposalStatus; // JOINED ↔ DECLINED 변경 가능
}

/** 제안 응답 결과 */
export interface ProposalRecipientResponse {
  proposalRecipientId: number;
  proposalId: number;
  expeditionId: number;
  teamId: number;
  status: ProposalStatus;
  respondedAt: string | null; // date-time
  responseVersion: number;
}

// ===== API: 보낸 제안 =====

/**
 * 공고 참여 제안 전송 — POST /api/v1/announcements/{announcementId}/proposals
 * - 원정·제안·수신자 기록을 함께 생성
 * - 같은 팀이 같은 공고에 이미 제안했다면 중복 요청으로 거절
 */
export const createProposal = async (announcementId: number, body: ProposalCreateRequest) => {
  const { data } = await apiClient.post<ProposalCreateResponse>(
    `/api/v1/announcements/${announcementId}/proposals`,
    body,
  );
  return data;
};

/** 내가 보낸 제안 목록 (최신순) — GET /api/v1/proposals/sent */
export const getSentProposals = async () => {
  const { data } = await apiClient.get<SentProposalResponse[]>('/api/v1/proposals/sent');
  return data;
};

/** 보낸 제안 응답 현황 — GET /api/v1/proposals/{proposalId}/recipients */
export const getProposalRecipients = async (proposalId: number) => {
  const { data } = await apiClient.get<ProposalRecipientsResponse>(
    `/api/v1/proposals/${proposalId}/recipients`,
  );
  return data;
};

/**
 * 보낸 제안의 응답 확인 처리 — PATCH /api/v1/proposals/{proposalId}/recipients/read
 * - 화면에서 실제 확인한 수신 기록 ID와 responseVersion을 전달
 */
export const markProposalResponsesRead = async (
  proposalId: number,
  body: ProposalResponsesReadRequest,
) => {
  const { data } = await apiClient.patch<ProposalResponsesReadResponse>(
    `/api/v1/proposals/${proposalId}/recipients/read`,
    body,
  );
  return data;
};

/** 팀 소식 알림 점 조회 — GET /api/v1/proposals/notifications */
export const getProposalNotifications = async () => {
  const { data } = await apiClient.get<ProposalNotificationResponse>(
    '/api/v1/proposals/notifications',
  );
  return data;
};

// ===== API: 받은 제안 =====

/** 받은 참여 제안 목록 (최신순) — GET /api/v1/proposal-recipients/received */
export const getReceivedProposals = async () => {
  const { data } = await apiClient.get<ReceivedProposalResponse[]>(
    '/api/v1/proposal-recipients/received',
  );
  return data;
};

/** 미응답 참여 제안 개수 — GET /api/v1/proposal-recipients/pending-count */
export const getPendingProposalCount = async () => {
  const { data } = await apiClient.get<ProposalPendingCountResponse>(
    '/api/v1/proposal-recipients/pending-count',
  );
  return data;
};

/** 받은 참여 제안 읽음 처리 — PATCH /api/v1/proposal-recipients/{proposalRecipientId}/read */
export const markReceivedProposalRead = async (proposalRecipientId: number) => {
  const { data } = await apiClient.patch<ReceivedProposalResponse>(
    `/api/v1/proposal-recipients/${proposalRecipientId}/read`,
  );
  return data;
};

/** 제안 응답 (합류/쉬어가기) — PATCH /api/v1/proposal-recipients/{proposalRecipientId}/response */
export const respondToProposal = async (
  proposalRecipientId: number,
  body: ProposalResponseRequest,
) => {
  const { data } = await apiClient.patch<ProposalRecipientResponse>(
    `/api/v1/proposal-recipients/${proposalRecipientId}/response`,
    body,
  );
  return data;
};
