import styled from 'styled-components';

interface TeamBadgeProps {
  teamName: string;
}

// 팀 이름에서 첫 글자만 뽑기
const getInitial = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '?';


export default function TeamBadge({ teamName }: TeamBadgeProps) {
  return (
    <Badge>
      <Avatar aria-hidden="true">{getInitial(teamName)}</Avatar>
      <Name>{teamName}</Name>
    </Badge>
  );
}

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  max-width: 100%;
  padding: 6px 14px 6px 6px;
  border-radius: 22px;
  background: rgba(255, 249, 236, 0.92);
  box-shadow: var(--shadow-float), 0 2px 0 var(--color-sand);
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  line-height: normal;
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
