import type { TeamCreateRequest, TeamInfo } from '../api/team';

// B01 팀 생성 · B02 팀 정보 수정이 함께 쓰는 입력 폼 값과 검사 규칙

export type TeamForm = Required<TeamCreateRequest>;

export type TeamFormErrors = Partial<Record<keyof TeamForm, string>>;

export const EMPTY_TEAM_FORM: TeamForm = {
  name: '',
  projectName: '',
  projectIntro: '',
  githubUrl: '',
  presentationUrl: '',
  stack: '',
};

const URL_ERROR = 'https:// 또는 http://로 시작하는 링크를 입력해 주세요.';

// 선택 링크는 비어 있거나 http(s)://로 시작해야 한다.
const isValidUrl = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' || /^https?:\/\/\S+$/i.test(trimmed);
};

export function getTeamFormErrors(form: TeamForm): TeamFormErrors {
  return {
    name: !form.name.trim() ? '팀 이름을 입력해 주세요.' : undefined,
    projectName: !form.projectName.trim() ? '프로젝트 이름을 입력해 주세요.' : undefined,
    projectIntro: !form.projectIntro.trim() ? '프로젝트 소개를 입력해 주세요.' : undefined,
    githubUrl: !isValidUrl(form.githubUrl) ? URL_ERROR : undefined,
    presentationUrl: !isValidUrl(form.presentationUrl) ? URL_ERROR : undefined,
  };
}

// 앞뒤 공백을 지워 API 요청 값으로 만든다.
export function toTeamRequest(form: TeamForm): TeamCreateRequest {
  return {
    name: form.name.trim(),
    projectName: form.projectName.trim(),
    projectIntro: form.projectIntro.trim(),
    githubUrl: form.githubUrl.trim(),
    presentationUrl: form.presentationUrl.trim(),
    stack: form.stack.trim(),
  };
}

// 저장된 팀 정보를 폼 값으로 바꾼다. 비어 있는 선택 항목(null)은 빈 칸.
export function toTeamForm(team: Omit<TeamInfo, 'teamId'>): TeamForm {
  return {
    name: team.name,
    projectName: team.projectName,
    projectIntro: team.projectIntro,
    githubUrl: team.githubUrl ?? '',
    presentationUrl: team.presentationUrl ?? '',
    stack: team.stack ?? '',
  };
}
