'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo, startTransition } from 'react';
import useIsClient from './hooks/useIsClient';
import { calculateReducedDataPoints } from './lib';

interface WaveformProps {
  dataPoints: number[];
  gap: number;
  width: number;
  // Add new prop
  completionPercentage?: number;
}

export default function Waveform({ dataPoints, gap = 1, width = 3, completionPercentage = 0.2 }: WaveformProps) {
  const cornerRadius = 0;
  const svgRef = useRef<SVGSVGElement>(null);
  const isClient = useIsClient();
  const [svgWidth, setSvgWidth] = useState<number | null>(null);

  /*
   * Debounce the width update to prevent excessive re-renders
   */
  const debouncedSetWidth = useCallback(() => {
    let timeoutId: NodeJS.Timeout;

    return (width: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (width) {
          setSvgWidth(width);
        }
      }, 50);
    };
  }, []);

  useLayoutEffect(() => {
    if (!svgRef.current) return;
    const debouncedFn = debouncedSetWidth();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        debouncedFn(entry.contentRect.width);
      }
    });

    resizeObserver.observe(svgRef.current);

    // Initial width calculation
    startTransition(() => {
      if (svgRef.current) {
        setSvgWidth(svgRef.current.clientWidth);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [isClient, debouncedSetWidth]);

  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;

  const reducedDataPoints = useMemo(
    () => (isClient ? calculateReducedDataPoints(barCount, dataPoints) : []),
    [barCount, dataPoints, isClient],
  );

  if (!isClient) return null;

  return (
    <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" ref={svgRef}>
      {/* Base waveform */}
      <g>
        {reducedDataPoints.map((point, index) => {
          const x = index * (width + gap);
          const barHeight = Math.max(1, point * 50);

          return (
            <rect
              key={index}
              x={x + 'px'}
              y={`${50 - barHeight}%`}
              width={width}
              height={`${barHeight * 2}%`}
              fill="gray"
              transform="translate(0,0)"
              style={{
                willChange: 'height, y',
                transition: 'height 0.5s ease-out, y 0.5s ease-out',
              }}
            />
          );
        })}
      </g>

      {/* Define the clip path
      <defs>
        <clipPath id="completion-clip">
          <rect x="0" y="0" width={svgWidth ? svgWidth * completionPercentage : 0} height="100%" />
        </clipPath>
      </defs> */}

      {/* <g clipPath="url(#completion-clip)">
        {reducedDataPoints.map((point, index) => {
          const x = index * (width + gap);
          const barHeight = Math.max(1, point * 50);

          return (
            <rect
              key={index}
              x={x + 'px'}
              y={`${50 - barHeight}%`}
              width={width}
              height={`${barHeight * 2}%`}
              fill="#ff69b4" // Pink color
            />
          );
        })}
      </g> */}
    </svg>
  );
}
