import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { useWaveform } from "../contexts/waveform-context";

/**
 * Scale a gradient stop offset based on progress.
 * @param offset - Original offset as percentage string (e.g., "50%")
 * @param progress - Progress value between 0 and 1
 * @returns Scaled offset as percentage string
 */
function scaleGradientOffset(offset: string, progress: number): string {
  const numericOffset = Number.parseFloat(offset);
  const scaled = numericOffset * progress;
  return `${scaled}%`;
}

/**
 * A single color stop in a gradient
 */
export interface GradientStop {
  /**
   * Position of the color stop as a percentage (0-100) or CSS value
   * @example "0%", "50%", "100%"
   */
  offset: string;

  /**
   * CSS color value for this stop
   * @example "#f96706", "rgba(255, 0, 0, 0.8)", "currentColor"
   */
  color: string;
}

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
   * Color for the played portion of the waveform.
   * Used when no gradient is specified.
   * @default "currentColor"
   */
  color?: string;

  /**
   * Multi-color gradient stops for the waveform.
   * When provided, creates a gradient across the entire waveform.
   * The progress indicator will reveal this gradient as playback advances.
   *
   * @example
   * ```tsx
   * // Orange to yellow gradient
   * gradient={[
   *   { offset: "0%", color: "#f96706" },
   *   { offset: "100%", color: "#ffd93d" }
   * ]}
   *
   * // Three-color gradient
   * gradient={[
   *   { offset: "0%", color: "#f96706" },
   *   { offset: "50%", color: "#ff9a3c" },
   *   { offset: "100%", color: "#ffd93d" }
   * ]}
   * ```
   */
  gradient?: GradientStop[];
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
 * Progress reads automatically from the parent Waveform.Container's `progress` prop.
 *
 * @example
 * ```tsx
 * // Basic usage - progress is set on the Container
 * <Waveform dataPoints={audioData} progress={0.5}>
 *   <Bars />
 *   <Progress color="#f00" />
 * </Waveform>
 *
 * // Using ref for high-frequency updates (e.g., 60fps audio playback)
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
  ({ progress: propProgress, color = "currentColor", gradient }, ref) => {
    const { id, progress: contextProgress } = useWaveform();
    // Use prop if provided, otherwise fall back to context value
    const progress = propProgress ?? contextProgress;
    const gradientRef = useRef<SVGLinearGradientElement>(null);
    const lastProgressRef = useRef(-1); // Track last update to avoid unnecessary DOM changes
    // Store gradient in a ref to avoid recreating updateProgress when gradient reference changes
    const gradientDataRef = useRef(gradient);

    // Sync gradient ref when gradient prop changes (idiomatic React pattern)
    useEffect(() => {
      gradientDataRef.current = gradient;
    }, [gradient]);

    // Helper to update progress by directly updating gradient stops
    // Uses gradientDataRef to avoid dependency on gradient prop reference
    const updateProgress = useCallback((value: number) => {
      const clampedProgress = Math.max(0, Math.min(1, value));

      // Round to 4 decimal places to avoid floating point precision issues
      const roundedProgress = Math.round(clampedProgress * 10_000) / 10_000;

      // Only update DOM if progress actually changed
      if (roundedProgress !== lastProgressRef.current && gradientRef.current) {
        lastProgressRef.current = roundedProgress;
        const stops = gradientRef.current.querySelectorAll("stop");
        const currentGradient = gradientDataRef.current;

        if (currentGradient) {
          // For multi-color gradients, scale all stops proportionally
          const gradientStopCount = currentGradient.length;
          for (let i = 0; i < stops.length; i++) {
            const stop = stops[i];
            if (i < gradientStopCount) {
              // Scale gradient stops to fit within progress
              stop.setAttribute(
                "offset",
                scaleGradientOffset(currentGradient[i].offset, roundedProgress),
              );
            } else {
              // The final stop (unplayed color) sits at the progress position
              stop.setAttribute("offset", `${roundedProgress * 100}%`);
            }
          }
        } else {
          // Original behavior for single color
          const offsetValue = `${roundedProgress * 100}%`;
          for (const stop of stops) {
            stop.setAttribute("offset", offsetValue);
          }
        }
      }
    }, []);

    // Update DOM when progress changes - useLayoutEffect ensures update before paint
    useLayoutEffect(() => {
      updateProgress(progress);
    }, [progress, updateProgress]);

    // Reset the guard when gradient structure changes so offsets get recalculated
    useLayoutEffect(() => {
      lastProgressRef.current = -1;
      updateProgress(progress);
    }, [gradient?.length, updateProgress, progress]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        setProgress: updateProgress,
      }),
      [updateProgress],
    );

    // Render gradient stops with fixed initial offsets.
    // updateProgress() handles all dynamic offset changes imperatively.
    const renderStops = (): React.ReactNode => {
      if (gradient) {
        // Multi-color gradient: render all gradient stops + final unplayed stop
        // All stops start at 0%, updateProgress() will set actual scaled values
        return (
          <>
            {gradient.map((gradientStop, index) => (
              <stop
                // biome-ignore lint/suspicious/noArrayIndexKey: gradient stops have stable positions
                key={index}
                offset="0%"
                stopColor={gradientStop.color}
              />
            ))}
            <stop offset="0%" stopColor="currentColor" />
          </>
        );
      }

      // Single color: original two-stop gradient
      return (
        <>
          <stop offset="0%" stopColor={color} />
          <stop offset="0%" stopColor="currentColor" />
        </>
      );
    };

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
          {renderStops()}
        </linearGradient>
      </defs>
    );
  },
);

Progress.displayName = "Progress";
