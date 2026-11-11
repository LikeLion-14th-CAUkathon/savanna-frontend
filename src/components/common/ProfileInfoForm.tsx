import styled from 'styled-components';
import Input from './Input';
import FilterChip from './FilterChip';
import removeIcon from '../../assets/icons/onboarding/region-remove.svg';
import downIcon from '../../assets/icons/onboarding/region-down.svg';

const SCHOOL_LIST = ['재학', '휴학', '졸업'];

interface ProfileInfoFormProps {
  name: string;
  nameError?: string;
  schoolStatus: string;
  selectedRegions: string[];
  onNameChange: (value: string) => void;
  onSchoolStatusChange: (value: string) => void;
  onRemoveRegion: (region: string) => void;
  onOpenRegionSelect: () => void;
}

// A02와 마이페이지에서 함께 쓰는 입력 UI. 값과 검증, 선택 창은 각 페이지에서 관리
export default function ProfileInfoForm({
  name,
  nameError,
  schoolStatus,
  selectedRegions,
  onNameChange,
  onSchoolStatusChange,
  onRemoveRegion,
  onOpenRegionSelect,
}: ProfileInfoFormProps) {
  return (
    <InfoSection aria-label="내 정보">
      <SectionTitle>내 정보</SectionTitle>
      <Field>
        <Input label="이름" mark="required" value={name} onChange={onNameChange}
          error={nameError} placeholder="이름을 입력해 주세요" />
        <HelpText>서비스에서 사용할 이름을 입력해 주세요. 예) [PM] 김지연</HelpText>
      </Field>

      <Field>
        <FieldTitle>학적 상태</FieldTitle>
        <SchoolOptions role="group" aria-label="학적 상태">
          {SCHOOL_LIST.map((status) => (
            <SchoolChip key={status} selected={schoolStatus === status} $active={schoolStatus === status}
              onClick={() => onSchoolStatusChange(status)}>{status}</SchoolChip>
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
              <RegionTag key={region} type="button" aria-label={`${region} 삭제`}
                onClick={() => onRemoveRegion(region)}>
                {region}<img src={removeIcon} alt="" />
              </RegionTag>
            ))}
          </SelectedRegions>
        )}
        <RegionButton type="button" aria-haspopup="dialog" onClick={onOpenRegionSelect}>
          지역 추가<img src={downIcon} alt="" />
        </RegionButton>
      </Field>
    </InfoSection>
  );
}

const InfoSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 0;
  color: var(--color-ink);
  line-height: normal;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
`;

const HelpText = styled.p`
  margin: 0;
  color: #999896;
  font-size: 12px;
  font-weight: 300;
`;

const SchoolOptions = styled.div`
  display: flex;
  gap: 8px;
`;

// 공통 칩 원본은 유지하고 학적 상태용 스타일만 확장
const SchoolChip = styled(FilterChip)<{ $active: boolean }>`
  flex: 1;
  min-width: 0;
  height: 44px;
  border: 2px solid ${({ $active }) => ($active ? 'var(--color-amber)' : '#e7e5e0')};
  background: ${({ $active }) => ($active ? '#fff6dd' : '#ffffff')};
  color: ${({ $active }) => ($active ? 'var(--color-orange)' : '#5b5b5b')};
  box-shadow: 0 3px 0 #d7d4cd;
  font-size: 14px;
`;

const RegionCaption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SelectedRegions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RegionTag = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 999px;
  background: #fff6dd;
  color: var(--color-orange);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;

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
  font-size: 15px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;
