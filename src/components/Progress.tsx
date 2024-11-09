import React from 'react';
import { useWaveform } from '../contexts/WaveformContext';

export const Progress = ({ progress, color }: { progress: number; color: string }) => {
  const { id } = useWaveform();

  // 0px doesn't render correctly in Safari so we use 0.01px instead.
  const progressPercentage = progress === 0 ? '0.01px' : `${progress * 200}%`;
  return (
    <defs>
      <linearGradient
        id={`gradient-${id}`}
        x1="0"
        y1="0"
        x2={progressPercentage}
        y2="0"
        gradientUnits="userSpaceOnUse"
        data-wavelet-gradient
      >
        <stop offset="50%" stopColor={color} />
        <stop offset="50%" stopColor="currentColor" />
      </linearGradient>
    </defs>
  );
};
