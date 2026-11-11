import styled from 'styled-components';
import editIcon from '../../assets/icons/team-avatar-edit.svg';

interface MypageCharacterProps {
  character: { name: string; image: string };
  onEdit: () => void;
}

// 캐릭터를 보여주고, 클릭하면 전달받은 onEdit() 실행
export default function MypageCharacter({ character, onEdit }: MypageCharacterProps) {
  return (
    <Section aria-label="나의 캐릭터">
      <AvatarButton type="button" aria-label={`현재 캐릭터 ${character.name}, 캐릭터 변경`} onClick={onEdit}>
        <AvatarImage src={character.image} alt="" />
        <EditBadge aria-hidden="true"><img src={editIcon} alt="" /></EditBadge>
      </AvatarButton>
      <Caption>
        <Label>나의 캐릭터 <OptionalBadge>선택</OptionalBadge></Label>
        <HelpText>캐릭터를 눌러 바꿀 수 있어요.</HelpText>
      </Caption>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  line-height: normal;
`;

const AvatarButton = styled.button`
  position: relative;
  flex-shrink: 0;
  width: 78px;
  height: 78px;
  padding: 0;
  border: 0;
  border-radius: 36px;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 4px;
  }
`;

const AvatarImage = styled.img`
  display: block;
  box-sizing: border-box;
  width: 78px;
  height: 78px;
  border: 4px solid #ffffff;
  border-radius: 36px;
  object-fit: cover;
  box-shadow: 0 4px 0 var(--color-amber-shadow);
`;

const EditBadge = styled.span`
  position: absolute;
  top: 59px;
  left: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid #d7d4cd;
  border-radius: 50%;
  background: #ffffff;
`;

const Caption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
`;

const Label = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 700;
`;

const OptionalBadge = styled.span`
  padding: 1px 6px;
  border-radius: 999px;
  background: #f1f0ec;
  color: #5b5b5b;
  font-size: 12px;
  font-weight: 500;
`;

const HelpText = styled.p`
  margin: 0;
  color: #999896;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;