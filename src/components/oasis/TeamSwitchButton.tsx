import styled, { css } from 'styled-components';

interface TeamSwitchButtonProps {
  teamName: string;
  onClick?: () => void; // 없으면 버튼이 아닌 팀 이름 표시로만 보여줌
}

// 팀 이름에서 첫 글자만 뽑기
const getInitial = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '?';

export default function TeamSwitchButton({ teamName, onClick }: TeamSwitchButtonProps) {
  const content = (
    <>
      <Avatar aria-hidden="true">{getInitial(teamName)}</Avatar>
      <Name>{teamName}</Name>
    </>
  );

  // 팀 전환 화면이 정해지기 전에는 누를 수 없는 표시로만 둠 (눌러도 아무 일 없는 버튼 방지)
  if (!onClick) return <TeamLabel>{content}</TeamLabel>;

  return (
    <SwitchButton type="button" aria-label={`${teamName}, 팀 전환`} onClick={onClick}>
      {content}
    </SwitchButton>
  );
}

const pillStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  max-width: 100%;
  padding: 6px 14px 6px 6px;
  border: 0;
  border-radius: 22px;
  background: rgba(255, 249, 236, 0.92);
  box-shadow: var(--shadow-float), 0 2px 0 var(--color-sand);
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  line-height: normal;
`;

const TeamLabel = styled.div`
  ${pillStyle}
`;

const SwitchButton = styled.button`
  ${pillStyle}
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

const Avatar = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--color-amber);
  color: var(--color-ink);
  font-size: 12px;
`;

const Name = styled.span`
  min-width: 0;
  overflow: hidden;
  color: var(--color-brown);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
