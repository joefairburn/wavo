import React, { useLayoutEffect, useState, useRef, useEffect, useMemo } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { createDebouncedFunction, getReducedDataPoints } from '../lib';
import { WaveformData } from '../Waveform';
import { useStyles } from '../hooks/useStyles';

// Type for radius with constraints
export type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;

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
const createPathForBars = (dataPoints: number[], width: number, gap: number, radius: BarRadius): string => {
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
 * Props for the PathBars component
 *
 * @property width - Width of each bar in pixels
 * @property gap - Gap between bars in pixels
 * @property progress - Current playback progress (0-1)
 * @property radius - Radius for bar corners (0-5)
 * @property className - CSS class to apply to bars
 * @property dataPoints - Optional override for waveform data points
 */
export interface PathBarsProps {
  width?: number;
  gap?: number;
  progress?: number;
  radius?: BarRadius;
  className?: string;
  dataPoints?: WaveformData;
}

/**
 * Component that renders the waveform using SVG paths instead of individual rect elements
 * for better performance with large datasets.
 *
 * This component:
 * 1. Calculates the number of bars based on available width
 * 2. Reduces the data points to match the number of bars
 * 3. Observes size changes to adjust the bar count
 * 4. Uses CSS variables from the parent SVG for styling if available
 * 5. Creates a single path element with all bars instead of multiple rect elements
 */
export const PathBars: React.FC<PathBarsProps> = ({ width = 3, gap = 1, radius = 2, className }) => {
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const { dataPoints: _dataPoints, svgRef, hasProgress, id } = useWaveform();
  const previousPathRef = useRef<string>('');
  const [path, setPath] = useState<string>('');

  // Initialize styles
  useStyles({ unstyled: false, transitionDuration: 1 });

  // Calculate bar width and gap using CSS variables if available
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

  // Calculate bar count based on SVG width and bar dimensions
  const barCount = useMemo(() => {
    if (!svgWidth) return 0;
    return Math.floor(svgWidth / (cssBarWidth + cssBarGap));
  }, [svgWidth, cssBarWidth, cssBarGap]);

  // Use the memoized version for better performance with large datasets
  const reducedDataPoints = useMemo(() => {
    if (!barCount) return [];
    return getReducedDataPoints(barCount, _dataPoints);
  }, [barCount, _dataPoints]);

  // Create path string from data points
  useEffect(() => {
    if (reducedDataPoints.length) {
      const newPath = createPathForBars(reducedDataPoints, cssBarWidth, cssBarGap, radius);
      previousPathRef.current = newPath;
      setPath(newPath);
    }
  }, [reducedDataPoints, cssBarWidth, cssBarGap, radius]);

  // Monitor SVG size changes
  useLayoutEffect(() => {
    if (!svgRef?.current) return;
    const debouncedSetWidth = createDebouncedFunction(setSvgWidth);

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        debouncedSetWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(svgRef.current);
    setSvgWidth(svgRef.current.clientWidth);

    return () => resizeObserver.disconnect();
  }, [svgRef]);

  // Return null if there are no datapoints
  if (!reducedDataPoints.length || !path) return null;

  return (
    <path
      d={path}
      fill={hasProgress ? `url(#gradient-${id})` : 'var(--wavo-bar-color, currentColor)'}
      className={className}
      data-wavo-path-bars
    />
  );
};

export default PathBars;
