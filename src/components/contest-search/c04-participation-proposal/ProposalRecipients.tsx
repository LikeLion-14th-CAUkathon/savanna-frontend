import styled from 'styled-components';
import { characters } from '../../onboarding/profileOptions';
import type { ProposalMember } from '../../../types/proposal';

const MAX_AVATARS = 3;

// 프로필 캐릭터 뒤 원 배경 (시안의 mint · coral · peach 순서로 돌려 쓴다)
const AVATAR_BACKGROUNDS = ['#d6f0ef', '#ffe2d2', '#fff0cc'];

// 받는 사람: 겹친 프로필 캐릭터 + '팀원 전체 N명'
export default function ProposalRecipients({ members }: { members: ProposalMember[] }) {
  return (
    <Row>
      <Avatars aria-hidden="true">
        {members.slice(0, MAX_AVATARS).map((member, index) => {
          const character = characters.find((item) => item.id === member.characterId);
          return (
            <Avatar key={member.id} $background={AVATAR_BACKGROUNDS[index % AVATAR_BACKGROUNDS.length]}>
              {character && <img src={character.image} alt="" />}
            </Avatar>
          );
        })}
      </Avatars>
      <Label>팀원 전체 {members.length}명</Label>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatars = styled.div`
  display: flex;
`;

const Avatar = styled.span<{ $background: string }>`
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  overflow: hidden;
  border-radius: 12px;
  background: ${({ $background }) => $background};

  & + & {
    margin-left: -6px;
  }

  /* 시안의 Member Avatar처럼 캐릭터를 원보다 크게 놓고 아래쪽을 잘라낸다 */
  img {
    position: absolute;
    top: -1.39%;
    left: -15.97%;
    width: 131.94%;
    height: 131.95%;
    object-fit: cover;
  }
`;

const Label = styled.p`
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
`;
