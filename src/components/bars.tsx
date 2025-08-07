import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWaveform } from '../contexts/waveform-context';
import { getReducedDataPoints } from '../lib';
import type { WaveformData } from '../waveform';

/**
 * Type for bar corner radius with constrained values
 * Higher values create more rounded corners on bars
 */
export type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Props for an individual bar in the waveform visualization
 */
interface SingleBarProps {
  /**
   * X-coordinate position of the bar
   */
  x: number;

  /**
   * Width of the bar in pixels
   */
  width: number;

  /**
   * Normalized amplitude value (0-1) for the bar
   */
  point: number;

  /**
   * Optional CSS class for styling the bar
   */
  className?: string;

  /**
   * Fill color for the bar (defaults to currentColor)
   */
  fill?: string;

  /**
   * Corner radius for the bar's rectangle
   * @default 2
   */
  radius?: BarRadius;
}

/**
 * Renders a single bar of the waveform visualization
 *
 * Memoized component that renders a rectangle with the appropriate dimensions and styling
 * based on the amplitude value. The height is calculated as a percentage of the container.
 *
 * @param props - Properties for the bar
 */
export const SingleBar = React.memo(function SingleBarComponent({
  x,
  width,
  point,
  className,
  fill,
  radius = 2,
}: SingleBarProps) {
  const barHeight = Math.max(1, point * 50);
  const heightInPixels = barHeight * 2;

  // Calculate normalized radius that respects the bar's dimensions
  const normalizedRadius = Math.min(
    radius,
    width < radius * 2 ? width / 2 : radius,
    heightInPixels < radius * 2 ? heightInPixels / 2 : radius
  );

  return (
    <rect
      className={className}
      data-wavo-bar
      fill={fill}
      height={`${barHeight * 2}%`}
      rx={`${normalizedRadius}px`}
      ry={`${normalizedRadius}px`}
      width={width}
      x={`${x}px`}
      y={`${50 - barHeight}%`}
    />
  );
});

/**
 * Props for the Bars component
 */
export interface BarsProps {
  /**
   * Width of each bar in pixels
   * @default 3
   */
  width?: number;

  /**
   * Gap between bars in pixels
   * @default 1
   */
  gap?: number;

  /**
   * Current progress value (0-1) for playback indication
   * Used in conjunction with the Progress component
   */
  progress?: number;

  /**
   * Corner radius for the bars
   * @default 2
   */
  radius?: BarRadius;

  /**
   * CSS class for styling the bars
   */
  className?: string;

  /**
   * Optional custom dataPoints to use instead of those from context
   * Generally not needed as dataPoints are provided by the Waveform container
   */
  dataPoints?: WaveformData;
}

/**
 * Internal renderer component for the bars visualization
 *
 * Handles the actual rendering of bars based on the calculated data points.
 * This component is memoized to prevent unnecessary re-renders.
 *
 * @private
 */
const BarsRenderer = React.memo(function BarsRendererComponent({
  width = 3,
  gap = 1,
  radius = 2,
  className,
  dataPoints,
}: BarsProps & { dataPoints: readonly number[] }) {
  const { hasProgress, id } = useWaveform();

  // Simplified approach: just render all bars directly
  const bars = useMemo(() => {
    return dataPoints.map((point, index) => (
      <SingleBar
        // biome-ignore lint/suspicious/noArrayIndexKey: Waveform data points have stable positions
        key={`bar-${index}`}
        point={point}
        radius={radius}
        width={width}
        x={index * (width + gap)}
      />
    ));
  }, [dataPoints, radius, width, gap]);

  return (
    <g
      className={className}
      fill={hasProgress ? `url(#gradient-${id})` : 'currentColor'}
    >
      {bars}
    </g>
  );
});

/**
 * Bar-based waveform visualization component
 *
 * Renders the waveform as a series of vertical bars, with heights proportional to
 * the amplitude values. Automatically adjusts the number of bars based on available
 * width and handles resizing for responsive layouts.
 *
 * Features:
 * - Automatic bar count calculation based on container width
 * - Responsive resizing with ResizeObserver
 * - Optimized rendering with memoization
 * - Visual distinction between playing and non-playing sections (when used with Progress)
 * - Customizable bar width, gap, and corner radius
 *
 * @example
 * ```tsx
 * // Basic usage within a Waveform container
 * <Waveform dataPoints={audioData}>
 *   <Bars />
 * </Waveform>
 *
 * // Customized appearance
 * <Waveform dataPoints={audioData}>
 *   <Bars width={2} gap={1} radius={3} className="custom-bars" />
 *   <Progress />
 * </Waveform>
 *
 * ```
 */
export const Bars: React.FC<BarsProps> = ({
  width = 3,
  gap = 1,
  radius = 2,
  className,
}) => {
  const [svgWidth, setSvgWidth] = useState<number>(0); // Initialize with 0 or a sensible default
  const [computedDataPoints, setComputedDataPoints] = useState<
    readonly number[]
  >([]);
  const { dataPoints: _dataPoints, svgRef } = useWaveform();

  // Computation function for reducing data points
  const computeReducedDataPoints = useCallback(
    (currentBarCount: number, sourceData: WaveformData): readonly number[] => {
      if (currentBarCount === 0) {
        return [];
      }
      return getReducedDataPoints(currentBarCount, sourceData);
    },
    []
  );

  // Use ResizeObserver to update width when SVG container size changes
  useEffect(() => {
    // Ensure svgRef is available
    if (!svgRef?.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Ensure contentRect is available and provides width
        if (entry.contentRect) {
          const newWidth = entry.contentRect.width;
          // Update state only if width has actually changed to avoid unnecessary renders
          setSvgWidth((prevWidth) =>
            prevWidth !== newWidth ? newWidth : prevWidth
          );
        }
      }
    });

    // Start observing the SVG element
    resizeObserver.observe(svgRef.current);

    // Cleanup function to disconnect observer on component unmount or ref change
    return () => resizeObserver.disconnect();
  }, [svgRef]); // Dependency array includes svgRef

  // Calculate bar count based on available space
  const barCount = useMemo(() => {
    if (!svgWidth || svgWidth <= 0) {
      return 0; // Handle zero or negative width
    }
    const barTotalWidth = width + gap;
    return Math.max(1, Math.floor(svgWidth / barTotalWidth)); // Ensure at least 1 bar if width > 0
  }, [svgWidth, width, gap]);

  // Effect to compute reduced data points when barCount or dataPoints change
  useEffect(() => {
    if (barCount > 0 && _dataPoints.length > 0) {
      const result = computeReducedDataPoints(barCount, _dataPoints);
      setComputedDataPoints(result);
    } else {
      setComputedDataPoints([]);
    }
  }, [barCount, _dataPoints, computeReducedDataPoints]);

  // Render nothing until width is properly measured and bars calculated
  if (barCount === 0) {
    return null;
  }

  return (
    <BarsRenderer
      className={className}
      dataPoints={computedDataPoints}
      gap={gap}
      radius={radius}
      width={width}
    />
  );
};

/**
 * @deprecated Use Bars instead
 */
export { Bars as BarsContainer };
