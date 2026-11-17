import styled from 'styled-components';
import StageProgress from './StageProgress';
import NoticeList from './NoticeList';
import type { ExpeditionStage } from '../../../types/oasis';
import type { ExpeditionNotice, StageTarget } from '../../../types/expedition';

interface TeamPrepCardProps {
  currentStage: ExpeditionStage;
  targets: StageTarget[];
  notices: ExpeditionNotice[];
  onChangeStage: () => void;
}

// 일정·제출 준비 탭 · 팀 준비 카드 (팀 준비 일정 · 목표일 + 공지, Figma 「팀 준비 카드」)
export default function TeamPrepCard({ currentStage, targets, notices, onChangeStage }: TeamPrepCardProps) {
  return (
    <Card>
      <Header>
        <Title>팀 준비 일정 · 목표일</Title>
        <ChangeStageButton type="button" onClick={onChangeStage}>
          단계 변경
        </ChangeStageButton>
      </Header>

      <StageProgress currentStage={currentStage} targets={targets} />

      <Divider />

      <NoticeBlock>
        <Title>공지</Title>
        <NoticeList notices={notices} />
      </NoticeBlock>
    </Card>
  );
}

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding: 18px 18px 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  background: #ffffff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
  line-height: normal;
`;

const ChangeStageButton = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-brand);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: normal;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: var(--color-gray-bg);
`;

const NoticeBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
