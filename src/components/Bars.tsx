import React, { useLayoutEffect, useState, useRef, useEffect, useMemo } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { calculateReducedDataPoints, createDebouncedFunction, getReducedDataPoints } from '../lib';

interface SingleBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
  fill?: string;
  shouldAnimateIn: boolean;
  radius?: number;
}

// Memoize the SingleBar component since it's rendered many times
export const SingleBar = React.memo(function SingleBar({
  x,
  width,
  point,
  className,
  fill,
  radius = 2,
  shouldAnimateIn,
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
  radius?: number;
  className?: string;
  dataPoints: number[];
}

// Memoize the BarsRenderer to prevent unnecessary renders
const BarsRenderer = React.memo(function BarsRenderer({
  width = 3,
  gap = 1,
  radius = 2,
  className,
  dataPoints,
}: BarsProps) {
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
        <SingleBar
          radius={radius}
          key={index}
          x={index * (width + gap)}
          width={width}
          point={point}
          shouldAnimateIn={false}
        />
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
            <SingleBar
              key={actualIndex}
              radius={radius}
              x={actualIndex * (width + gap)}
              width={width}
              point={point}
              shouldAnimateIn={true}
            />
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

export const Bars = ({ width = 3, gap = 1, radius = 2, className }: BarsProps) => {
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
