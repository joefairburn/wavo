import React, { useRef, useId } from 'react';
import { WaveformBar } from './WaveformBar';

interface WaveformBarsProps {
  dataPoints: number[];
  width: number;
  gap: number;
  progress?: number;
}

export function WaveformBars({ dataPoints, width, gap, progress = 0 }: WaveformBarsProps) {
  const hasAnimatedOnce = useRef(false);
  const clipPathId = useId();
  const totalWidth = dataPoints.length * (width + gap);

  if (!hasAnimatedOnce.current) {
    hasAnimatedOnce.current = true;
  }

  return (
    <>
      {/* Background layer (gray bars) */}
      <g
        style={{
          opacity: hasAnimatedOnce.current ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        {dataPoints.map((point, index) => (
          <WaveformBar key={index} x={index * (width + gap)} width={width} point={point} />
        ))}
      </g>
      {progress > 0 && (
        <>
          {/* Progress layer (highlighted bars) */}
          <g
            style={{
              opacity: hasAnimatedOnce.current ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              // TODO: Make this a prop
              color: '#F23D75',
            }}
            clipPath={`url(#${clipPathId})`}
          >
            {dataPoints.map((point, index) => (
              <WaveformBar key={index} x={index * (width + gap)} width={width} point={point} />
            ))}
          </g>

          {/* Clip path definition */}
          <defs>
            <clipPath id={clipPathId}>
              <rect x={0} y={0} width={totalWidth} height="100%" transform={`scale(${progress}, 1)`} />
            </clipPath>
          </defs>
        </>
      )}
    </>
  );
}
