import React, { useLayoutEffect, useMemo, useState, useCallback } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { getReducedDataPoints } from '../lib';
import { WaveformData } from '../Waveform';

/**
 * Type for corner radius with constrained values
 * Higher values create more rounded corners on waveform bars
 */
export type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Rendering mode for the Path component
 * - 'bar': Renders individual bars like the Bars component but as a single path
 * - 'line': Renders a continuous line connecting all data points
 */
export type RenderType = 'bar' | 'line';

// CSS variable names
const CSS_VAR_BAR_WIDTH = '--wavo-bar-width';
const CSS_VAR_BAR_GAP = '--wavo-bar-gap';

/**
 * Creates a path string for a series of bars with rounded corners
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each bar
 * @param gap - Gap between bars
 * @param radius - Radius for bar corners
 * @returns A path string for SVG
 */
const createBarPath = (dataPoints: number[], width: number, gap: number, radius: BarRadius): string => {
  if (!dataPoints.length) return '';

  const paths: string[] = [];

  // Process each data point to create a path
  dataPoints.forEach((point, index) => {
    const barHeight = Math.max(1, point * 50);
    const heightInPixels = barHeight * 2;

    // Calculate x position considering width and gap
    const x = index * (width + gap);

    // Calculate y positions for top and bottom of the bar
    const yTop = 50 - barHeight;
    const yBottom = 50 + barHeight;

    // Adjust radius based on bar dimensions
    const normalizedRadius = Math.min(
      radius,
      width < radius * 2 ? width / 2 : radius,
      heightInPixels < radius * 2 ? heightInPixels / 2 : radius,
    );

    // Skip path creation for zero height bars
    if (barHeight <= 0) return;

    // Create path for a rounded rectangle
    if (normalizedRadius > 0) {
      // Top-left corner
      paths.push(`M${x + normalizedRadius},${yTop}`);

      // Top edge and top-right corner
      paths.push(`H${x + width - normalizedRadius}`);
      paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + width},${yTop + normalizedRadius}`);

      // Right edge and bottom-right corner
      paths.push(`V${yBottom - normalizedRadius}`);
      paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + width - normalizedRadius},${yBottom}`);

      // Bottom edge and bottom-left corner
      paths.push(`H${x + normalizedRadius}`);
      paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x},${yBottom - normalizedRadius}`);

      // Left edge and close the path
      paths.push(`V${yTop + normalizedRadius}`);
      paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + normalizedRadius},${yTop}`);
      paths.push('Z');
    } else {
      // Simple rectangle without rounded corners
      paths.push(`M${x},${yTop}`);
      paths.push(`H${x + width}`);
      paths.push(`V${yBottom}`);
      paths.push(`H${x}`);
      paths.push(`V${yTop}`);
      paths.push('Z');
    }
  });

  return paths.join(' ');
};

/**
 * Creates a path string for a continuous line connecting data points
 * Can render as jagged line or smooth curve depending on curvature
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @param curvature - Smoothness of the curve (0 = jagged lines, 1 = very smooth)
 * @returns A path string for SVG
 */
const createLinePath = (dataPoints: number[], width: number, gap: number, curvature: number = 0): string => {
  if (!dataPoints.length) return '';

  // If curvature is zero or very low, create a traditional jagged line path
  if (curvature <= 0.05) {
    return createJaggedLinePath(dataPoints, width, gap);
  }

  // Otherwise create a smooth curve with the specified curvature
  return createSmoothLinePath(dataPoints, width, gap, curvature);
};

/**
 * Creates a path string for a jagged line connecting data points
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @returns A path string for SVG
 */
const createJaggedLinePath = (dataPoints: number[], width: number, gap: number): string => {
  if (!dataPoints.length) return '';

  const totalWidth = width + gap;
  let path = '';

  // Create the top half of the waveform
  path += 'M0,50 '; // Start at the middle

  dataPoints.forEach((point, index) => {
    const barHeight = Math.max(1, point * 50);
    const x = index * totalWidth + width / 2; // Center of each bar
    path += `L${x},${50 - barHeight} `;
  });

  // Connect to the bottom half
  const lastIndex = dataPoints.length - 1;
  const lastX = lastIndex * totalWidth + width / 2;
  path += `L${lastX},50 `; // Back to middle line at the end

  // Create the bottom half of the waveform (mirror of top)
  for (let i = dataPoints.length - 1; i >= 0; i--) {
    const point = dataPoints[i];
    const barHeight = Math.max(1, point * 50);
    const x = i * totalWidth + width / 2; // Center of each bar
    path += `L${x},${50 + barHeight} `;
  }

  // Close the path
  path += 'L0,50 Z';

  return path;
};

