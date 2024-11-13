import React, { useRef, useId, CSSProperties, useState, useLayoutEffect } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { useIsClient } from '../hooks/useIsClient';
import { calculateReducedDataPoints, createDebouncedFunction } from '../lib';

interface SingleBarProps {
  x: number;
  width: number;
  point: number;
  className?: string;
  fill?: string;
  isFirstRender: boolean;
}

export function SingleBar({ x, width, point, className, fill, isFirstRender }: SingleBarProps) {
  const barHeight = Math.max(1, point * 50);

  return (
    <rect
      x={x + 'px'}
      y={`${50 - barHeight}%`}
      width={width}
      height={`${barHeight * 2}%`}
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
}

export function Bars({ width = 3, gap = 1 }: BarsProps) {
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
  const { dataPoints: _dataPoints, hasProgress, id, svgRef } = useWaveform();
  const reducedDataPoints = React.useMemo(
    () => calculateReducedDataPoints(barCount, _dataPoints) ?? [],
    [barCount, _dataPoints],
  );

  const [previouslyRenderedBars, setPreviouslyRenderedBars] = useState<number | null | undefined>(null);

  // If the bars have not been rendered yet, we don't want to animate them.
  const shouldAnimateBars = previouslyRenderedBars !== null;

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

  if (previouslyRenderedBars && previouslyRenderedBars > reducedDataPoints.length)
    setPreviouslyRenderedBars(reducedDataPoints.length);

  const newBars = reducedDataPoints.slice(previouslyRenderedBars ?? reducedDataPoints.length);

  return (
    <>
      <g fill={hasProgress ? `url(#gradient-${id})` : 'currentColor'}>
        {/* Previously rendered bars */}
        <g>
          {reducedDataPoints.slice(0, previouslyRenderedBars ?? reducedDataPoints.length).map((point, index) => (
            <SingleBar key={index} x={index * (width + gap)} width={width} point={point} isFirstRender={false} />
          ))}
        </g>
        {/* Newly added bars */}
        <g
          data-new-bars={newBars.length > 0 ? 'true' : 'false'}
          onAnimationEnd={() => setPreviouslyRenderedBars(reducedDataPoints.length)}
        >
          {newBars.map((point, index) => {
            const actualIndex = index + (previouslyRenderedBars ?? reducedDataPoints.length);

            return (
              <SingleBar
                key={actualIndex}
                x={actualIndex * (width + gap)}
                width={width}
                point={point}
                isFirstRender={true}
              />
            );
          })}
        </g>
      </g>
    </>
  );
}
