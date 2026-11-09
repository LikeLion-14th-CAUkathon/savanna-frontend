import styled from 'styled-components'

type MemberTileProps = {
  name: string
  isMe?: boolean
  tone?: 'peach' | 'mint' | 'coral'
}

const avatarColors = {
  peach: '#fff0cc',
  mint: '#e9f4fb',
  coral: '#fbefe5',
}

export default function MemberTile({ name, isMe = false, tone = 'peach' }: MemberTileProps) {
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?'

  return (
    <Tile $isMe={isMe}>
      <Avatar $tone={tone} aria-hidden="true">{initial}</Avatar>
      <Name>{name}</Name>
      <Badge $isMe={isMe}>{isMe ? '나' : '팀원'}</Badge>
    </Tile>
  )
}

const Tile = styled.div<{ $isMe: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 111.333px;
  flex-shrink: 0;
  padding: 16px 8px 12px;
  border: 2px solid ${({ $isMe }) => $isMe ? '#ffb72b' : '#e7e5e0'};
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 3px 0 #d7d4cd;
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
  text-align: center;
`

const Avatar = styled.div<{ $tone: MemberTileProps['tone'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ $tone = 'peach' }) => avatarColors[$tone]};
  color: #3a7a2e;
  font-size: 15px;
`

const Name = styled.p`
  max-width: 100%;
  margin: 0;
  color: #1e1e1e;
  font-size: 13px;
  overflow-wrap: anywhere;
`

const Badge = styled.span<{ $isMe: boolean }>`
  padding: 1px 8px;
  border-radius: 999px;
  background-color: ${({ $isMe }) => $isMe ? '#fff6dd' : '#f1f0ec'};
  color: ${({ $isMe }) => $isMe ? '#d97700' : '#5b5b5b'};
  font-size: 11px;
`
