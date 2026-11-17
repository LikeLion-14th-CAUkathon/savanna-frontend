import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import imageIcon from '../../../assets/icons/team-photo/image.svg';
import trashIcon from '../../../assets/icons/team-photo/trash.svg';

interface TeamPhotoMenuSheetProps {
  onChangePhoto: () => void; // 사진 변경: 새 사진 고르기
  onDeletePhoto: () => void; // 사진 삭제
  onClose: () => void;       // 바깥 영역 · Esc · 아래로 끌기
}

// B01 · B01-2 팀 사진 메뉴. 사진이 있을 때 카메라 버튼을 누르면 사진 변경 / 삭제를 고른다.
// 항목을 누르면 시트를 닫고 고른 동작을 실행한다.
export default function TeamPhotoMenuSheet({ onChangePhoto, onDeletePhoto, onClose }: TeamPhotoMenuSheetProps) {
  const select = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <BottomSheet ariaLabel="팀 사진 메뉴" onClose={onClose}>
      <Options>
        <Option type="button" onClick={() => select(onChangePhoto)}>
          <IconBox>
            <img src={imageIcon} alt="" />
          </IconBox>
          사진 변경
        </Option>
        <Option type="button" $danger onClick={() => select(onDeletePhoto)}>
          <IconBox>
            <img src={trashIcon} alt="" />
          </IconBox>
          사진 삭제
        </Option>
      </Options>
    </BottomSheet>
  );
}

const Options = styled.div`
  display: flex;
  flex-direction: column;
`;

const Option = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  background: transparent;
  color: ${({ $danger }) => ($danger ? '#b3261e' : '#1e1e1e')};
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;

  & + & {
    border-top: 1px solid #e7e5e0;
  }

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: -2px;
    border-radius: 8px;
  }
`;

// 아이콘 22px 칸 가운데에 원래 크기로 둔다.
const IconBox = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
`;
