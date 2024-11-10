import React, { useRef, useId, CSSProperties, useState } from 'react';
import { useWaveform } from '../contexts/WaveformContext';
import { useIsClient } from '../hooks/useIsClient';

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
  const { dataPoints, hasProgress, id } = useWaveform();
  const [previouslyRenderedBars, setPreviouslyRenderedBars] = useState(dataPoints.length);

  if (previouslyRenderedBars > dataPoints.length) setPreviouslyRenderedBars(dataPoints.length);

  const newBars = dataPoints.slice(previouslyRenderedBars);
  return (
    <>
      <g fill={hasProgress ? `url(#gradient-${id})` : 'currentColor'}>
        {/* Previously rendered bars */}
        <g>
          {dataPoints.slice(0, previouslyRenderedBars).map((point, index) => (
            <SingleBar key={index} x={index * (width + gap)} width={width} point={point} isFirstRender={false} />
          ))}
        </g>
        {/* Newly added bars */}
        <g
          data-new-bars={newBars.length > 0 ? 'true' : 'false'}
          onAnimationEnd={() => setPreviouslyRenderedBars(dataPoints.length)}
        >
          {newBars.map((point, index) => {
            const actualIndex = index + previouslyRenderedBars;

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
