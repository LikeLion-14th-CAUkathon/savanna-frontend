import { useEffect, useState } from 'react';
import styled from 'styled-components';
import BottomSheet from '../../common/BottomSheet';
import Button from '../../common/Button';
import Input from '../../common/Input';
import ProposalRecipients from './ProposalRecipients';
import {
  fetchProposalTeam,
  getSendProposalError,
  sendProposal,
  type SendProposalError,
} from '../proposalData';
import { PROPOSAL_MESSAGE_MAX, type ProposalTeam } from '../../../types/proposal';
import type { ContestDetail } from '../../../types/contest';
import { formatDDay } from '../../../utils/dday';
import { formatDateTime } from '../../../utils/date';

type TeamState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'no-team' }
  | { status: 'success'; team: ProposalTeam };

interface ProposalSheetProps {
  contest: Pick<ContestDetail, 'id' | 'title' | 'deadlineAt'>;
  today: Date;
  onClose: () => void;     // 닫기 · 바깥 영역 · Esc
  onSent: () => void;      // 전송 성공
  onSendError: (reason: SendProposalError) => void; // 전송 실패 (시트는 열어 둔다)
}

// C04 공고 참여 제안 바텀시트. 부모가 열 때만 렌더링한다.
export default function ProposalSheet({ contest, today, onClose, onSent, onSendError }: ProposalSheetProps) {
  const [teamState, setTeamState] = useState<TeamState>({ status: 'loading' });
  const [message, setMessage] = useState('');
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 내 팀 정보(프로젝트 · 받는 사람)를 불러온다.
  useEffect(() => {
    let ignore = false;
    fetchProposalTeam()
      .then((team) => {
        if (ignore) return;
        setTeamState(team ? { status: 'success', team } : { status: 'no-team' });
      })
      .catch(() => {
        if (!ignore) setTeamState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, []);

  const team = teamState.status === 'success' ? teamState.team : null;
  const hasRecipients = !!team && team.members.length > 0;
  const hasEmptyError = showEmptyError && message.trim() === '';

  const handleChange = (value: string) => {
    setMessage(value);
    if (value.trim() !== '') setShowEmptyError(false);
  };

  const handleSubmit = () => {
    if (!team) return;
    if (message.trim() === '') {
      setShowEmptyError(true);
      return;
    }
    setIsSending(true);
    sendProposal(contest.id, team.teamId, message.trim())
      .then(onSent)
      .catch((error: unknown) => {
        setIsSending(false);
        onSendError(getSendProposalError(error));
      });
  };

  return (
    <BottomSheet title="참여 제안" onClose={onClose}>
      <InfoList>
        <InfoRow>
          <InfoLabel>공고</InfoLabel>
          <InfoValue>
            <ValueText>{contest.title}</ValueText>
            <SubText>
              {formatDDay(contest.deadlineAt, today)} · 마감 {formatDateTime(contest.deadlineAt)}
            </SubText>
          </InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>프로젝트</InfoLabel>
          <InfoValue>
            <ValueText>{team ? team.projectName : '-'}</ValueText>
          </InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>받는 사람</InfoLabel>
          <InfoValue>
            {teamState.status === 'loading' && <SubText>팀원 정보를 불러오는 중이에요.</SubText>}
            {teamState.status === 'error' && <ValueText $danger>팀원 정보를 불러오지 못했어요.</ValueText>}
            {teamState.status === 'no-team' && (
              <>
                <ValueText $danger>아직 소속된 팀이 없어요.</ValueText>
                <SubText>팀을 만들거나 초대 링크로 팀에 들어가 주세요.</SubText>
              </>
            )}
            {team && hasRecipients && <ProposalRecipients members={team.members} />}
            {team && !hasRecipients && (
              <>
                <ValueText $danger>제안을 받을 팀원이 없어요.</ValueText>
                <SubText>초대 링크로 팀원을 먼저 모아 주세요.</SubText>
              </>
            )}
          </InfoValue>
        </InfoRow>
      </InfoList>

      <MessageField>
        <Input
          label="제안 문구"
          value={message}
          onChange={handleChange}
          placeholder="이 공고를 함께하고 싶은 이유를 적어 주세요."
          multiline
          maxLength={PROPOSAL_MESSAGE_MAX}
          error={hasEmptyError ? '팀원에게 보낼 제안 내용을 입력해 주세요.' : undefined}
        />
        {/* 오류일 때는 Input이 오류 문구를 보여주므로 안내 문구는 숨기고 글자 수만 남긴다. */}
        <Helper>
          {!hasEmptyError && <HelperText>팀 소식에 그대로 보여요.</HelperText>}
          <HelperText aria-hidden="true">
            {message.length} / {PROPOSAL_MESSAGE_MAX}
          </HelperText>
        </Helper>
      </MessageField>

      <SendButton disabled={!hasRecipients || isSending} onClick={handleSubmit}>
        제안 보내기
      </SendButton>
    </BottomSheet>
  );
}

const InfoList = styled.dl`
  display: flex;
  flex-direction: column;
  margin: 0;
  border-top: 1px solid var(--color-border);
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
`;

const InfoLabel = styled.dt`
  flex-shrink: 0;
  width: 64px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-weight: 500;
`;

const InfoValue = styled.dd`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  margin: 0;
`;

const ValueText = styled.p<{ $danger?: boolean }>`
  margin: 0;
  color: ${({ $danger }) => ($danger ? 'var(--color-error)' : 'var(--color-ink)')};
  font-size: 15px;
  font-weight: 500;
  word-break: keep-all;
`;

const SubText = styled.p`
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 400;
`;

const MessageField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Helper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const HelperText = styled.p`
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;

  /* 안내 문구가 없을 때도 글자 수는 오른쪽에 둔다 */
  &:last-child {
    margin-left: auto;
  }
`;

const SendButton = styled(Button)`
  flex-shrink: 0;
  width: 100%;
`;
