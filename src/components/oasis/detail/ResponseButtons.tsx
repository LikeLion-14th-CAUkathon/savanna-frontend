import styled from 'styled-components';
import Button from '../../common/Button';

// 아직 응답 안 함(제안 뒤에 합류한 팀원 포함) → 두 버튼 / 쉬어가는 중 → '합류하기'만
export type RespondableStatus = 'PENDING' | 'NONE' | 'RESTING';

interface ResponseButtonsProps {
  status: RespondableStatus;
  isSaving: boolean;
  onRespond: (joined: boolean) => void;
}

// 지원 조건 탭 · 제안과 응답 현황 아래 응답 버튼 (Figma 「응답 버튼」)
export default function ResponseButtons({ status, isSaving, onRespond }: ResponseButtonsProps) {
  if (status === 'RESTING') {
    return (
      <Row>
        <JoinOnlyButton disabled={isSaving} onClick={() => onRespond(true)}>
          합류하기
        </JoinOnlyButton>
      </Row>
    );
  }

  return (
    <Row>
      <ResponseButton variant="secondary" disabled={isSaving} onClick={() => onRespond(false)}>
        이번엔 쉬어가기
      </ResponseButton>
      <ResponseButton disabled={isSaving} onClick={() => onRespond(true)}>
        합류하기
      </ResponseButton>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
`;

// Button M 크기 (높이 44 · 패딩 16 · 글자 14)
const ResponseButton = styled(Button)`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
`;

const JoinOnlyButton = styled(ResponseButton)`
  flex: 0 0 165px;
`;
