import React, { useRef } from 'react';
import { WaveformBar } from './WaveformBar';

interface WaveformBarsProps {
  dataPoints: number[];
  visibleBars: number;
  width: number;
  gap: number;
  isAnimationComplete: boolean;
}

export function WaveformBars({ dataPoints, visibleBars, width, gap, isAnimationComplete }: WaveformBarsProps) {
  const hasAnimatedOnce = useRef(false);

  if (isAnimationComplete && !hasAnimatedOnce.current) {
    hasAnimatedOnce.current = true;
  }

  return (
    <g
      style={{
        opacity: hasAnimatedOnce.current ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {dataPoints.slice(0, visibleBars).map((point, index) => (
        <WaveformBar key={index} x={index * (width + gap)} width={width} point={point} />
      ))}
    </g>
  );
}
