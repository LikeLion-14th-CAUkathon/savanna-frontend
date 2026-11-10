import { useState } from 'react';
import styled from 'styled-components';
import StatusPill from './StatusPill';
import { Card } from './detailStyles';
import conditionMetIcon from '../../../assets/icons/expedition-detail/condition-met.svg';
import downIcon from '../../../assets/icons/collapse-toggle/collapse-down.svg';
import upIcon from '../../../assets/icons/collapse-toggle/collapse-up.svg';
import type { ConditionIssue } from '../../../types/expedition';

interface ConditionCheckProps {
  issues: ConditionIssue[]; // 불일치·확인 필요 항목 (없으면 모두 충족)
}

const ISSUE_LABEL = { MISMATCH: '불일치', NEEDS_CHECK: '확인 필요' } as const;

// 지원 조건 탭 · 참가 조건 확인 카드
export default function ConditionCheck({ issues }: ConditionCheckProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <MetRow>
          <img src={conditionMetIcon} alt="" />
          <MetText>확인한 참가 조건을 모두 충족해요.</MetText>
        </MetRow>
      </Card>
    );
  }

  return (
    <Card>
      <IssueList>
        {issues.map((issue) => (
          <IssueItem key={issue.id} issue={issue} />
        ))}
      </IssueList>
    </Card>
  );
}

function IssueItem({ issue }: { issue: ConditionIssue }) {
  const [isOpen, setIsOpen] = useState(false);
  const isMismatch = issue.type === 'MISMATCH';

  return (
    <Issue>
      <StatusPill tone={isMismatch ? 'red' : 'amber'}>{ISSUE_LABEL[issue.type]}</StatusPill>
      <IssueMessage>{issue.message}</IssueMessage>

      {issue.members.length > 0 && (
        <>
          <ToggleButton type="button" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '팀원 정보 접기' : '팀원 정보 확인'}
            <img src={isOpen ? upIcon : downIcon} alt="" />
          </ToggleButton>

          {isOpen && (
            <MemberList>
              {issue.members.map((member) => (
                <MemberRow key={member.name}>
                  <MemberName>{member.name}</MemberName> · {member.savedInfo}
                  <Verdict $mismatch={isMismatch}> — {member.verdict}</Verdict>
                </MemberRow>
              ))}
            </MemberList>
          )}
        </>
      )}
    </Issue>
  );
}

const MetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetText = styled.p`
  flex: 1;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 500;
`;

const IssueList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Issue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  & + & {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--color-gray-bg);
  }
`;

const IssueMessage = styled.p`
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-green-text);
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-green-text);
    outline-offset: 2px;
  }
`;

const MemberList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--color-bg);
  list-style: none;
`;

const MemberRow = styled.li`
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
`;

const MemberName = styled.span`
  color: var(--color-ink);
  font-weight: 700;
`;

const Verdict = styled.span<{ $mismatch: boolean }>`
  color: ${({ $mismatch }) => ($mismatch ? 'var(--color-error)' : 'var(--color-orange)')};
  font-weight: 500;
`;
