import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import FilterChip from '../../components/common/FilterChip';
import Notice from '../../components/common/Notice';
import CharacterSelectSheet from '../../components/onboarding/CharacterSelectSheet';
import RegionSelectSheet from '../../components/onboarding/RegionSelectSheet';
import { characters } from '../../components/onboarding/profileOptions';
import infoIcon from '../../assets/icons/notice/info.svg';
import pawIcon from '../../assets/icons/onboarding/paw.svg';
import plusIcon from '../../assets/icons/onboarding/plus.svg';
import removeIcon from '../../assets/icons/onboarding/region-remove.svg';
import downIcon from '../../assets/icons/onboarding/region-down.svg';

const SCHOOL_LIST = ['재학', '휴학', '졸업'];

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

        <SectionTitle>내 정보</SectionTitle>

        <Field>
          <Input label="이름" mark="required" value={name} onChange={setName}
            placeholder="이름을 입력해 주세요" error={nameError} />
          <HelpText>서비스에서 사용할 이름을 입력해 주세요. 예) [PM] 김지연</HelpText>
        </Field>

        <Field>
          <FieldTitle>학적 상태</FieldTitle>
          <SchoolOptions>
            {SCHOOL_LIST.map((status) => (
              <SchoolChip key={status} selected={schoolStatus === status} $active={schoolStatus === status}
                onClick={() => setSchoolStatus(status)}>{status}</SchoolChip>
            ))}
          </SchoolOptions>
        </Field>

        <Field>
          <RegionCaption>
            <FieldTitle>현장 참석 가능 지역</FieldTitle>
            <HelpText>현장 행사에 참석할 수 있는 지역을 추가해 주세요. 거주지를 묻는 항목은 아니에요.</HelpText>
          </RegionCaption>
          {selectedRegions.length > 0 && (
            <SelectedRegions>
              {selectedRegions.map((region) => (
                <RegionTag key={region} aria-label={`${region} 삭제`}
                  onClick={() => setSelectedRegions(selectedRegions.filter((item) => item !== region))}>
                  {region}<img src={removeIcon} alt="" />
                </RegionTag>
              ))}
            </SelectedRegions>
          )}
          <RegionButton onClick={() => setOpenSheet('region')}>
            지역 추가<img src={downIcon} alt="" />
          </RegionButton>
        </Field>

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

// 내 정보 구역 제목
const SectionTitle = styled.h2`
  margin: 0;
  letter-spacing: 0;
  font-size: 17px;
  font-weight: 700;
`;

// 제목 + 입력칸을 세로로 묶는 한 항목
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 항목 제목
const FieldTitle = styled.h3`
  margin: 0;
  letter-spacing: 0;
  font-size: 14px;
  font-weight: 700;
`;

// 입력 항목 도움말
const HelpText = styled.p`
  color: #999896;
  font-size: 12px;
  font-weight: 300;
`;

// 학적 상태 버튼 배치
const SchoolOptions = styled.div`
  display: flex;
  gap: 8px;
`;

// 공통 칩에 학적 상태용 크기와 색 적용
const SchoolChip = styled(FilterChip)<{ $active: boolean }>`
  flex: 1;
  height: 44px;
  border: 2px solid ${({ $active }) => ($active ? '#ffb72b' : '#e7e5e0')};
  background: ${({ $active }) => ($active ? '#fff6dd' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#d97700' : '#5b5b5b')};
  box-shadow: 0 3px 0 #d7d4cd;
  font-size: 14px;
`;

// 지역 제목과 도움말
const RegionCaption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 선택 지역 태그 배치
const SelectedRegions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 누르면 삭제되는 지역 태그
const RegionTag = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 999px;
  background: #fff6dd;
  color: #d97700;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

// 지역 선택 창 열기
const RegionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1.5px solid #e7e5e0;
  border-radius: 12px;
  background: #ffffff;
  color: #999896;
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
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