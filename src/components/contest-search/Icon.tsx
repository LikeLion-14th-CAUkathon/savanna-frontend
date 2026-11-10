import styled from 'styled-components';

interface IconProps {
  src: string;
  size: number;      // 아이콘 영역(정사각형) 크기
  offsetX?: number;  // 그림이 가운데가 아닐 때만: 영역 왼쪽에서 떨어진 거리
  offsetY?: number;  // 그림이 가운데가 아닐 때만: 영역 위쪽에서 떨어진 거리
}

// 피그마에서 받은 SVG는 아이콘 영역보다 작거나 살짝 넘치게 그려져 있다.
// SVG 원래 크기는 건드리지 않고, 영역 안에서 위치만 잡아준다.
export default function Icon({ src, size, offsetX, offsetY }: IconProps) {
  const isPositioned = offsetX !== undefined || offsetY !== undefined;

  return (
    <Slot $size={size} aria-hidden="true">
      <Img
        src={src}
        alt=""
        $positioned={isPositioned}
        style={isPositioned ? { left: offsetX ?? 0, top: offsetY ?? 0 } : undefined}
      />
    </Slot>
  );
}

const Slot = styled.span<{ $size: number }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

const Img = styled.img<{ $positioned: boolean }>`
  display: block;
  max-width: none;
  position: ${({ $positioned }) => ($positioned ? 'absolute' : 'static')};
`;
