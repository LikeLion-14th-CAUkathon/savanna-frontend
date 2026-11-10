import type { Contest, RecommendedContest } from '../types/contest';

// API 명세가 나오기 전까지 쓰는 목업 데이터 (피그마 C01 시안 기준)

const CONTESTS: Contest[] = [
  {
    id: 1,
    title: '청년 사회문제 해결 해커톤',
    host: '해커톤협회',
    category: '개발·해커톤',
    deadline: '2026.11.05',
    dDay: 5,
    status: 'open',
  },
  {
    id: 2,
    title: '오픈데이터 앱 디자인 챌린지',
    host: '오픈데이터진흥원',
    category: '디자인',
    deadline: '2026.11.08',
    dDay: 8,
    status: 'open',
  },
  {
    id: 3,
    title: '서울 청년 현장 아이디어톤',
    host: '서울청년센터',
    category: '아이디어·기획',
    deadline: '2026.11.10',
    dDay: 10,
    status: 'open',
  },
  {
    id: 4,
    title: '헬스케어 AI 아이디어 공모전',
    host: '디지털헬스진흥원',
    category: 'AI·헬스케어',
    deadline: '2026.11.14',
    dDay: 14,
    status: 'open',
  },
  {
    id: 5,
    title: '대학생 서비스 기획 경진대회',
    host: '한국대학연합',
    category: '아이디어·기획',
    deadline: '2026.11.21',
    dDay: 21,
    status: 'upcoming',
  },
];

const RECOMMENDED_CONTESTS: RecommendedContest[] = [
  { ...CONTESTS[0], reason: '수면 기록으로 생활 문제를 해결하는 프로젝트와 주제가 비슷해요.' },
  { ...CONTESTS[3], reason: 'AI 수면 코칭이 공모 분야(건강 관리)와 잘 맞아요.' },
  { ...CONTESTS[2], reason: '팀원 모두 서울에서 활동해 오프라인 발표가 가능해요.' },
];

const MOCK_DELAY_MS = 300;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY_MS));
}

export function fetchContests(): Promise<Contest[]> {
  return delay(CONTESTS);
}

export function fetchRecommendedContests(): Promise<RecommendedContest[]> {
  return delay(RECOMMENDED_CONTESTS);
}
