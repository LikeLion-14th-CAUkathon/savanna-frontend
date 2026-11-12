import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import cameraIcon from '../../../assets/icons/team-create/camera.svg';
import plusIcon from '../../../assets/icons/onboarding/plus.svg';

interface TeamPhotoPickerProps {
  photo: File | null;                     // 고른 사진 (부모가 들고 있음)
  onChange: (photo: File | null) => void;
}

// B01 팀 프로필 사진 선택. 누르면 사진을 고르고, 고른 사진을 원 안에 미리 보여준다.
export default function TeamPhotoPicker({ photo, onChange }: TeamPhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // 화면을 떠날 때 마지막 미리보기 주소를 정리한다.
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  // 사진을 고르면 미리보기 주소를 새로 만들고, 이전 주소는 정리한다.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 사진을 다시 골라도 반영되도록 비워 둔다
    if (!file) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    onChange(file);
  };

  const hasPhoto = !!photo && !!previewUrl;

  return (
    <Section>
      <PhotoButton
        type="button"
        aria-label="팀 프로필 사진 선택"
        $hasPhoto={hasPhoto}
        onClick={() => fileInputRef.current?.click()}
      >
        {hasPhoto && previewUrl ? <Preview src={previewUrl} alt="" /> : <img src={cameraIcon} alt="" />}
        <AddBadge>
          <img src={plusIcon} alt="" />
        </AddBadge>
      </PhotoButton>
      <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />

      <Caption>
        <Label>
          프로필 사진 <OptionalBadge>선택</OptionalBadge>
        </Label>
        <Help>고르지 않으면 팀 이름 첫 글자로 표시돼요.</Help>
      </Caption>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const PhotoButton = styled.button<{ $hasPhoto: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 76px;
  height: 76px;
  padding: 0;
  border: 2px ${({ $hasPhoto }) => ($hasPhoto ? 'solid' : 'dashed')} #e7e5e0;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;

const Preview = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

// 원 오른쪽 아래 + 표시
const AddBadge = styled.span`
  position: absolute;
  top: 48px;
  left: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border: 2px solid #fafaf8;
  border-radius: 50%;
  background: #ffb72b;
`;

const HiddenInput = styled.input`
  display: none;
`;

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
