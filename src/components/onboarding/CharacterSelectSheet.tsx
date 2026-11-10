import { useState } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import ProfileSheet from './ProfileSheet';
import { characters } from './profileOptions';

interface CharacterSelectSheetProps {
  selectedId: string | null;              // 현재 확정된 캐릭터
  onSelect: (id: string | null) => void;   // 선택 확정
  onClose: () => void;                    // 변경 없이 닫기
}

// 캐릭터 선택 창
export default function CharacterSelectSheet({ selectedId, onSelect, onClose }: CharacterSelectSheetProps) {
  // 선택하기를 누르기 전까지 임시로 보관
  const [draftId, setDraftId] = useState(selectedId);

  return (
    <ProfileSheet title="나의 캐릭터 선택" onClose={onClose}>
      <Grid>
        {characters.map((character) => (
          <CharacterButton
            key={character.id}
            $selected={draftId === character.id}
            onClick={() => setDraftId(character.id)}
          >
            <CharacterImage src={character.image} alt="" />
            {character.name}
          </CharacterButton>
        ))}
      </Grid>
      <Actions>
        <CloseButton variant="secondary" onClick={onClose}>닫기</CloseButton>
        <SelectButton disabled={draftId === null} onClick={() => onSelect(draftId)}>선택하기</SelectButton>
      </Actions>
    </ProfileSheet>
  );
}

// 캐릭터 3열 배치
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

// 선택한 캐릭터만 노란 테두리로 표시
const CharacterButton = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 12px;
  border: 1px solid ${({ $selected }) => ($selected ? '#ffb72b' : '#e7e5e0')};
  border-radius: 16px;
  background: ${({ $selected }) => ($selected ? '#fff6dd' : '#ffffff')};
  color: ${({ $selected }) => ($selected ? '#1e1e1e' : '#5b5b5b')};
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;

// 캐릭터 이미지
const CharacterImage = styled.img`
  width: 72px;
  border-radius: 50%;
`;

// 하단 버튼 묶음
const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

// 닫기 버튼 너비
const CloseButton = styled(Button)`
  width: 112px;
`;

// 남은 너비를 채우는 선택 버튼
const SelectButton = styled(Button)`
  flex: 1;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;