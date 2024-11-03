import React from 'react';

interface WaveformBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
}

export function WaveformBar({ x, width, point, className }: WaveformBarProps) {
  const barHeight = Math.max(1, point * 50);

  // Only show animations on higher performance devices
  const isHighPerformance = typeof navigator !== 'undefined' && navigator.hardwareConcurrency >= 4;

  return (
    <rect
      x={x + 'px'}
      y={`${50 - barHeight}%`}
      width={width}
      height={`${barHeight * 2}%`}
      fill={'currentColor'}
      className={className}
      transform="translate(0,0)"
      style={{
        willChange: isHighPerformance ? 'height, y' : undefined,
        transition: isHighPerformance ? 'height 1s ease-in-out, y 1s ease-in-out' : 'none',
      }}
    />
  );
}
