import styled from 'styled-components';

interface InviteInfoFieldProps {
  label: string;
  value: string;
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
  gap: 8px;
  margin: 0;
`;

// 정보 항목 제목
const Label = styled.dt`
  font-size: 14px;
  font-weight: 700;
  line-height: 17px;
`;

// 긴 내용은 줄바꿈하고 상자 높이를 늘림
const Value = styled.dd`
  margin: 0;
  padding: 16px;
  border: 1.5px solid #e7e5e0;
  border-radius: 12px;
  background: #ffffff;
  font-size: 15px;
  font-weight: 400;
  line-height: 18px;
  overflow-wrap: anywhere;
`;