import { useState } from 'react';
import styled from 'styled-components';
import ProfileInfoForm from '../../components/common/ProfileInfoForm';
import CharacterSelectSheet from '../../components/onboarding/CharacterSelectSheet';
import RegionSelectSheet from '../../components/onboarding/RegionSelectSheet';
import { characters } from '../../components/onboarding/profileOptions';
import { MOCK_PROFILE } from '../../mocks/mypage';
import editIcon from '../../assets/icons/team-avatar-edit.svg';

export default function Mypage() {
  const [name, setName] = useState(MOCK_PROFILE.name);
  const [schoolStatus, setSchoolStatus] = useState(MOCK_PROFILE.schoolStatus);
  const [characterId, setCharacterId] = useState<string | null>(MOCK_PROFILE.characterId);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(MOCK_PROFILE.regions);
  const [openSheet, setOpenSheet] = useState<'character' | 'region' | null>(null);

  const character = characters.find((item) => item.id === characterId);

  const handleSelectCharacter = (id: string | null) => {
    setCharacterId(id);
    setOpenSheet(null);
  };

  const handleSelectRegions = (values: string[]) => {
    setSelectedRegions(values);
    setOpenSheet(null);
  };

  return (
    <Page>
      <Content>
        {character && (
          <CharacterSection aria-label="나의 캐릭터">
            <AvatarButton type="button" aria-label={`현재 캐릭터 ${character.name}, 캐릭터 변경`}
              onClick={() => setOpenSheet('character')}>
              <AvatarImage src={character.image} alt="" />
              <EditBadge aria-hidden="true"><img src={editIcon} alt="" /></EditBadge>
            </AvatarButton>
            <CharacterCaption>
              <CharacterLabel>나의 캐릭터 <OptionalBadge>선택</OptionalBadge></CharacterLabel>
              <CharacterHelp>캐릭터를 눌러 바꿀 수 있어요.</CharacterHelp>
            </CharacterCaption>
          </CharacterSection>
        )}

        <ProfileInfoForm
          name={name}
          schoolStatus={schoolStatus}
          selectedRegions={selectedRegions}
          onNameChange={setName}
          onSchoolStatusChange={setSchoolStatus}
          onRemoveRegion={(region) => setSelectedRegions((prev) => prev.filter((item) => item !== region))}
          onOpenRegionSelect={() => setOpenSheet('region')}
        />
      </Content>

      {openSheet === 'character' && (
        <CharacterSelectSheet selectedId={characterId} onClose={() => setOpenSheet(null)}
          onSelect={handleSelectCharacter} />
      )}
      {openSheet === 'region' && (
        <RegionSelectSheet selectedRegions={selectedRegions} onClose={() => setOpenSheet(null)}
          onSelect={handleSelectRegions} />
      )}
    </Page>
  );
}

// 모바일 화면 너비와 배경
const Page = styled.main`
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: var(--color-ink);
  line-height: normal;
`;

// 캐릭터와 공통 입력 폼 배치
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 26px;
`;

const CharacterSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
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

const CharacterCaption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
`;

const CharacterLabel = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
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

const CharacterHelp = styled.p`
  color: #999896;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;
