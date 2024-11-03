import React from 'react';

interface WaveformBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
}

export function WaveformBar({ x, width, point, className }: WaveformBarProps) {
  const barHeight = Math.max(1, point * 50);

  return (
    <rect
      x={x + 'px'}
      y={`${50 - barHeight}%`}
      width={width}
      height={`${barHeight * 2}%`}
      fill={'currentColor'}
      className={className}
      data-wavelet-bar
      transform="translate(0,0)"
    />
  );
}
