import styled from 'styled-components';
import { characters } from '../../onboarding/profileOptions';

export type AvatarTone = 'peach' | 'mint' | 'coral';

const AVATAR_COLORS: Record<AvatarTone, string> = {
  peach: '#fff0cc',
  mint: '#e9f4fb',
  coral: '#fbefe5',
};

interface MemberAvatarProps {
  characterId?: string; // onboarding/profileOptions의 캐릭터 id
  size: number;
  tone?: AvatarTone;
}

// 팀원은 항상 동물 캐릭터를 보여준다. 값이 없거나 모르는 id면 첫 번째 캐릭터로 대신한다.
export default function MemberAvatar({ characterId, size, tone = 'peach' }: MemberAvatarProps) {
  const image = (characters.find((character) => character.id === characterId) ?? characters[0]).image;

  return (
    <Circle $size={size} $tone={tone} aria-hidden="true">
      <img src={image} alt="" />
    </Circle>
  );
}

// 캐릭터 이미지(정사각형)에 원 배경 · 얼굴이 가운데로 들어 있어 원에 꼭 맞게 넣는다 (피그마 Member Avatar)
const Circle = styled.span<{ $size: number; $tone: AvatarTone }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  overflow: hidden;
  border-radius: 50%;
  background: ${({ $tone }) => AVATAR_COLORS[$tone]};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
