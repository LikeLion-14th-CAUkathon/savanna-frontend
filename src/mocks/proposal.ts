import { SAMPLE_TEAM } from './invite';
import type { ProposalTeam } from '../types/proposal';

// API 명세가 나오기 전까지 쓰는 목업 데이터 (피그마 C04 시안 기준)

const MOCK_DELAY_MS = 300;

const MOCK_TEAM: ProposalTeam = {
  projectName: SAMPLE_TEAM.projectName,
  members: [
    { id: 1, name: '이코끼', characterId: 'elephant' },
    { id: 2, name: '박기린', characterId: 'giraffe' },
  ],
};

type PreviewScenario = 'no-members' | 'send-error';

// 개발 서버에서 /contest/1?proposal=no-members (send-error)로 상태 확인
function getPreviewScenario(): PreviewScenario | null {
  if (!import.meta.env.DEV) return null;
  const preview = new URLSearchParams(window.location.search).get('proposal');
  if (preview === 'no-members' || preview === 'send-error') return preview;
  return null;
}

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY_MS));
}

export function fetchProposalTeam(): Promise<ProposalTeam> {
  if (getPreviewScenario() === 'no-members') return delay({ ...MOCK_TEAM, members: [] });
  return delay(MOCK_TEAM);
}

export function sendProposal(_contestId: number, _message: string): Promise<void> {
  if (getPreviewScenario() === 'send-error') {
    return delay(null).then(() => {
      throw new Error('제안 전송 실패 (목업)');
    });
  }
  return delay(undefined);
}
