import styled, { css } from 'styled-components';
import pondSignImage from '../../assets/images/oasis/pond-sign.webp';
import pondSignGrayImage from '../../assets/images/oasis/pond-sign-gray.webp';
import progressDot from '../../assets/icons/oasis/progress-dot.svg';
import progressDotGray from '../../assets/icons/oasis/progress-dot-gray.svg';

interface ExpeditionSignProps {
  left: number;
  top: number;
  title: string;          // 공모전 이름
  dDayLabel: string;      // 'D-5'
  progressLabel: string;  // '초안 작성 · 참여 2명'
  isResting?: boolean;    // 내가 합류하지 않은 원정이면 회색 표지판 + '쉬어가는 중'
  onClick: () => void;
}

const RESTING_LABEL = '쉬어가는 중';

export default function ExpeditionSign({
  left,
  top,
  title,
  dDayLabel,
  progressLabel,
  isResting = false,
  onClick,
}: ExpeditionSignProps) {
  const statusLabel = isResting ? RESTING_LABEL : progressLabel;

  return (
    <Wrapper style={{ left, top }}>
      {isResting ? <GrayPondImage src={pondSignGrayImage} alt="" /> : <PondImage src={pondSignImage} alt="" />}
      <Board type="button" onClick={onClick} aria-label={`${title}, ${dDayLabel}, ${statusLabel}`}>
        <Title $resting={isResting}>{title}</Title>
      </Board>
      <DDayBadge $resting={isResting} aria-hidden="true">
        {dDayLabel}
      </DDayBadge>
      <ProgressChip $resting={isResting} aria-hidden="true">
        <img src={isResting ? progressDotGray : progressDot} alt="" />
        {statusLabel}
      </ProgressChip>
    </Wrapper>
  );
}


const SET_SIZE = 217;

const Wrapper = styled.div`
  position: absolute;
  width: ${SET_SIZE}px;
  height: ${SET_SIZE}px;
  pointer-events: none;
`;

const PondImage = styled.img`
  display: block;
  width: ${SET_SIZE}px;
  height: ${SET_SIZE}px;
`;

// 회색 표지판 이미지는 크기가 달라서, 판자 위치가 일반 표지판과 겹치도록 맞춤 (Figma D01 · 수정 6)
const GrayPondImage = styled.img`
  position: absolute;
  top: -4.1px;
  left: -4.1px;
  display: block;
  width: 224px;
  height: 226px;
`;

const Board = styled.button`
  position: absolute;
  top: 62.6px;
  left: 42.4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 131.8px;
  height: 47.6px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
    border-radius: 8px;
  }
`;

const Title = styled.span<{ $resting: boolean }>`
  display: -webkit-box;
  width: 116px;
  overflow: hidden;
  color: ${({ $resting }) => ($resting ? '#6e6d6a' : 'var(--color-sign-text)')};
  font-family: var(--font-concept);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.3px;
  text-align: center;
  word-break: keep-all;
  text-wrap: balance; /* 두 줄 길이를 비슷하게 나눔 */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const DDayBadge = styled.span<{ $resting: boolean }>`
  position: absolute;
  top: 42.7px;
  left: 45.3px;
  padding: 4px 9px;
  border: 1.5px solid var(--color-sand);
  border-radius: 10px;
  background: var(--color-cream);
  box-shadow: 0 2px 0 #c9a66a;
  color: var(--color-orange);
  font-family: var(--font-concept);
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.13px;
  white-space: nowrap;

  ${({ $resting }) =>
    $resting &&
    css`
      top: 43.9px;
      left: 38.9px;
      background: #e7e5e0;
      color: var(--color-text-secondary);
    `}
`;

const ProgressChip = styled.span<{ $resting: boolean }>`
  position: absolute;
  top: 149.8px;
  left: 46.3px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 12px;
  background: rgba(255, 249, 236, 0.95);
  box-shadow: 0 2px 0 rgba(120, 80, 30, 0.2);
  color: var(--color-brown);
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  white-space: nowrap;

  ${({ $resting }) =>
    $resting &&
    css`
      top: 156.9px;
      left: 61.9px;
      color: var(--color-text-tertiary);
    `}
`;
