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

export default function WaveformAsPath({
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

  const reducedDataPoints = generateReducedContent(dataPoints, 400);

  if (isNaN(barCount)) return null;

  // Add path generation logic
  const generatePath = (points: number[]): string => {
    if (!svgWidth) return '';

    const height = 100;
    const pointSpacing = svgWidth / (points.length - 1);

    // Helper function to generate control points for smooth curves
    const generateControlPoints = (pts: [number, number][]): [number, number][][] => {
      const controlPoints: [number, number][][] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const cp1x = x0 + (x1 - x0) / 3;
        const cp2x = x0 + (2 * (x1 - x0)) / 3;
        const cp1y = y0;
        const cp2y = y1;
        controlPoints.push([
          [cp1x, cp1y],
          [cp2x, cp2y],
        ]);
      }
      return controlPoints;
    };

    // Create points array for top curve
    const topPoints = points.map((point, i): [number, number] => [
      i * pointSpacing,
      height * (1 - (isNaN(point) ? 0 : point)),
    ]);

    // Generate control points for top curve
    const topControlPoints = generateControlPoints(topPoints);

    // Create the top curve path
    let path = `M ${topPoints[0][0]},${topPoints[0][1]}`;
    topPoints.slice(1).forEach((point, i) => {
      const [cp1, cp2] = topControlPoints[i];
      path += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${point[0]},${point[1]}`;
    });

    // Create points array for bottom curve (mirror of top)
    const bottomPoints = points
      .reverse()
      .map((point, i): [number, number] => [svgWidth - i * pointSpacing, height * (1 + (isNaN(point) ? 0 : point))]);

    // Generate control points for bottom curve
    const bottomControlPoints = generateControlPoints(bottomPoints);

    // Create the bottom curve path
    bottomPoints.slice(1).forEach((point, i) => {
      const [cp1, cp2] = bottomControlPoints[i];
      path += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${point[0]},${point[1]}`;
    });

    return path;
  };

  const pathData = generatePath(reducedDataPoints);

  return (
    <>
      <svg
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        viewBox={`0 0 ${svgWidth || 0} 200`}
        ref={svgRef}
      >
        <path d={pathData} fill="gray" />
      </svg>
    </>
  );
}
