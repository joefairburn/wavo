import React, { useLayoutEffect, useState, useRef, useEffect, useMemo } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { createDebouncedFunction, getReducedDataPoints } from '../lib';
import { WaveformData } from '../Waveform';

// Type for radius with constraints
export type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;

interface SingleBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
  fill?: string;
  radius?: BarRadius;
}

// Memoize the SingleBar component since it's rendered many times
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

export interface BarsProps {
  width?: number;
  gap?: number;
  progress?: number;
  radius?: BarRadius;
  className?: string;
  dataPoints?: WaveformData;
}

// Memoize the BarsRenderer to prevent unnecessary renders
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

export const Bars: React.FC<BarsProps> = ({ width = 3, gap = 1, radius = 2, className }) => {
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
  const { dataPoints: _dataPoints, svgRef } = useWaveform();

  // Use the memoized version for better performance with large datasets
  const reducedDataPoints = useMemo(() => {
    if (!barCount) return [];
    return getReducedDataPoints(barCount, _dataPoints);
  }, [barCount, _dataPoints]);

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
  }, []);

  // Return null if there are no datapoints
  if (!reducedDataPoints.length) return null;

  return <BarsRenderer width={width} gap={gap} radius={radius} className={className} dataPoints={reducedDataPoints} />;
};

// For backward compatibility
export { Bars as BarsContainer };
