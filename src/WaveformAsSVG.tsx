'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { generateReducedContent } from './lib';
import useIsClient from './hooks/useIsClient';

interface WaveformAsSVGProps {
  dataPoints: number[];
  gap: number;
  width: number;
  // Add new prop
  completionPercentage?: number;
}

export default function WaveformAsSVG({
  dataPoints = [
    0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3,
    0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6,
    0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5,
    0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8,
    0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2, 0.6, 0.7, 0.4, 0.5, 0.3, 0.5, 0.8, 0.3, 0.9, 0.2,
    0.6, 0.7, 0.4, 0.5, 0.3,
  ],
  gap = 1,
  width = 3,
  completionPercentage = 0.2, // Add default value
}: WaveformAsSVGProps) {
  const cornerRadius = 0;
  const svgRef = useRef<SVGSVGElement>(null);
  const isClient = useIsClient();
  const [svgWidth, setSvgWidth] = useState<number | null>(null);

  /*
   * Debounce the width update to prevent excessive re-renders
   */
  const debouncedUpdateWidth = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (svgRef.current) {
          setSvgWidth(svgRef.current.clientWidth);
        }
      }, 30);
    };
  }, []);

  useLayoutEffect(() => {
    const updateWidth = debouncedUpdateWidth();

    // Initial width calculation (not debounced)
    if (svgRef.current) {
      setSvgWidth(svgRef.current.clientWidth);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [debouncedUpdateWidth, isClient]);

  if (!isClient) return null;

  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;

  const reducedDataPoints = generateReducedContent(dataPoints, barCount);

  if (isNaN(barCount)) return null;

  return (
    <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" ref={svgRef}>
      {reducedDataPoints.map((point, index) => {
        const x = index * (width + gap);
        const barHeight = Math.max(1, point * 50); // Using 50% to allow bars to grow up and down

        return (
          <rect
            key={index}
            x={x + 'px'}
            y={`${50 - barHeight}%`} // Center the bar by offsetting from middle
            width={width}
            height={`${barHeight * 2}%`} // Double height to extend both up and down
            rx={cornerRadius}
            ry={cornerRadius}
            fill="gray"
          />
        );
      })}
    </svg>
  );
}
