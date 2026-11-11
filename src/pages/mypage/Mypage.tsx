import { useCallback, useState } from 'react';
import styled from 'styled-components';
import Button from '../../components/common/Button';
import TabBar from '../../components/layout/TabBar';
import Toast from '../../components/toast/Toast';
import ProfileInfoForm from '../../components/common/ProfileInfoForm';
import CharacterSelectSheet from '../../components/onboarding/CharacterSelectSheet';
import RegionSelectSheet from '../../components/onboarding/RegionSelectSheet';
import { characters } from '../../components/onboarding/profileOptions';
import { MOCK_PROFILE } from '../../mocks/mypage';
import editIcon from '../../assets/icons/team-avatar-edit.svg';

const TOAST_MESSAGES = {
  'save-success': { variant: 'success', message: '내 정보를 저장했어요.' },
  'save-error': { variant: 'error', message: '내 정보를 저장하지 못했어요. 다시 시도해 주세요.' },
  'logout-error': { variant: 'error', message: '로그아웃하지 못했어요. 다시 시도해 주세요.' },
} as const;

type ToastType = keyof typeof TOAST_MESSAGES;

// 개발 서버에서 /mypage?toast=save-success (save-error, logout-error)로 배치 확인
function getPreviewToast(): ToastType | null {
  if (!import.meta.env.DEV) return null;
  const preview = new URLSearchParams(window.location.search).get('toast');
  if (preview === 'save-success' || preview === 'save-error' || preview === 'logout-error') return preview;
  return null;
}

export default function Mypage() {
  const [name, setName] = useState(MOCK_PROFILE.name);
  const [schoolStatus, setSchoolStatus] = useState(MOCK_PROFILE.schoolStatus);
  const [characterId, setCharacterId] = useState<string | null>(MOCK_PROFILE.characterId);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(MOCK_PROFILE.regions);
  const [openSheet, setOpenSheet] = useState<'character' | 'region' | null>(null);
  const [toastType, setToastType] = useState<ToastType | null>(getPreviewToast);
  const handleCloseToast = useCallback(() => setToastType(null), []);
  const toast = toastType ? TOAST_MESSAGES[toastType] : null;

  const character = characters.find((item) => item.id === characterId);

  const handleSelectCharacter = (id: string | null) => {
    setCharacterId(id);
    setOpenSheet(null);
  };

  const handleSelectRegions = (values: string[]) => {
    setSelectedRegions(values);
    setOpenSheet(null);
  };

  const handleSave = () => {
    // 이름 검사와 저장 결과 토스트 연결
  };

  const handleLogout = () => {
    // 로그아웃 API 연동 전에는 테스트 상태에서만 토스트 확인
  };

  return (
    <Page>
      <Header><h1>마이페이지</h1></Header>
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
        <SaveButton onClick={handleSave}>저장</SaveButton>
        <LogoutArea>
          <LogoutButton type="button" onClick={handleLogout}>로그아웃</LogoutButton>
        </LogoutArea>
      </Content>

      <BottomBar>
        <TabBar activeTab="mypage" onTabChange={() => {}} />
      </BottomBar>

      {toast && (
        <ToastArea>
          <Toast variant={toast.variant} onClose={handleCloseToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}

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

// 탭바 75px 위에 16px 간격으로 고정. 선택 창(z-index: 100)보다 아래에 배치
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(75px + 16px);
  left: 50%;
  z-index: 20;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;

// 모바일 화면 너비와 배경
const Page = styled.main`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  padding-bottom: 75px;
  background: var(--color-bg);
  color: var(--color-ink);
  line-height: normal;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 24px;

  h1 {
    font-size: 22px;
    font-weight: 700;
  }
`;

// 캐릭터와 공통 입력 폼 배치
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 26px;
`;

const SaveButton = styled(Button)`
  width: 100%;
`;

const LogoutArea = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4px;
  border-top: 1px solid var(--color-border);
`;

const LogoutButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

// 스크롤해도 화면 하단에 유지하고 선택 창보다 아래에 배치
const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 10;
  width: 402px;
  max-width: 100%;
  transform: translateX(-50%);
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
  background: var(--color-gray-bg);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
`;

const CharacterHelp = styled.p`
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;