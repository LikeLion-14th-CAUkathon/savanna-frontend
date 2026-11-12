import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '../../common/Button';
import Icon from '../Icon';
import ProposalRecipients from './ProposalRecipients';
import { fetchProposalTeam, sendProposal } from '../../../mocks/proposal';
import { PROPOSAL_MESSAGE_MAX, type ProposalTeam } from '../../../types/proposal';
import type { ContestDetail } from '../../../types/contest';
import { formatDDay } from '../../../utils/dday';
import { formatDateTime } from '../../../utils/date';
import closeIcon from '../../../assets/icons/contest-search/close.svg';

type TeamState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; team: ProposalTeam };

interface ProposalSheetProps {
  contest: Pick<ContestDetail, 'id' | 'title' | 'deadlineAt'>;
  today: Date;
  onClose: () => void;     // 닫기 · 바깥 영역 · Esc
  onSent: () => void;      // 전송 성공
  onSendError: () => void; // 전송 실패 (시트는 열어 둔다)
}

// C04 공고 참여 제안 바텀시트. 부모가 열 때만 렌더링한다.
export default function ProposalSheet({ contest, today, onClose, onSent, onSendError }: ProposalSheetProps) {
  const [teamState, setTeamState] = useState<TeamState>({ status: 'loading' });
  const [message, setMessage] = useState('');
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const titleId = useId();
  const messageId = useId();
  const helperId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  // 팀 정보(프로젝트 · 받는 사람)를 불러온다.
  useEffect(() => {
    let ignore = false;
    fetchProposalTeam()
      .then((team) => {
        if (!ignore) setTeamState({ status: 'success', team });
      })
      .catch(() => {
        if (!ignore) setTeamState({ status: 'error' });
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 열리면 시트로 포커스를 옮기고, Esc로 닫을 수 있게 한다.
  useEffect(() => {
    sheetRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const team = teamState.status === 'success' ? teamState.team : null;
  const hasRecipients = !!team && team.members.length > 0;
  const hasEmptyError = showEmptyError && message.trim() === '';

  const handleChange = (value: string) => {
    setMessage(value);
    if (value.trim() !== '') setShowEmptyError(false);
  };

  const handleSubmit = () => {
    if (message.trim() === '') {
      setShowEmptyError(true);
      return;
    }
    setIsSending(true);
    sendProposal(contest.id, message.trim())
      .then(onSent)
      .catch(() => {
        setIsSending(false);
        onSendError();
      });
  };

  return (
    <>
      <Scrim onClick={onClose} aria-hidden="true" />
      <Sheet ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <Handle aria-hidden="true" />

        <TitleRow>
          <Title id={titleId}>참여 제안</Title>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            <Icon src={closeIcon} size={22} />
          </CloseButton>
        </TitleRow>

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
              {teamState.status === 'error' && (
                <ValueText $danger>팀원 정보를 불러오지 못했어요.</ValueText>
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
          <MessageLabel htmlFor={messageId}>제안 문구</MessageLabel>
          <MessageBox
            id={messageId}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="이 공고를 함께하고 싶은 이유를 적어 주세요."
            maxLength={PROPOSAL_MESSAGE_MAX}
            aria-invalid={hasEmptyError}
            aria-describedby={helperId}
            $hasError={hasEmptyError}
          />
          <Helper>
            <HelperText id={helperId} $danger={hasEmptyError} role={hasEmptyError ? 'alert' : undefined}>
              {hasEmptyError ? '팀원에게 보낼 제안 내용을 입력해 주세요.' : '팀 소식에 그대로 보여요.'}
            </HelperText>
            <HelperText aria-hidden="true">
              {message.length} / {PROPOSAL_MESSAGE_MAX}
            </HelperText>
          </Helper>
        </MessageField>

        <SendButton disabled={!hasRecipients || isSending} onClick={handleSubmit}>
          제안 보내기
        </SendButton>
      </Sheet>
    </>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(30, 30, 30, 0.45);
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  max-height: 90svh;
  overflow-y: auto;
  padding: 12px 24px 34px;
  border-radius: 24px 24px 0 0;
  background: #fafaf8;
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
  transform: translateX(-50%);
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
  outline: none;
`;

const Handle = styled.div`
  flex-shrink: 0;
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #d7d4cd;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: #1e1e1e;
  font-size: 17px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: -2px;
    border-radius: 8px;
  }
`;

const InfoList = styled.dl`
  display: flex;
  flex-direction: column;
  margin: 0;
  border-top: 1px solid #e7e5e0;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #e7e5e0;
`;

const InfoLabel = styled.dt`
  flex-shrink: 0;
  width: 64px;
  color: #999896;
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
  color: ${({ $danger }) => ($danger ? '#b3261e' : '#1e1e1e')};
  font-size: 15px;
  font-weight: 500;
  word-break: keep-all;
`;

const SubText = styled.p`
  color: #999896;
  font-size: 12px;
  font-weight: 400;
`;

const MessageField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageLabel = styled.label`
  color: #1e1e1e;
  font-size: 14px;
  font-weight: 700;
`;

// 공통 Input과 모양은 같지만, 오류 문구 대신 아래 helper 줄에 안내와 글자 수를 함께 보여준다.
const MessageBox = styled.textarea<{ $hasError: boolean }>`
  box-sizing: border-box;
  width: 100%;
  height: 112px;
  padding: 12px 16px;
  border: ${({ $hasError }) => ($hasError ? '2px solid #b3261e' : '1.5px solid #e7e5e0')};
  border-radius: 12px;
  background: #ffffff;
  color: #1e1e1e;
  font-family: inherit;
  font-size: 15px;
  line-height: normal;
  resize: none;

  &::placeholder {
    color: #999896;
  }

  &:focus {
    outline: none;
    border: 2px solid ${({ $hasError }) => ($hasError ? '#b3261e' : '#ffb72b')};
  }
`;

const Helper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const HelperText = styled.p<{ $danger?: boolean }>`
  color: ${({ $danger }) => ($danger ? '#b3261e' : '#999896')};
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
`;

// 공통 Button에는 비활성 모양이 없어서 여기서만 덧입힌다. (C03 하단 버튼과 동일)
const SendButton = styled(Button)`
  flex-shrink: 0;
  width: 100%;

  &:disabled {
    background: #efeeea;
    box-shadow: none;
    color: #c4c3c0;
    cursor: not-allowed;
  }
`;
