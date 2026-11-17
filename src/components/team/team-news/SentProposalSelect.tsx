import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { SentProposal } from '../../../types/teamNews';
import { formatMonthDay } from '../../../utils/date';
import chevronDownIcon from '../../../assets/icons/team/team-news/chevron-down.svg';

interface SentProposalSelectProps {
  proposals: SentProposal[];
  selectedId: number;
  onSelect: (proposalId: number) => void;
}

// B03 '내가 보낸 제안' 선택 버튼 + 목록. 바깥을 누르거나 Esc를 누르면 닫힌다.
export default function SentProposalSelect({ proposals, selectedId, onSelect }: SentProposalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const select = (proposalId: number) => {
    onSelect(proposalId);
    setIsOpen(false);
  };

  return (
    <Wrap ref={wrapRef}>
      <Trigger
        type="button"
        $open={isOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        내가 보낸 제안
        <Chevron src={chevronDownIcon} alt="" $open={isOpen} />
      </Trigger>

      {isOpen && (
        <Menu aria-label="보낸 제안 목록">
          {proposals.map((proposal) => {
            const isSelected = proposal.proposalId === selectedId;
            return (
              <li key={proposal.proposalId}>
                <Option
                  type="button"
                  $selected={isSelected}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => select(proposal.proposalId)}
                >
                  <OptionTexts>
                    <OptionTitle $selected={isSelected}>{proposal.announcementTitle}</OptionTitle>
                    <OptionDate>{formatMonthDay(proposal.createdAt)} 보냄</OptionDate>
                  </OptionTexts>
                  {isSelected && <Check aria-hidden="true">✓</Check>}
                </Option>
              </li>
            );
          })}
        </Menu>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Trigger = styled.button<{ $open: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px 6px 12px;
  border: 1.5px solid ${({ $open }) => ($open ? '#ffb72b' : '#e7e5e0')};
  border-radius: 999px;
  background: transparent;
  color: #5b5b5b;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: normal;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
  }
`;

// 16px 영역 가운데에 화살표. 열리면 위로 뒤집는다.
const Chevron = styled.img<{ $open: boolean }>`
  box-sizing: content-box;
  padding: 5.33px 3.33px;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'none')};
`;

const Menu = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  width: 260px;
  margin: 0;
  padding: 6px 0;
  overflow: hidden;
  border: 1px solid #e7e5e0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(90, 55, 15, 0.22);
  list-style: none;
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px 10px 16px;
  border: 0;
  background: ${({ $selected }) => ($selected ? '#fff6dd' : 'transparent')};
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: -2px;
  }
`;

const OptionTexts = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const OptionTitle = styled.span<{ $selected: boolean }>`
  overflow: hidden;
  color: ${({ $selected }) => ($selected ? '#d97700' : '#1e1e1e')};
  font-size: ${({ $selected }) => ($selected ? 14 : 15)}px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionDate = styled.span`
  color: #999896;
  font-size: 12px;
  font-weight: 400;
`;

const Check = styled.span`
  flex-shrink: 0;
  color: #d97700;
  font-size: 15px;
  font-weight: 700;
`;
