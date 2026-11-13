import type { TeamDetailResponse } from '../api/team';

// B02 팀 공간 예시 데이터 (피그마 B02 시안 기준). API 연결 시 getTeamDetail · 초대 링크 응답으로 교체
export const MOCK_TEAM_SPACE: {
  team: TeamDetailResponse;
  myUserId: number;
  inviteUrl: string;
  memberCharacterIds: Record<number, string>; // userId → 캐릭터 id. 팀 API에 아직 없는 값
} = {
  team: {
    teamId: 1,
    name: '사바나 탐험대',
    projectName: 'AI 수면 습관 코치',
    projectIntro: '수면 기록을 분석해 생활 리듬을 코칭하는 해커톤 프로젝트예요.',
    githubUrl: 'https://github.com/savanna-team',
    presentationUrl: 'https://savanna.app/deck',
    stack: 'React, Node.js',
    members: [
      { userId: 1, name: '김사바나', role: 'LEADER' },
      { userId: 2, name: '이초원', role: 'MEMBER' },
      { userId: 3, name: '박공모', role: 'MEMBER' },
      { userId: 4, name: '최사자', role: 'MEMBER' },
    ],
  },
  myUserId: 1,
  inviteUrl: 'https://savanna.app/invite/7731',
  memberCharacterIds: { 1: 'baby-lion', 2: 'elephant', 3: 'giraffe', 4: 'giraffe' },
};
