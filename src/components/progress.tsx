import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useWaveform } from '../contexts/waveform-context';

/**
 * Props for the Progress component
 */
export interface ProgressProps {
  /**
   * Current playback progress as a value between 0 and 1
   * @default Value from Waveform parent component if available, otherwise 0
   */
  progress?: number;

  /**
   * Color for the played portion of the waveform
   * @default "currentColor"
   */
  color: string;
}

/**
 * Imperative handle for Progress component ref
 */
export interface ProgressHandle {
  /**
   * Update progress without triggering component re-render
   * @param newProgress - Progress value between 0 and 1
   */
  setProgress(newProgress: number): void;
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
 * // Basic usage with progress prop
 * <Waveform dataPoints={audioData}>
 *   <Bars />
 *   <Progress progress={0.5} color="#f00" />
 * </Waveform>
 *
 * // Using ref for performance (prevents re-renders)
 * const progressRef = useRef<ProgressHandle>(null);
 *
 * // Update progress without re-rendering
 * progressRef.current?.setProgress(0.7);
 *
 * <Waveform dataPoints={audioData}>
 *   <Bars />
 *   <Progress ref={progressRef} color="rgba(255, 0, 0, 0.8)" />
 * </Waveform>
 * ```
 */
export const Progress = forwardRef<ProgressHandle, ProgressProps>(
  ({ progress: propProgress = 0, color }, ref) => {
    const { id } = useWaveform();
    const gradientRef = useRef<SVGLinearGradientElement>(null);
    const lastProgressRef = useRef(-1); // Track last update to avoid unnecessary DOM changes

    // Helper to update progress by directly updating gradient stops
    const updateProgress = useCallback((value: number) => {
      const clampedProgress = Math.max(0, Math.min(1, value));

      // Round to 2 decimal places to avoid floating point precision issues
      const roundedProgress = Math.round(clampedProgress * 10_000) / 100;

      // Only update DOM if progress actually changed
      if (roundedProgress !== lastProgressRef.current && gradientRef.current) {
        lastProgressRef.current = roundedProgress;
        const stops = gradientRef.current.querySelectorAll('stop');
        const offsetValue = `${roundedProgress}%`;
        for (const stop of stops) {
          stop.setAttribute('offset', offsetValue);
        }
      }
    }, []);

    // Update DOM when prop changes
    useEffect(() => {
      updateProgress(propProgress);
    }, [propProgress, updateProgress]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        setProgress: updateProgress,
      }),
      [updateProgress]
    );

    return (
      <defs>
        <linearGradient
          data-wavo-gradient
          gradientUnits="userSpaceOnUse"
          id={`gradient-${id}`}
          ref={gradientRef}
          x1="0"
          x2="100%"
          y1="0"
          y2="0"
        >
          <stop offset="0%" stopColor={color} />
          <stop offset="0%" stopColor="currentColor" />
        </linearGradient>
      </defs>
    );
  }
);

Progress.displayName = 'Progress';
