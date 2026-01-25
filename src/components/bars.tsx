import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWaveform } from "../contexts/waveform-context";
import { getReducedDataPoints } from "../lib";
import type { WaveformData } from "../waveform";
import { Path, type PathHandle } from "./path";

/**
 * Type for bar corner radius with constrained values
 * Higher values create more rounded corners on bars
 */
export type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Imperative handle for Bars component ref
 */
export interface BarsHandle {
  /**
   * Update bar heights without triggering component re-render
   * @param dataPoints - Array of normalized values (0-1), length should match bar count
   */
  setDataPoints(dataPoints: number[]): void;

  /**
   * Get current bar count (useful for generating correctly-sized data)
   */
  getBarCount(): number;
}

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
    heightInPixels < radius * 2 ? heightInPixels / 2 : radius,
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

  /**
   * When true, renders bars as a single optimized SVG path instead of individual rect elements.
   * This provides better performance for large waveforms.
   * @default false
   */
  optimized?: boolean;
}

/**
 * Internal renderer component for the bars visualization
 *
 * Handles the actual rendering of bars based on the calculated data points.
 * This component is memoized to prevent unnecessary re-renders.
 *
 * @private
 */
const BarsRenderer = React.memo(
  forwardRef<SVGGElement, BarsProps & { dataPoints: readonly number[] }>(
    function BarsRendererComponent({ width = 3, gap = 1, radius = 2, className, dataPoints }, ref) {
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
          ref={ref}
          className={className}
          fill={hasProgress ? `url(#gradient-${id})` : "currentColor"}
        >
          {bars}
        </g>
      );
    },
  ),
);

/**
 * Internal component for rendering bars as individual rect elements
 * @private
 */
const BarsRects = forwardRef<BarsHandle, Omit<BarsProps, "optimized">>(
  ({ width = 3, gap = 1, radius = 2, className }, ref) => {
    const [svgWidth, setSvgWidth] = useState<number>(0);
    const { dataPoints: _dataPoints, svgRef } = useWaveform();
    const groupRef = useRef<SVGGElement>(null);
    const barCountRef = useRef(0);

    // Use ResizeObserver to update width when SVG container size changes
    useEffect(() => {
      if (!svgRef?.current) {
        return;
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect) {
            const newWidth = entry.contentRect.width;
            setSvgWidth((prevWidth) => (prevWidth !== newWidth ? newWidth : prevWidth));
          }
        }
      });

      resizeObserver.observe(svgRef.current);
      return () => resizeObserver.disconnect();
    }, [svgRef]);

    // Calculate bar count based on available space
    const barCount = useMemo(() => {
      if (!svgWidth || svgWidth <= 0) {
        return 0;
      }
      const barTotalWidth = width + gap;
      return Math.max(1, Math.floor(svgWidth / barTotalWidth));
    }, [svgWidth, width, gap]);

    // Update barCountRef when bar count changes
    useEffect(() => {
      barCountRef.current = barCount;
    }, [barCount]);

    // PERFORMANCE OPTIMIZATION: Imperative DOM update pattern
    // --------------------------------------------------------
    // This memo intentionally omits _dataPoints from dependencies.
    // Initial render uses _dataPoints, but subsequent updates are handled
    // imperatively via useLayoutEffect below to avoid React re-renders.
    //
    // Flow:
    // 1. initialDataPoints computed once per barCount change (triggers re-render)
    // 2. _dataPoints changes -> useLayoutEffect updates DOM directly (no re-render)
    // 3. setDataPoints() imperative API also updates DOM directly (no re-render)
    const initialDataPoints = useMemo(() => {
      if (barCount === 0 || _dataPoints.length === 0) {
        return [];
      }
      return getReducedDataPoints(barCount, _dataPoints);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barCount]);

    // Imperatively update bar heights when dataPoints change (avoids re-rendering)
    useLayoutEffect(() => {
      if (!groupRef.current || barCount === 0 || _dataPoints.length === 0) return;

      const reducedPoints = getReducedDataPoints(barCount, _dataPoints);
      const bars = groupRef.current.querySelectorAll("[data-wavo-bar]");

      bars.forEach((bar, i) => {
        if (i >= reducedPoints.length) return;
        const barHeight = Math.max(1, reducedPoints[i] * 50);
        bar.setAttribute("height", `${barHeight * 2}%`);
        bar.setAttribute("y", `${50 - barHeight}%`);
      });
    }, [_dataPoints, barCount]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        setDataPoints: (points: number[]) => {
          if (!groupRef.current || !barCountRef.current) return;
          // Auto-scale data to match bar count for consistency with prop-based updates
          const scaledPoints = getReducedDataPoints(barCountRef.current, points);
          const bars = groupRef.current.querySelectorAll("[data-wavo-bar]");
          bars.forEach((bar, i) => {
            if (i >= scaledPoints.length) return;
            const barHeight = Math.max(1, scaledPoints[i] * 50);
            bar.setAttribute("height", `${barHeight * 2}%`);
            bar.setAttribute("y", `${50 - barHeight}%`);
          });
        },
        getBarCount: () => barCountRef.current,
      }),
      [],
    );

    // Render nothing until width is properly measured
    if (barCount === 0) {
      return null;
    }

    return (
      <BarsRenderer
        ref={groupRef}
        className={className}
        dataPoints={initialDataPoints}
        gap={gap}
        radius={radius}
        width={width}
      />
    );
  },
);

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
 * - Optional optimized mode using single SVG path for better performance
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
 * // Optimized mode for large datasets
 * <Waveform dataPoints={audioData}>
 *   <Bars optimized />
 * </Waveform>
 * ```
 */
export const Bars = forwardRef<BarsHandle | PathHandle, BarsProps>(
  ({ width = 3, gap = 1, radius = 2, className, optimized = false }, ref) => {
    // If optimized, delegate to Path component with type="bar"
    if (optimized) {
      return (
        <Path
          ref={ref as React.Ref<PathHandle>}
          type="bar"
          width={width}
          gap={gap}
          radius={radius}
          className={className}
        />
      );
    }

    return (
      <BarsRects
        ref={ref as React.Ref<BarsHandle>}
        width={width}
        gap={gap}
        radius={radius}
        className={className}
      />
    );
  },
);

Bars.displayName = "Bars";

/**
 * @deprecated Use Bars instead
 */
export { Bars as BarsContainer };
