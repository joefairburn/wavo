'use client';

import React, { forwardRef, useRef } from 'react';
import { WaveformProvider } from './contexts/WaveformContext';
import useIsClient from './hooks/useIsClient';
import { useStyles } from './hooks/useStyles';
import { useInteraction } from './hooks/useInteraction';
import { useLazyLoad } from './hooks/useLazyLoad';
import { hasProgressComponent } from './utils/componentUtils';
import WaveformSVG from './components/WaveformSVG';

// Type representing normalized audio amplitude values between 0 and 1
export type NormalizedAmplitude = number;
export type WaveformData = readonly NormalizedAmplitude[];

export interface WaveformProps {
  dataPoints: WaveformData;
  completionPercentage?: number;
  lazyLoad?: boolean;
  animationSpeed?: number;
  progress?: number;
  onClick?: (percentage: number, event: React.MouseEvent<SVGSVGElement>) => void;
  onDrag?: (percentage: number, event: React.MouseEvent<SVGSVGElement>) => void;
  onDragStart?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onDragEnd?: (event: React.MouseEvent<SVGSVGElement>) => void;
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

    // Use the interaction hook to handle mouse/keyboard events
    const { eventHandlers, hasInteractions } = useInteraction({
      elementRef: svgRef,
      onClick,
      onDrag,
      onDragStart,
      onDragEnd,
      onKeyDown,
    });

    // Use the lazy load hook to handle intersection observer
    const { shouldRender } = useLazyLoad({
      elementRef: svgRef,
      enabled: lazyLoad,
    });

    // Handle styles
    useStyles({ unstyled, transitionDuration: 1 });

    // Check if there is a Progress component
    const hasProgress = React.useMemo(() => hasProgressComponent(children), [children]);

    // Memoize SVG attributes to reduce prop calculations on each render
    const svgAttributes = React.useMemo(
      () => ({
        className,
        preserveAspectRatio: 'none',
        'data-wavo-svg': '',
        'data-wavo-animate': isClient && shouldRender ? 'true' : 'false',
        tabIndex: hasInteractions ? 0 : undefined,
        role: hasInteractions ? 'slider' : undefined,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(progress * 100),
        'aria-label': 'Audio progress',
        ...eventHandlers,
      }),
      [className, eventHandlers, isClient, shouldRender, hasInteractions, progress],
    );

    // Memoize WaveformProvider props to reduce prop calculations on each render
    const providerProps = React.useMemo(
      () => ({
        dataPoints,
        svgRef,
        hasProgress,
        isStyled: !unstyled,
        transitionDuration: 1,
      }),
      [dataPoints, svgRef, hasProgress, unstyled],
    );

    return (
      <WaveformProvider {...providerProps}>
        <WaveformSVG svgRef={svgRef} svgAttributes={svgAttributes} shouldRender={shouldRender} isClient={isClient}>
          {children}
        </WaveformSVG>
      </WaveformProvider>
    );
  },
);

Waveform.displayName = 'Waveform';

export default Waveform;
