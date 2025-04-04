import React, { useLayoutEffect, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { getReducedDataPoints } from '../lib';
import { WaveformData } from '../Waveform';

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
export const SingleBar = React.memo(function SingleBar({
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
    heightInPixels < radius * 2 ? heightInPixels / 2 : radius,
  );

  return (
    <rect
      x={x + 'px'}
      y={`${50 - barHeight}%`}
      width={width}
      height={`${barHeight * 2}%`}
      rx={`${normalizedRadius}px`}
      ry={`${normalizedRadius}px`}
      fill={fill}
      className={className}
      data-wavo-bar
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
const BarsRenderer = React.memo(function BarsRenderer({
  width = 3,
  gap = 1,
  radius = 2,
  className,
  dataPoints,
}: BarsProps & { dataPoints: readonly number[] }) {
  const { hasProgress, id } = useWaveform();
  const previousDataPointsRef = useRef<number>(dataPoints.length);

  useEffect(() => {
    previousDataPointsRef.current = dataPoints.length;
  }, [dataPoints]);

  const newBars = dataPoints.slice(previousDataPointsRef.current);

  // Memoize the previously rendered bars to prevent unnecessary re-renders
  const previousBars = useMemo(() => {
    return dataPoints
      .slice(0, previousDataPointsRef.current)
      .map((point, index) => (
        <SingleBar radius={radius} key={index} x={index * (width + gap)} width={width} point={point} />
      ));
  }, [dataPoints, previousDataPointsRef.current, radius, width, gap]);

  // Memoize the newly added bars
  const newBarsElements = useMemo(() => {
    if (newBars.length === 0) return null;

    return (
      <g
        key={previousDataPointsRef.current}
        data-new-bars="true"
        onAnimationEnd={() => {
          previousDataPointsRef.current = dataPoints.length;
        }}
      >
        {newBars.map((point, index) => {
          const actualIndex = index + previousDataPointsRef.current;

          return (
            <SingleBar key={actualIndex} radius={radius} x={actualIndex * (width + gap)} width={width} point={point} />
          );
        })}
      </g>
    );
  }, [newBars, previousDataPointsRef.current, radius, width, gap, dataPoints.length]);

  return (
    <>
      <g fill={hasProgress ? `url(#gradient-${id})` : 'currentColor'} className={className}>
        {/* Previously rendered bars */}
        <g>{previousBars}</g>
        {/* Newly added bars */}
        {newBarsElements}
      </g>
    </>
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
 * ```
 */
export const Bars: React.FC<BarsProps> = ({ width = 3, gap = 1, radius = 2, className }) => {
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const { dataPoints: _dataPoints, svgRef } = useWaveform();
  const widthMeasuredRef = useRef<boolean>(false);

  /**
   * Updates the measured width of the SVG container
   * Only triggers a state update if the width has changed
   */
  const updateSvgWidth = useCallback(() => {
    if (svgRef?.current) {
      const newWidth = svgRef.current.clientWidth;
      setSvgWidth(prev => {
        // Only update if width has changed or not been set
        if (prev !== newWidth) {
          widthMeasuredRef.current = true;
          return newWidth;
        }
        return prev;
      });
    }
  }, [svgRef]);

  // Calculate bar count based on available space
  const barCount = useMemo(() => {
    if (!svgWidth) return 0;
    return Math.floor(svgWidth / (width + gap));
  }, [svgWidth, width, gap]);

  // Use the memoized version for better performance with large datasets
  const reducedDataPoints = useMemo(() => {
    if (!barCount) return [];
    return getReducedDataPoints(barCount, _dataPoints);
  }, [barCount, _dataPoints]);

  // Set up resize observer using useLayoutEffect for initial measurement before paint
  useLayoutEffect(() => {
    if (!svgRef?.current) return;

    // Initial width measurement
    updateSvgWidth();

    // Set up resize observer for subsequent changes
    const resizeObserver = new ResizeObserver(() => {
      updateSvgWidth();
    });

    resizeObserver.observe(svgRef.current);
    return () => resizeObserver.disconnect();
  }, [svgRef, updateSvgWidth]);

  // Return null if there are no datapoints or width hasn't been measured yet
  if (!reducedDataPoints.length || !widthMeasuredRef.current) return null;

  return (
    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <BarsRenderer width={width} gap={gap} radius={radius} className={className} dataPoints={reducedDataPoints} />
    </svg>
  );
};

/**
 * @deprecated Use Bars instead
 */
export { Bars as BarsContainer };
