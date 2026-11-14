import { characters } from '../components/onboarding/profileOptions';

/** 서버 캐릭터 번호(1~9) → 화면 캐릭터 id('baby-lion' 등). 미설정 · 모르는 번호면 undefined */
export const toCharacterId = (apiId: number | null | undefined) =>
  characters.find((character) => character.apiId === apiId)?.id;