/**
 * Creates a path string for a smooth curve connecting data points
 * Uses cubic bezier curves for smooth transitions between points
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @param curvature - Smoothness of the curve (0-1)
 * @returns A path string for SVG
 */
const createSmoothLinePath = (dataPoints: number[], width: number, gap: number, curvature: number): string => {
  if (!dataPoints.length) return '';
  if (dataPoints.length < 3) return createJaggedLinePath(dataPoints, width, gap); // Fallback to line path for few points

  // Clamp curvature between 0 and 1
  const tensionFactor = Math.min(Math.max(curvature, 0), 1);

  const totalWidth = width + gap;
  const points: [number, number][] = [];

  // Generate points for the top half
  points.push([0, 50]); // Start at the middle

  dataPoints.forEach((point, index) => {
    const barHeight = Math.max(1, point * 50);
    const x = index * totalWidth + width / 2; // Center of each bar
    points.push([x, 50 - barHeight]);
  });

  const lastIndex = dataPoints.length - 1;
  const lastX = lastIndex * totalWidth + width / 2;
  points.push([lastX, 50]); // Back to middle line at the end

  // Generate points for the bottom half (mirror of top)
  for (let i = dataPoints.length - 1; i >= 0; i--) {
    const point = dataPoints[i];
    const barHeight = Math.max(1, point * 50);
    const x = i * totalWidth + width / 2;
    points.push([x, 50 + barHeight]);
  }

  // Close back to starting point
  points.push([0, 50]);

  // Create the path with smooth curves
  return createSmoothPath(points, tensionFactor);
};

/**
 * Creates a smooth path from a set of points
 *
 * @param points - Array of [x,y] coordinates
 * @param tensionFactor - How smooth the curve should be (0-1)
 * @returns SVG path string
 */
