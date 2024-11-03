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
  progress?: number;
  onClick?: (percentage: number) => void;
  onDrag?: (percentage: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export default function Waveform({
  dataPoints,
  gap = 1,
  width = 3,
  completionPercentage = 0.2,
  lazyLoad = false,
  animationSpeed = 3,
  progress = 0,
  onClick,
  onDrag,
  onDragStart,
  onDragEnd,
  className,
}: WaveformProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isClient = useIsClient();
  const [svgWidth, setSvgWidth] = useState<number | null>(null);
  const [shouldRender, setShouldRender] = useState(!lazyLoad);
  const hasBeenVisible = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !onClick) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;

    onClick(percentage);
  };

  const handleMouseDown = () => {
    setIsDragging((prev) => {
      if (prev) return true;
      onDragStart?.();
      return true;
    });
  };

  const handleMouseUp = () => {
    setIsDragging((prev) => {
      if (!prev) return false;
      onDragEnd?.();
      return false;
    });
  };

  const handleGlobalMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !svgRef.current || !onDrag) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const percentage = x / rect.width;

      onDrag(percentage);
    },
    [isDragging, onDrag],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleGlobalMouseMove]);

  const handleKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
    if (!onClick) return;

    const STEP = 0.05; // 5% increment/decrement

    switch (event.key) {
      case 'ArrowLeft':
        onClick(Math.max(0, progress - STEP));
        event.preventDefault();
        break;
      case 'ArrowRight':
        onClick(Math.min(1, progress + STEP));
        event.preventDefault();
        break;
    }
  };

  return (
    <svg
      className={className}
      preserveAspectRatio="none"
      ref={svgRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Audio progress"
    >
      {isClient && shouldRender && (
        <WaveformBars dataPoints={reducedDataPoints} width={width} gap={gap} progress={progress} />
      )}
    </svg>
  );
}
