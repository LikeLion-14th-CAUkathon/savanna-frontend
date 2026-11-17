import { isAxiosError } from 'axios';

// 팀 프로필 사진 업로드 규칙 (POST /api/v1/teams/{teamId}/photo): 팀장만, JPEG · PNG, 5 MiB 이하

export const TEAM_PHOTO_ACCEPT = 'image/jpeg,image/png';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;

const TYPE_ERROR = 'JPG 또는 PNG 사진만 올릴 수 있어요.';
const SIZE_ERROR = '5MB 이하 사진만 올릴 수 있어요.';

/** 고른 사진을 서버에 보내기 전에 검사한다. 문제없으면 null */
export function getTeamPhotoError(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return TYPE_ERROR;
  if (file.size > MAX_SIZE) return SIZE_ERROR;
  return null;
}

/** 사진 업로드 실패 안내 문구 */
export function getTeamPhotoUploadErrorMessage(error: unknown): string {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status === 403) return '팀 사진은 팀장만 바꿀 수 있어요.';
  if (status === 413) return SIZE_ERROR;
  if (status === 415) return TYPE_ERROR;
  if (status === 400) return '사진을 올리지 못했어요. 손상됐거나 너무 큰 사진인지 확인해 주세요.';
  return '사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.';
}
