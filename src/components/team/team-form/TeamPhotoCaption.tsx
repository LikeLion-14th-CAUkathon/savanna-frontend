import styled from 'styled-components';

interface TeamPhotoCaptionProps {
  help: string; // 아래 안내 문구 (B01: 고르지 않으면… / B02 수정: 사진을 눌러…)
}

// 팀 프로필 사진 아래 '프로필 사진 (선택)' + 안내 문구
export default function TeamPhotoCaption({ help }: TeamPhotoCaptionProps) {
  return (
    <Caption>
      <Label>
        프로필 사진 <OptionalBadge>선택</OptionalBadge>
      </Label>
      <Help>{help}</Help>
    </Caption>
  );
}

const Caption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
`;

const Label = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #1e1e1e;
  font-size: 14px;
  font-weight: 700;
`;

// 공통 Input의 '선택' 배지와 같은 모양
const OptionalBadge = styled.span`
  padding: 1px 6px;
  border-radius: 999px;
  background: #f1f0ec;
  color: #5b5b5b;
  font-size: 12px;
  font-weight: 500;
`;

const Help = styled.p`
  margin: 0;
  color: #999896;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;
