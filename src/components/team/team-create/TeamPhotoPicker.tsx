import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import cameraIcon from '../../../assets/icons/team/team-create/camera.svg';
import plusIcon from '../../../assets/icons/onboarding/plus.svg';
import badgeCameraIcon from '../../../assets/icons/team-photo/camera.svg';
import TeamPhotoCaption from '../team-form/TeamPhotoCaption';
import TeamPhotoMenuSheet from '../team-form/TeamPhotoMenuSheet';
import { TEAM_PHOTO_ACCEPT } from '../../../utils/teamPhoto';

interface TeamPhotoPickerProps {
  photo: File | null;                     // 고른 사진 (부모가 들고 있음)
  onChange: (photo: File | null) => void; // null이면 사진 삭제
}

// B01 팀 프로필 사진 선택.
// 사진이 없으면 누르자마자 사진을 고르고, 사진이 있으면 사진 변경 / 삭제 메뉴를 연다.
export default function TeamPhotoPicker({ photo, onChange }: TeamPhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 화면을 떠날 때 마지막 미리보기 주소를 정리한다.
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const clearPreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
  };

  // 사진을 고르면 미리보기 주소를 새로 만들고, 이전 주소는 정리한다.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 사진을 다시 골라도 반영되도록 비워 둔다
    if (!file) return;

    clearPreview();
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    onChange(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const deletePhoto = () => {
    clearPreview();
    onChange(null);
  };

  const hasPhoto = !!photo && !!previewUrl;

  return (
    <Section>
      <PhotoButton
        type="button"
        aria-label={hasPhoto ? '팀 프로필 사진 변경 또는 삭제' : '팀 프로필 사진 선택'}
        aria-haspopup={hasPhoto ? 'dialog' : undefined}
        $hasPhoto={hasPhoto}
        onClick={hasPhoto ? () => setIsMenuOpen(true) : openFilePicker}
      >
        {hasPhoto && previewUrl ? <Preview src={previewUrl} alt="" /> : <img src={cameraIcon} alt="" />}
        {hasPhoto ? (
          <CameraBadge>
            <img src={badgeCameraIcon} alt="" />
          </CameraBadge>
        ) : (
          <AddBadge>
            <img src={plusIcon} alt="" />
          </AddBadge>
        )}
      </PhotoButton>
      <HiddenInput ref={fileInputRef} type="file" accept={TEAM_PHOTO_ACCEPT} onChange={handleFileChange} />

      <TeamPhotoCaption
        help={
          hasPhoto
            ? '카메라 버튼을 눌러 사진을 바꾸거나 삭제할 수 있어요.'
            : '고르지 않으면 팀 이름 첫 글자로 표시돼요.'
        }
      />

      {isMenuOpen && (
        <TeamPhotoMenuSheet
          onChangePhoto={openFilePicker}
          onDeletePhoto={deletePhoto}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
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

const Badge = styled.span`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffb72b;
`;

// 사진이 없을 때: 원 오른쪽 아래 + 표시
const AddBadge = styled(Badge)`
  top: 48px;
  left: 48px;
  border: 2px solid #fafaf8;
`;

// 사진이 있을 때: 카메라 버튼 (피그마 B01 '사진 선택 후' add). 버튼 테두리(2px) 안쪽 기준 50px
const CameraBadge = styled(Badge)`
  top: 50px;
  left: 50px;
  border: 2px solid #ffffff;
`;

const HiddenInput = styled.input`
  display: none;
`;
