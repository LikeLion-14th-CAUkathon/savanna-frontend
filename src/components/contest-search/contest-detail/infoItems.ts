// C03 공고 상세 카드의 (라벨 · 값) 줄

export interface InfoItem {
  label: string;
  value: string;
}

// 값이 들어 있는 줄만 남긴다. (팀 공간 카드처럼 비어 있는 항목은 줄을 숨긴다)
export const filledItems = (items: InfoItem[]) => items.filter((item) => item.value?.trim());
