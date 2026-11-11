import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import ProfileInfoForm from '../../components/common/ProfileInfoForm';
import Notice from '../../components/common/Notice';
import CharacterSelectSheet from '../../components/onboarding/CharacterSelectSheet';
import RegionSelectSheet from '../../components/onboarding/RegionSelectSheet';
import { characters } from '../../components/onboarding/profileOptions';
import infoIcon from '../../assets/icons/notice/info.svg';
import pawIcon from '../../assets/icons/onboarding/paw.svg';
import plusIcon from '../../assets/icons/onboarding/plus.svg';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // 시작하기를 눌렀는지
  const [schoolStatus, setSchoolStatus] = useState('재학');
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [openSheet, setOpenSheet] = useState<'character' | 'region' | null>(null);

  // 선택한 캐릭터와 이름 에러 문구
  const character = characters.find((item) => item.id === characterId);
  const nameError = isSubmitted && !name.trim() ? '이름을 입력해 주세요.' : undefined;

  // 캐릭터 창에서 선택하기를 눌렀을 때
  const handleSelectCharacter = (id: string | null) => {
    setCharacterId(id);
    setOpenSheet(null);
  };

  // 지역 창에서 선택 완료를 눌렀을 때
  const handleSelectRegions = (values: string[]) => {
    setSelectedRegions(values);
    setOpenSheet(null);
  };

  // 시작하기: 이름 확인 후, 캐릭터를 안 골랐으면 자동으로 선택
  const handleStart = () => {
    setIsSubmitted(true);
    if (!name.trim()) return; // 이름이 비어 있으면 여기서 멈춤

    if (!characterId) {
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
      setCharacterId(randomCharacter.id);
    }
    // API 연결 후 정보 저장하고 다음 화면으로 이동
  };

  return (
    <Page>
      <AppBar title="내 정보 입력" onBack={() => navigate('/login')} />
      <Content>
        <CharacterSection>
          <AvatarButton aria-label="나의 캐릭터 선택" onClick={() => setOpenSheet('character')}>
            {character ? <AvatarImage src={character.image} alt={character.name} /> : <img src={pawIcon} alt="" />}
            <AddBadge><img src={plusIcon} alt="" /></AddBadge>
          </AvatarButton>
          <CharacterCaption>
            <CharacterLabel>나의 캐릭터 <OptionalBadge>선택</OptionalBadge></CharacterLabel>
            <CharacterHelp>고르지 않으면 자동으로 동물 캐릭터가 선택돼요.</CharacterHelp>
          </CharacterCaption>
        </CharacterSection>

        <ProfileInfoForm
          name={name}
          nameError={nameError}
          schoolStatus={schoolStatus}
          selectedRegions={selectedRegions}
          onNameChange={setName}
          onSchoolStatusChange={setSchoolStatus}
          onRemoveRegion={(region) => setSelectedRegions((prev) => prev.filter((item) => item !== region))}
          onOpenRegionSelect={() => setOpenSheet('region')}
        />

        <Notice icon={infoIcon}>입력하지 않은 자격 정보는 공고 조건 확인 시 ‘확인 필요’로 표시돼요.</Notice>
      </Content>

      <Footer><StartButton onClick={handleStart}>시작하기</StartButton></Footer>

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

// 상태바 공간을 포함한 모바일 화면
const Page = styled.main`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  padding-top: 58px;
  background: #fafaf8;
  color: #1e1e1e;
  line-height: normal;
`;

// 입력 항목 배치
const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 26px;
`;

// 캐릭터 선택과 안내
const CharacterSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

// 프로필 이미지 선택 버튼
const AvatarButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  padding: 0;
  border: 2px dashed #e7e5e0;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
`;

// 선택한 프로필 이미지
const AvatarImage = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
`;

// 프로필 우측 하단 + 표시
const AddBadge = styled.span`
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid #fafaf8;
  border-radius: 50%;
  background: #ffb72b;
`;

// 캐릭터 안내 문구 묶음
const CharacterCaption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
`;

// 캐릭터 라벨
const CharacterLabel = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
`;

// 선택 입력 배지
const OptionalBadge = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff6dd;
  color: #d97700;
  font-size: 12px;
  font-weight: 700;
`;

// 캐릭터 자동 선택 도움말
const CharacterHelp = styled.p`
  color: #5b5b5b;
  font-size: 12px;
  font-weight: 300;
  text-align: center;
`;

// 하단 시작하기 영역
const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

// 시작하기 버튼
const StartButton = styled(Button)`
  width: 100%;
`;