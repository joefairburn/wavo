'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Progress } from './components/Progress';
import { WaveformProvider } from './contexts/WaveformContext';
import useIsClient from './hooks/useIsClient';
import { useStyles } from './hooks/useStyles';

export interface WaveformProps {
  dataPoints: number[];
  completionPercentage?: number;
  lazyLoad?: boolean;
  animationSpeed?: number;
  progress?: number;
  onClick?: (percentage: number) => void;
  onDrag?: (percentage: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
  shouldAnimate?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<SVGSVGElement>) => void;
  unstyled?: boolean;
  children: React.ReactNode;
}

const Waveform = forwardRef<SVGSVGElement, WaveformProps>(
  (
    {
      dataPoints,
      lazyLoad = false,
      progress = 0,
      onClick,
      onDrag,
      onDragStart,
      onDragEnd,
      className,
      onKeyDown,
      unstyled = false,
      children,
    },
    forwardedRef,
  ) => {
    // If the component is used with a ref, use that ref, otherwise use an internal ref
    const hasForwardedRef = typeof forwardedRef === 'object' && forwardedRef !== null;
    const _internalRef = useRef<SVGSVGElement>(null);
    const svgRef = hasForwardedRef ? forwardedRef : _internalRef;
    const isClient = useIsClient();
    const [shouldRender, setShouldRender] = useState(!lazyLoad);
    const hasBeenVisible = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const calculatePercentageFromEvent = React.useCallback(
      (event: MouseEvent | React.MouseEvent) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        return x / rect.width;
      },
      [svgRef],
    );

    // Add this function to check for Progress component
    const hasProgressComponent = React.useMemo(
      () => React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === Progress),
      [children],
    );

    // Memoize the keyboard/mouse event flag
    const hasMouseOrKeyboardEvents = React.useMemo(
      () => Boolean(onClick || onDrag || onKeyDown || onDragStart || onDragEnd),
      [onClick, onDrag, onKeyDown, onDragStart, onDragEnd],
    );

    useEffect(() => {
      if (!lazyLoad || !svgRef.current) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
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

    const handleClick = React.useCallback(
      (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || !onClick) return;
        onClick(calculatePercentageFromEvent(event));
      },
      [onClick, calculatePercentageFromEvent],
    );

    const handleMouseDown = React.useCallback(
      (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;

        // If onDrag is provided, call it with the initial position
        onDrag?.(calculatePercentageFromEvent(event));

        setIsDragging(prev => {
          if (prev) return true;
          onDragStart?.();
          return true;
        });
      },
      [svgRef, onDrag, onDragStart, calculatePercentageFromEvent],
    );

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(prev => {
        if (!prev) return false;
        onDragEnd?.();
        return false;
      });
    }, [onDragEnd]);

    const handleGlobalMouseMove = React.useCallback(
      (event: MouseEvent) => {
        if (!isDragging || !svgRef.current || !onDrag) return;
        onDrag(calculatePercentageFromEvent(event));
      },
      [isDragging, onDrag, calculatePercentageFromEvent, svgRef],
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
    }, [isDragging, handleGlobalMouseMove, handleMouseUp]);

    useStyles({ unstyled, transitionDuration: 1 });

    // Memoize SVG attributes to reduce prop calculations on each render
    const svgAttributes = React.useMemo(
      () => ({
        className,
        preserveAspectRatio: 'none',
        onClick: handleClick,
        onMouseDown: handleMouseDown,
        onKeyDown: onKeyDown as React.KeyboardEventHandler,
        'data-wavo-svg': '',
        'data-wavo-animate': isClient && shouldRender ? 'true' : 'false',
        tabIndex: hasMouseOrKeyboardEvents ? 0 : undefined,
        role: hasMouseOrKeyboardEvents ? 'slider' : undefined,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(progress * 100),
        'aria-label': 'Audio progress',
      }),
      [className, handleClick, handleMouseDown, onKeyDown, isClient, shouldRender, hasMouseOrKeyboardEvents, progress],
    );

    // Memoize WaveformProvider props to reduce prop calculations on each render
    const providerProps = React.useMemo(
      () => ({
        dataPoints,
        svgRef,
        hasProgress: hasProgressComponent,
        isStyled: !unstyled,
        transitionDuration: 1,
      }),
      [dataPoints, svgRef, hasProgressComponent, unstyled],
    );

    return (
      <WaveformProvider {...providerProps}>
        <svg ref={svgRef} {...svgAttributes}>
          {/* Only render children if the component is visible and the SVG is mounted. */}
          {isClient && shouldRender && children}
        </svg>
      </WaveformProvider>
    );
  },
);

Waveform.displayName = 'Waveform';

export default Waveform;
