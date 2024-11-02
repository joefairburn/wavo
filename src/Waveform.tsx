'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useIsClient from './hooks/useIsClient';
import { calculateReducedDataPoints, createDebouncedFunction, requestIdleCallback } from './lib';
import { WaveformBars } from './components/WaveformBars';

interface WaveformProps {
  dataPoints: number[];
  gap: number;
  width: number;
  completionPercentage?: number;
  lazyLoad?: boolean;
  animationSpeed?: number;
}

export default function Waveform({
  dataPoints,
  gap = 1,
  width = 3,
  completionPercentage = 0.2,
  lazyLoad = false,
  animationSpeed = 3,
}: WaveformProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isClient = useIsClient();
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const [shouldRender, setShouldRender] = useState(!lazyLoad);
  const [visibleBars, setVisibleBars] = useState(0);
  const animationFrameRef = useRef<number>();
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (!lazyLoad || !svgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            hasBeenVisible.current = true;
            setShouldRender(true);
          } else {
            if (hasBeenVisible.current) {
              setShouldRender(false);
              setVisibleBars(0);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0,
      },
    );

    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [lazyLoad]);

  useLayoutEffect(() => {
    if (!svgRef.current) return;
    const debouncedSetWidth = createDebouncedFunction(setSvgWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        debouncedSetWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(svgRef.current);
    setSvgWidth(svgRef.current.clientWidth);

    return () => resizeObserver.disconnect();
  }, [isClient]);

  const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
  const reducedDataPoints = React.useMemo(
    () => (isClient ? calculateReducedDataPoints(barCount, dataPoints) : []),
    [barCount, dataPoints, isClient],
  );

  useEffect(() => {
    if (!shouldRender || !reducedDataPoints.length) return;

    const animate = () => {
      setVisibleBars((prev) => {
        const next = prev + animationSpeed;
        if (next >= reducedDataPoints.length) {
          return reducedDataPoints.length;
        }
        animationFrameRef.current = requestAnimationFrame(animate);
        return next;
      });
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldRender, reducedDataPoints.length, animationSpeed]);

  return (
    <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" ref={svgRef}>
      {isClient && shouldRender && (
        <WaveformBars
          dataPoints={reducedDataPoints}
          visibleBars={visibleBars}
          width={width}
          gap={gap}
          isAnimationComplete={visibleBars === reducedDataPoints.length}
        />
      )}
    </svg>
  );
}
