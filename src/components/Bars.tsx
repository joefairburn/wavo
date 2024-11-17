import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { calculateReducedDataPoints, createDebouncedFunction } from '../lib';

interface SingleBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
  fill?: string;
  shouldAnimateIn: boolean;
  radius?: number;
}

export function SingleBar({ x, width, point, className, fill, radius = 2, shouldAnimateIn }: SingleBarProps) {
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
}

interface BarsProps {
  width?: number;
  gap?: number;
  progress?: number;
  radius?: number;
  className?: string;
  dataPoints: number[];
}

const Bars = ({ width = 3, gap = 1, radius = 2, className, dataPoints }: BarsProps) => {
  const { hasProgress, id } = useWaveform();
  const previousDataPointsRef = useRef<number>(dataPoints.length);

  useEffect(() => {
    previousDataPointsRef.current = dataPoints.length;
  }, [dataPoints]);

  const newBars = dataPoints.slice(previousDataPointsRef.current);

  return (
    <>
      <g fill={hasProgress ? `url(#gradient-${id})` : 'currentColor'} className={className}>
        {/* Previously rendered bars */}
        <g>
          {dataPoints.slice(0, previousDataPointsRef.current).map((point, index) => (
            <SingleBar
              radius={radius}
              key={index}
              x={index * (width + gap)}
              width={width}
              point={point}
              shouldAnimateIn={false}
            />
          ))}
        </g>
        {/* Newly added bars */}
        {newBars.length > 0 && (
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
        )}
      </g>
    </>
  );
};

export const BarsContainer = ({ width = 3, gap = 1, radius = 2, className }: BarsProps) => {
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
  const { dataPoints: _dataPoints, svgRef } = useWaveform();

  const reducedDataPoints = React.useMemo(
    () => calculateReducedDataPoints(barCount, _dataPoints) ?? [],
    [barCount, _dataPoints],
  );

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

  return <Bars width={width} gap={gap} radius={radius} className={className} dataPoints={reducedDataPoints} />;
};
