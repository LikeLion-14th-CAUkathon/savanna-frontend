import type { ReactNode } from 'react';
import styled from 'styled-components';

interface InviteInfoFieldProps {
  label: string;
  value: ReactNode; // 글자 또는 참여 현황처럼 여러 요소로 된 내용
}

// 수정할 수 없는 초대 팀 정보 한 항목
export default function InviteInfoField({ label, value }: InviteInfoFieldProps) {
  return (
    <Field>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </Field>
  );
}

// 제목과 정보 상자 배치
const Field = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
`;

// 정보 항목 제목 (Figma 기능/제목 · 구역 17)
const Label = styled.dt`
  color: var(--color-ink);
  font-size: 17px;
  font-weight: 700;
  line-height: normal;
`;

// 긴 내용은 줄바꿈하고 상자 높이를 늘림
const Value = styled.dd`
  margin: 0;
  padding: 16px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  background: #ffffff;
  font-size: 15px;
  font-weight: 400;
  line-height: normal;
  overflow-wrap: anywhere;
`;