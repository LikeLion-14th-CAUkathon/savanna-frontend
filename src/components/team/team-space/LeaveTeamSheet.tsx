import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import Button from '../../common/Button';

interface LeaveTeamSheetProps {
  teamName: string;
  isLeaving: boolean;    // 요청 중에는 '팀 나가기'를 막아 중복 요청을 막는다
  onClose: () => void;   // 취소 · 바깥 영역 · Esc · 아래로 끌기
  onConfirm: () => void; // 팀 나가기
}

// B02-2 팀 나가기 확인 시트. 제목 · 안내는 가운데 정렬, 닫기(X) 없이 취소 버튼으로 닫는다.
export default function LeaveTeamSheet({ teamName, isLeaving, onClose, onConfirm }: LeaveTeamSheetProps) {
  const title = `${teamName}에서 나갈까요?`;

  return (
    <BottomSheet ariaLabel={title} onClose={onClose}>
      <Body>
        <Title>{title}</Title>
        <Description>팀에서 나가면 이 팀의 공간과 원정을 볼 수 없어요.</Description>
        <Actions>
          <ActionButton variant="secondary" onClick={onClose}>
            취소
          </ActionButton>
          <ActionButton disabled={isLeaving} onClick={onConfirm}>
            팀 나가기
          </ActionButton>
        </Actions>
      </Body>
    </BottomSheet>
  );
}

// 손잡이 아래 28px (시트가 12px을 두므로 16px 더)
const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  color: #1e1e1e;
  font-size: 20px;
  font-weight: 700;
  overflow-wrap: anywhere;
`;

const Description = styled.p`
  margin: 8px 0 0;
  color: #5b5b5b;
  font-size: 15px;
  font-weight: 400;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 28px;
`;

const ActionButton = styled(Button)`
  flex: 1;
  min-width: 0;
`;
