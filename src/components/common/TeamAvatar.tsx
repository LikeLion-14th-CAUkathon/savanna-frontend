import styled from 'styled-components';
import editIcon from '../../assets/icons/team-avatar-edit.svg';

interface TeamAvatarProps {
  teamName: string;     // 사용자가 입력한 팀 이름
  editable?: boolean;   // true면 오른쪽 아래에 수정(연필) 버튼을 보여줌
  onEdit?: () => void;  // 수정 버튼을 눌렀을 때 실행할 함수
}

// 팀 이름에서 첫 글자만 뽑기
const getInitial = (name: string) => {
  const trimmed = name.trim(); 
  if (!trimmed) return '?';    // 아무것도 입력 안 했으면 물음표
  return Array.from(trimmed)[0].toUpperCase(); 
};

export default function TeamAvatar({
  teamName,
  editable = false,
  onEdit,
}: TeamAvatarProps) {
  return (
    <Container>
      <Circle role="img" aria-label={`${teamName} 팀`}>
        {getInitial(teamName)}
      </Circle>

      {/* editable이 true일 때만 수정 버튼을 그림 */}
      {editable && (
        <EditButton type="button" aria-label="팀 이미지 수정" onClick={onEdit}>
          <img src={editIcon} alt="" />
        </EditButton>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative; /* 수정 버튼을 원 위에 겹쳐 놓기 위한 기준점 */
  width: 76px;
  height: 76px;
  flex-shrink: 0;
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 76px;
  height: 76px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background-color: #ffb72b;
  color: #1e1e1e;
  box-shadow: 0 4px 0 #d9890a;
  font-family: 'CookieRun', sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.28px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 54px;
  left: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid #d7d4cd;
  border-radius: 50%;
  background-color: #ffffff;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #3a7a2e;
    outline-offset: 2px;
  }
`;