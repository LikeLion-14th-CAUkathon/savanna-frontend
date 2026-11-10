import { useState } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import FilterChip from '../common/FilterChip';
import ProfileSheet from './ProfileSheet';
import { regions } from './profileOptions';

interface RegionSelectSheetProps {
  selectedRegions: string[];                // 현재 확정된 지역
  onSelect: (regions: string[]) => void;     // 선택 확정
  onClose: () => void;                      // 변경 없이 닫기
}

// 현장 참석 가능 지역 선택 창
export default function RegionSelectSheet({ selectedRegions, onSelect, onClose }: RegionSelectSheetProps) {
  // 완료 버튼을 누르기 전까지 임시로 보관
  const [draftRegions, setDraftRegions] = useState(selectedRegions);

  // 이미 고른 지역은 해제, 아니면 추가
  const toggleRegion = (region: string) => {
    if (draftRegions.includes(region)) {
      setDraftRegions(draftRegions.filter((item) => item !== region));
    } else {
      setDraftRegions([...draftRegions, region]);
    }
  };

  return (
    <ProfileSheet title="지역 추가" onClose={onClose}>
      <Description>현장 행사에 참석할 수 있는 시·도를 모두 골라 주세요.</Description>
      <RegionList>
        {regions.map((region) => (
          <FilterChip key={region} selected={draftRegions.includes(region)} onClick={() => toggleRegion(region)}>
            {region}
          </FilterChip>
        ))}
      </RegionList>
      <ConfirmButton onClick={() => onSelect(draftRegions)}>
        {draftRegions.length}개 지역 선택 완료
      </ConfirmButton>
    </ProfileSheet>
  );
}

// 지역 선택 도움말
const Description = styled.p`
  color: #5b5b5b;
  font-size: 13px;
`;

// 지역 칩 자동 줄바꿈
const RegionList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 선택 지역 반영 버튼
const ConfirmButton = styled(Button)`
  width: 100%;
`;