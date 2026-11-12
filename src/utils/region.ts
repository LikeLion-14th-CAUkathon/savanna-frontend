// 화면 지역명(한글) ↔ API 지역 코드 변환
// SEOUL, GYEONGGI만 명세로 확인됨. 나머지는 같은 로마자 표기 방식으로 가정한 값이라
// 백엔드 지역 코드 Enum을 받으면 이 표만 수정하면 된다.

export const REGION_CODE_MAP = {
  서울: 'SEOUL',
  경기: 'GYEONGGI',
  인천: 'INCHEON',
  강원: 'GANGWON',
  대전: 'DAEJEON',
  세종: 'SEJONG',
  충북: 'CHUNGBUK',
  충남: 'CHUNGNAM',
  광주: 'GWANGJU',
  전북: 'JEONBUK',
  전남: 'JEONNAM',
  대구: 'DAEGU',
  부산: 'BUSAN',
  울산: 'ULSAN',
  경북: 'GYEONGBUK',
  경남: 'GYEONGNAM',
  제주: 'JEJU',
} as const;

export type RegionName = keyof typeof REGION_CODE_MAP;
export type RegionCode = (typeof REGION_CODE_MAP)[RegionName];

const REGION_NAME_MAP = Object.fromEntries(
  Object.entries(REGION_CODE_MAP).map(([name, code]) => [code, name]),
) as Record<RegionCode, RegionName>;

/** 한글 지역명 → API 코드. 표에 없는 값은 제외한다. ('서울' → 'SEOUL') */
export const toRegionCodes = (names: string[]): RegionCode[] =>
  names
    .filter((name): name is RegionName => name in REGION_CODE_MAP)
    .map((name) => REGION_CODE_MAP[name]);

/** API 코드 → 한글 지역명. 표에 없는 값은 제외한다. ('SEOUL' → '서울') */
export const toRegionNames = (codes: string[]): RegionName[] =>
  codes
    .filter((code): code is RegionCode => code in REGION_NAME_MAP)
    .map((code) => REGION_NAME_MAP[code]);
