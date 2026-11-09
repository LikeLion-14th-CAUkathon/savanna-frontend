import styled from 'styled-components';
import pondSignImage from '../../assets/images/oasis/pond-sign.png';
import progressDot from '../../assets/icons/oasis/progress-dot.svg';

interface ExpeditionSignProps {
  left: number;           // 웅덩이 세트 그림 왼쪽 위 위치 (지도 기준 px)
  top: number;
  title: string;          // 공모전 이름
  dDayLabel: string;      // 'D-5'
  progressLabel: string;  // '초안 작성 · 참여 2명'
  onClick: () => void;
}

// 원정 하나 = 물웅덩이 + 표지판 하나. 그림 위에 공고명·D-day·진행 단계를 올림
export default function ExpeditionSign({ left, top, title, dDayLabel, progressLabel, onClick }: ExpeditionSignProps) {
  return (
    <Wrapper style={{ left, top }}>
      <PondImage src={pondSignImage} alt="" />
      <Board type="button" onClick={onClick} aria-label={`${title}, ${dDayLabel}, ${progressLabel}`}>
        <Title>{title}</Title>
      </Board>
      <DDayBadge aria-hidden="true">{dDayLabel}</DDayBadge>
      <ProgressChip aria-hidden="true">
        <img src={progressDot} alt="" />
        {progressLabel}
      </ProgressChip>
    </Wrapper>
  );
}

// 그림(1254px 정사각형)을 217px로 줄였을 때 판자 위치: 왼쪽 42.4 / 위 62.6 / 131.8 x 47.6
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

const Title = styled.span`
  display: -webkit-box;
  width: 116px;
  overflow: hidden;
  color: var(--color-sign-text);
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

const DDayBadge = styled.span`
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
`;

const ProgressChip = styled.span`
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
`;
