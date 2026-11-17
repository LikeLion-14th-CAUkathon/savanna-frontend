import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import Button from '../../common/Button';
import linkIcon from '../../../assets/icons/team/team-space/link.svg';

interface InviteLinkJoinFormProps {
  onJoin: (link: string) => void; // 붙여 넣은 초대 링크(앞뒤 공백 제거)
}

// B02-3 소속 팀 없음의 초대 링크 입력. B02 초대 링크 카드와 같은 모양에 입력창을 둔다.
// 링크를 넣기 전에는 '합류' 버튼을 회색(비활성)으로 둔다.
export default function InviteLinkJoinForm({ onJoin }: InviteLinkJoinFormProps) {
  const [link, setLink] = useState('');
  const trimmed = link.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed) onJoin(trimmed);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Icon src={linkIcon} alt="" />
      <LinkInput
        type="text" // url이면 토큰만 붙여 넣었을 때 브라우저가 제출을 막는다
        inputMode="url"
        value={link}
        onChange={(event) => setLink(event.target.value)}
        placeholder="초대 링크 붙여 넣기"
        aria-label="초대 링크"
        autoComplete="off"
      />
      <JoinButton type="submit" disabled={!trimmed}>
        합류
      </JoinButton>
    </Form>
  );
}

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px 10px 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #d7d4cd;

  &:focus-within {
    border-color: var(--color-orange);
  }
`;

// 18px 칸 안에 아이콘을 가운데 둔다.
const Icon = styled.img`
  flex-shrink: 0;
  margin: 0 2.34px;
`;

const LinkInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 700;

  &::placeholder {
    color: #999896;
  }
`;

// 공통 Button(L 52)을 S 크기(32)로 줄여 쓴다.
const JoinButton = styled(Button)`
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
`;
