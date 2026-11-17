import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styled, { css, keyframes } from 'styled-components';

// 점프 + 손 흔드는 포즈를 보여주는 시간 (점프 애니메이션 길이와 같게)
const JUMP_MS = 900;

interface OasisCharacterProps {
  name: string;             // 화면 읽기 프로그램용 이름 (예: 사자)
  image: string;            // 가만히 있을 때 이미지
  jumpImage: string;        // 점프할 때 이미지 (피그마 '오아시스 캐릭터'의 손 흔드는 포즈)
  style: CSSProperties;     // 지도 위 위치 · 크기 (left, top, width, height)
  idleDelay?: number;       // 숨쉬기 · 흔들기 시작을 당겨(초, 음수) 캐릭터끼리 박자가 겹치지 않게 한다
  swayAngle?: number;       // 좌우로 기울이는 최대 각도(도). 동물마다 성격을 다르게 준다
  swayDuration?: number;    // 좌우 한 번 왕복하는 시간(초)
}

// D01 오아시스 캐릭터
// - 가만히 있을 때: 발을 기준으로 숨 쉬듯 살짝 늘었다 줄었다 하고, 좌우로 살짝 기울어진다.
// - 누르면: 손 흔드는 포즈로 바뀌며 통 튀어 올랐다 착지한다. 점프 중에는 다시 눌러도 무시한다.
export default function OasisCharacter({
  name,
  image,
  jumpImage,
  style,
  idleDelay = 0,
  swayAngle = 2,
  swayDuration = 4,
}: OasisCharacterProps) {
  const [isJumping, setIsJumping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const jump = () => {
    if (isJumping) return;
    setIsJumping(true);
    // 움직임 줄이기 설정에선 애니메이션이 없어 animationend가 오지 않으므로 타이머로 끝낸다.
    timerRef.current = setTimeout(() => setIsJumping(false), JUMP_MS);
  };

  return (
    <Button type="button" aria-label={`${name} 점프`} style={style} onClick={jump}>
      <Jumper $isJumping={isJumping}>
        <Swayer
          $isJumping={isJumping}
          style={
            {
              '--sway-angle': `${swayAngle}deg`,
              animationDuration: `${swayDuration}s`,
              animationDelay: `${idleDelay}s`,
            } as CSSProperties
          }
        >
          <Breather $isJumping={isJumping} style={{ animationDelay: `${idleDelay}s` }}>
            {/* 두 포즈를 겹쳐 두고 보이는 것만 바꿔, 처음 누를 때 이미지 로딩으로 깜빡이지 않게 한다. */}
            <Pose src={image} alt="" $visible={!isJumping} />
            <Pose src={jumpImage} alt="" $visible={isJumping} />
          </Breather>
        </Swayer>
      </Jumper>
    </Button>
  );
}

// 발(아래 가운데)을 기준으로 살짝 납작해졌다 길어진다.
const breathe = keyframes`
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.025, 0.965); }
`;

// 발(아래 가운데)을 축으로 좌우로 살짝 기울어진다. 각도는 --sway-angle
const sway = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(calc(var(--sway-angle) * -1)); }
  75% { transform: rotate(var(--sway-angle)); }
`;

// 웅크림 → 튀어 오름 → 착지하며 찌그러짐 → 제자리
const jumpUp = keyframes`
  0% { transform: translateY(0) scale(1, 1); }
  12% { transform: translateY(0) scale(1.08, 0.88); }
  40% { transform: translateY(-22px) scale(0.95, 1.06); }
  58% { transform: translateY(-24px) scale(1, 1); }
  80% { transform: translateY(0) scale(1.1, 0.88); }
  90% { transform: translateY(-3px) scale(0.98, 1.02); }
  100% { transform: translateY(0) scale(1, 1); }
`;

const Button = styled.button`
  position: absolute;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 8px;
  }
`;

const Jumper = styled.span<{ $isJumping: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;

  ${({ $isJumping }) =>
    $isJumping &&
    css`
      animation: ${jumpUp} ${JUMP_MS}ms cubic-bezier(0.33, 0, 0.3, 1);
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 시간은 style의 animationDuration으로 동물마다 다르게 준다.
const Swayer = styled.span<{ $isJumping: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;
  animation: ${sway} 4s ease-in-out infinite;
  animation-play-state: ${({ $isJumping }) => ($isJumping ? 'paused' : 'running')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Breather = styled.span<{ $isJumping: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;
  animation: ${breathe} 2.6s ease-in-out infinite;
  /* 점프하는 동안은 숨쉬기를 멈춰 두 움직임이 겹쳐 보이지 않게 한다. */
  animation-play-state: ${({ $isJumping }) => ($isJumping ? 'paused' : 'running')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Pose = styled.img<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;
