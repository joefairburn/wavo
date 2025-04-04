import React from 'react';
import { useWaveform } from '../contexts/WaveformContext';

/**
 * Props for the Progress component
 */
export interface ProgressProps {
  /**
   * Current playback progress as a value between 0 and 1
   * @default Value from Waveform parent component if available, otherwise 0
   */
  progress: number;

  /**
   * Color for the played portion of the waveform
   * @default "currentColor"
   */
  color: string;
}

/**
 * Visual progress indicator for waveform playback
 *
 * Creates a gradient that visually distinguishes between played and unplayed
 * portions of the waveform. Works in conjunction with the Bars or Path components
 * by providing a gradient that they can reference.
 *
 * The component renders an SVG linearGradient with a hard stop at the current
 * progress position, creating a clear visual distinction between played content
 * (using the specified color) and unplayed content (using the inherited color).
 *
 * @example
 * ```tsx
 * // Basic usage with default color
 * <Waveform dataPoints={audioData} progress={0.5}>
 *   <Bars />
 *   <Progress progress={0.5} color="#f00" />
 * </Waveform>
 *
 * // Using parent component's progress value
 * <Waveform dataPoints={audioData} progress={currentProgress}>
 *   <Bars />
 *   <Progress progress={currentProgress} color="rgba(255, 0, 0, 0.8)" />
 * </Waveform>
 * ```
 */
export const Progress: React.FC<ProgressProps> = ({ progress, color }) => {
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
        data-wavo-gradient
      >
        <stop offset="50%" stopColor={color} />
        <stop offset="50%" stopColor="currentColor" />
      </linearGradient>
    </defs>
  );
};
