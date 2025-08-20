'use client';

import React, { forwardRef, useRef } from 'react';
import WaveformSVG from './components/waveform-svg';
import { WaveformProvider } from './contexts/waveform-context';
import { useInteraction } from './hooks/use-interaction';
import useIsClient from './hooks/use-is-client';
import { useLazyLoad } from './hooks/use-lazy-load';
import { useStyles } from './hooks/use-styles';
import { hasProgressComponent } from './utils/component-utils';

/**
 * Type representing normalized audio amplitude values between 0 and 1
 */
export type NormalizedAmplitude = number;

/**
 * Array of normalized amplitude values representing waveform data
 * Each value should be between 0 and 1, where 0 represents silence and 1 represents maximum amplitude
 */
export type WaveformData = readonly NormalizedAmplitude[];

/**
 * Available easing function types for animations
 * - 'linear': Constant speed
 * - 'ease': Slow start, then fast, then slow end (default)
 * - 'ease-in': Slow start, then fast end
 * - 'ease-out': Fast start, then slow end
 * - 'ease-in-out': Slow start and end, fast middle
 * - 'cubic-bezier': Custom curve defined by four parameters
 * - [number, number, number, number]: Direct cubic-bezier parameters (x1, y1, x2, y2)
 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | [number, number, number, number]; // cubic-bezier parameters: x1, y1, x2, y2

/**
 * Props for the Waveform container component
 */
export interface WaveformProps {
  /**
   * Array of normalized amplitude values (0-1) representing the audio waveform
   */
  dataPoints: WaveformData;

  /**
   * Percentage of the waveform that has been rendered (0-100)
   * Useful for progressive loading animations
   * @deprecated Use progress instead
   */
  completionPercentage?: number;

  /**
   * Enable lazy loading of the waveform - only renders when visible in viewport
   * @default false
   */
  lazyLoad?: boolean;

  /**
   * Duration in seconds for the transition/animation effects
   * @default 1
   */
  transitionDuration?: number;

  /**
   * Easing function to use for animations
   * @default [0.1, 0.9, 0.2, 1.0] (snappy cubic-bezier)
   */
  easing?: EasingFunction;

  /**
   * Current playback progress between 0 and 1
   * Used for progress visualization and accessibility
   * @default 0
   */
  progress?: number;

  /**
   * Callback when the waveform is clicked
   * @param percentage - Position clicked as percentage (0-1)
   * @param event - Original mouse event
   */
  onClick?: (
    percentage: number,
    event: React.MouseEvent<SVGSVGElement>
  ) => void;

  /**
   * Callback during drag operations on the waveform
   * @param percentage - Current drag position as percentage (0-1)
   * @param event - Original mouse event
   */
  onDrag?: (percentage: number, event: React.MouseEvent<SVGSVGElement>) => void;

  /**
   * Callback when drag operation starts
   * @param event - Original mouse event
   */
  onDragStart?: (event: React.MouseEvent<SVGSVGElement>) => void;

  /**
   * Callback when drag operation ends
   * @param event - Original mouse event
   */
  onDragEnd?: (event: React.MouseEvent<SVGSVGElement>) => void;

  /**
   * CSS class name to apply to the SVG element
   */
  className?: string;

  /**
   * Whether animation should be enabled
   * @default true
   */
  shouldAnimate?: boolean;

  /**
   * Keyboard event handler for accessibility
   * @param event - Original keyboard event
   */
  onKeyDown?: (event: React.KeyboardEvent<SVGSVGElement>) => void;

  /**
   * When true, default styles are not applied
   * @default false
   */
  unstyled?: boolean;

  /**
   * Child components to render inside the waveform
   * Should include Bars, Path, or Progress components
   */
  children: React.ReactNode;
}

/**
 * Waveform container component
 *
 * Renders an SVG-based audio waveform visualization with customizable appearance and behaviors.
 * This is the main container that manages waveform data, interactions, and rendering context.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Waveform dataPoints={audioData}>
 *   <Bars />
 * </Waveform>
 *
 * // With progress indicator
 * <Waveform
 *   dataPoints={audioData}
 *   progress={0.5}
 *   onClick={(position) => setProgress(position)}
 * >
 *   <Bars />
 *   <Progress />
 * </Waveform>
 *
 * // With path-based rendering instead of bars
 * <Waveform dataPoints={audioData}>
 *   <Path type="line" smooth={true} />
 * </Waveform>
 * ```
 */
export const Waveform = forwardRef<SVGSVGElement, WaveformProps>(
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
      transitionDuration = 1,
      // Default easing function: snappy.
      easing = [0.1, 0.9, 0.2, 1.0],
      children,
    },
    forwardedRef
  ) => {
    // If the component is used with a ref, use that ref, otherwise use an internal ref
    const hasForwardedRef =
      typeof forwardedRef === 'object' && forwardedRef !== null;
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
    useStyles({ unstyled, easing });

    // Check if there is a Progress component
    const hasProgress = React.useMemo(
      () => hasProgressComponent(children),
      [children]
    );

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
      [
        className,
        eventHandlers,
        isClient,
        shouldRender,
        hasInteractions,
        progress,
      ]
    );

    // Memoize WaveformProvider props to reduce prop calculations on each render
    const providerProps = React.useMemo(
      () => ({
        dataPoints,
        svgRef,
        hasProgress,
        isStyled: !unstyled,
        transitionDuration,
        easing,
      }),
      [dataPoints, svgRef, hasProgress, unstyled, transitionDuration, easing]
    );

    return (
      <WaveformProvider {...providerProps}>
        <WaveformSVG
          isClient={isClient}
          shouldRender={shouldRender}
          svgAttributes={svgAttributes}
          svgRef={svgRef}
        >
          {children}
        </WaveformSVG>
      </WaveformProvider>
    );
  }
);

Waveform.displayName = 'Waveform';