const createSmoothPath = (points: [number, number][], tensionFactor: number): string => {
  if (points.length < 2) return '';

  let path = `M${points[0][0]},${points[0][1]} `;

  // Enhanced tension calculation
  const tension = 0.2 + tensionFactor * 0.3; // Map 0-1 to sensible tension range 0.2-0.5

  if (points.length === 2) {
    // With only two points, just draw a line
    path += `L${points[1][0]},${points[1][1]} `;
    return path;
  }

  // For three or more points, use cubic bezier curves
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Control points
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;

    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

    path += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]} `;
  }

  // Close the path
  path += 'Z';

  return path;
};

/**
 * Props for the Path component
 */
export interface PathProps {
  /**
   * Rendering type for the waveform visualization
   * - 'bar': Individual bars (similar to Bars component but as a single path)
   * - 'line': Continuous line connecting points
   * @default 'bar'
   */
  type?: RenderType;

  /**
   * Width of each segment in pixels
   * @default 3
   */
  width?: number;

  /**
   * Gap between segments in pixels
   * @default 1
   */
  gap?: number;

  /**
   * Current progress value (0-1) for playback indication
   * Used in conjunction with the Progress component
   */
  progress?: number;

  /**
   * Corner radius for bars when type='bar'
   * @default 2
   */
  radius?: BarRadius;

  /**
   * Smoothness factor for curves when type='line'
   * 0 = jagged lines, 1 = very smooth curves
   * @default 0
   */
  curvature?: number;

  /**
   * Whether to use smooth curves (when type='line')
   * @default true
   */
  smooth?: boolean;

  /**
   * CSS class for styling the path
   */
  className?: string;

  /**
   * Optional custom dataPoints to use instead of those from context
   * Generally not needed as dataPoints are provided by the Waveform container
   */
  dataPoints?: WaveformData;
}

/**
 * Path-based waveform visualization component
 *
 * Renders the waveform as a single SVG path element, which provides better performance
 * for larger waveforms than the Bars component, which creates many individual elements.
 *
 * Supports two rendering modes:
 * 1. 'bar' - Similar appearance to Bars but as a single optimized path element
 * 2. 'line' - Continuous line/curve connecting all data points
 *
 * Features:
 * - Better performance for large waveforms (uses single path vs. many elements)
 * - Support for both bar and line/curve rendering modes
 * - Automatic data point reduction for optimal rendering
 * - Responsive to container size changes
 * - Compatible with Progress component for partial coloring
 *
 * @example
 * ```tsx
 * // Basic bar-type path (better performance than Bars for large datasets)
 * <Waveform dataPoints={audioData}>
 *   <Path type="bar" width={2} gap={1} radius={3} />
 * </Waveform>
 *
 * // Continuous line visualization
 * <Waveform dataPoints={audioData}>
 *   <Path type="line" smooth={true} curvature={0.5} />
 * </Waveform>
 *
 * // With progress indicator
 * <Waveform dataPoints={audioData} progress={0.5}>
 *   <Path type="line" />
 *   <Progress progress={0.5} color="#f00" />
 * </Waveform>
 * ```
 */
export const Path: React.FC<PathProps> = ({
  type = 'bar',
  width = 3,
  gap = 1,
  radius = 2,
  curvature = 0,
  smooth = true,
  className,
}) => {
  const { dataPoints: _dataPoints, svgRef, hasProgress, id } = useWaveform();
  // We need this state to force re-renders when the size changes
  const [svgWidth, setSvgWidth] = useState<number | null>(null);

  // Function to measure and update SVG dimensions
  const updateSvgDimensions = useCallback(() => {
    if (svgRef?.current) {
      setSvgWidth(svgRef.current.clientWidth);
    }
  }, [svgRef]);

  // Calculate segment width and gap using CSS variables if available
  const cssBarWidth = useMemo(() => {
    if (!svgRef?.current) return width;

    const style = window.getComputedStyle(svgRef.current);
    const cssWidth = style.getPropertyValue(CSS_VAR_BAR_WIDTH);
    return cssWidth ? parseInt(cssWidth, 10) : width;
  }, [svgRef, width]);

  const cssBarGap = useMemo(() => {
    if (!svgRef?.current) return gap;

    const style = window.getComputedStyle(svgRef.current);
    const cssGap = style.getPropertyValue(CSS_VAR_BAR_GAP);
    return cssGap ? parseInt(cssGap, 10) : gap;
  }, [svgRef, gap]);

  // Calculate segment count based on SVG width and dimensions
  const segmentCount = useMemo(() => {
    if (!svgWidth) return 0;
    return Math.floor(svgWidth / (cssBarWidth + cssBarGap));
  }, [svgWidth, cssBarWidth, cssBarGap]);

  // Use the memoized version for better performance with large datasets
  const reducedDataPoints = useMemo(() => {
    if (!segmentCount) return [];
    return getReducedDataPoints(segmentCount, _dataPoints);
  }, [segmentCount, _dataPoints]);

  // Generate the path string
  const pathString = useMemo(() => {
    if (!reducedDataPoints.length) return '';

    if (type === 'bar') {
      return createBarPath(reducedDataPoints, cssBarWidth, cssBarGap, radius);
    } else if (type === 'line') {
      // Use 0.1 curvature if smooth is true, otherwise use the provided curvature
      const smoothingValue = smooth ? 0.1 : curvature;
      return createLinePath(reducedDataPoints, cssBarWidth, cssBarGap, smoothingValue);
    }

    return '';
  }, [reducedDataPoints, cssBarWidth, cssBarGap, radius, type, curvature, smooth]);

  // Calculate the viewBox to ensure the path scales properly with the container
  const viewBox = useMemo(() => {
    if (!svgWidth) return '0 0 100 100';

    // Width is just the full svg width to allow all bars to be visible
    const totalWidth = segmentCount * (cssBarWidth + cssBarGap);

    // Use the container's aspect ratio to ensure we fit in the SVG
    return `0 0 ${totalWidth} 100`;
  }, [svgWidth, segmentCount, cssBarWidth, cssBarGap]);

  // Set up resize observer and initial measurement
  useLayoutEffect(() => {
    if (!svgRef?.current) return;

    // Initial measurement
    updateSvgDimensions();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateSvgDimensions();
    });

    resizeObserver.observe(svgRef.current);
    return () => resizeObserver.disconnect();
  }, [svgRef, updateSvgDimensions]);

  // Return null if there are no datapoints
  if (!reducedDataPoints.length || !pathString) return null;

  return (
    // Use an svg element to apply proper scaling within the parent SVG
    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={viewBox} style={{ overflow: 'visible' }}>
      <path
        d={pathString}
        fill={hasProgress ? `url(#gradient-${id})` : 'var(--wavo-bar-color, currentColor)'}
        className={className}
        data-wavo-path={type}
        style={{ willChange: 'none' }} // Prevent CSS animations from targeting this element
      />
    </svg>
  );
};

// Add default export for the Path component
export default Path;
