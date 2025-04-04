import React, { createContext, useContext, useId } from 'react';
import { WaveformData, EasingFunction } from '../Waveform';

/**
 * Props for the WaveformContext provider component
 */
export interface WaveformContextProps {
  /**
   * Array of normalized amplitude values representing the audio waveform
   */
  dataPoints: WaveformData;

  /**
   * Reference to the SVG element that contains the waveform
   */
  svgRef: React.RefObject<SVGSVGElement>;

  /**
   * Whether a Progress component is present as a child
   * Used to determine if gradient styling should be applied
   */
  hasProgress: boolean;

  /**
   * Whether default styling should be applied
   */
  isStyled: boolean;

  /**
   * Duration in seconds for transition animations
   */
  transitionDuration: number;

  /**
   * Easing function to use for animations
   */
  easing: EasingFunction;
}

/**
 * Internal type for the WaveformContext value
 * Extends WaveformContextProps with a unique ID for SVG gradient references
 */
interface WaveformContextType {
  /**
   * Array of normalized amplitude values representing the audio waveform
   */
  dataPoints: WaveformData;

  /**
   * Unique ID used for SVG gradient references
   */
  id: string;

  /**
   * Reference to the SVG element that contains the waveform
   */
  svgRef: React.RefObject<SVGSVGElement> | null;

  /**
   * Whether a Progress component is present as a child
   */
  hasProgress: boolean;

  /**
   * Whether default styling should be applied
   */
  isStyled: boolean;

  /**
   * Duration in seconds for transition animations
   */
  transitionDuration: number;

  /**
   * Easing function to use for animations
   */
  easing: EasingFunction;
}

/**
 * Context that provides waveform configuration and state to child components
 * Used by Bars, Path, and Progress components to access shared waveform data
 */
const WaveformContext = createContext<WaveformContextType | null>(null);

/**
 * Props for the WaveformProvider component
 */
interface WaveformProviderProps {
  /**
   * Child components that will consume the waveform context
   */
  children: React.ReactNode;

  /**
   * Array of normalized amplitude values representing the audio waveform
   */
  dataPoints: WaveformData;

  /**
   * Reference to the SVG element that contains the waveform
   */
  svgRef: React.RefObject<SVGSVGElement>;

  /**
   * Whether a Progress component is present as a child
   */
  hasProgress: boolean;

  /**
   * Whether default styling should be applied
   */
  isStyled: boolean;

  /**
   * Duration in seconds for transition animations
   */
  transitionDuration: number;

  /**
   * Easing function to use for animations
   */
  easing: EasingFunction;
}

/**
 * Provider component that makes waveform data and configuration available to child components
 *
 * @param props - Provider properties including children and waveform configuration
 */
export function WaveformProvider({
  children,
  dataPoints,
  svgRef,
  hasProgress,
  isStyled,
  transitionDuration,
  easing,
}: WaveformProviderProps) {
  // Generate a unique ID for gradient references without colons (which are invalid in SVG IDs)
  const id = useId().replace(/:/g, '');

  return (
    <WaveformContext.Provider value={{ dataPoints, id, svgRef, hasProgress, isStyled, transitionDuration, easing }}>
      {children}
    </WaveformContext.Provider>
  );
}

/**
 * Hook that provides access to the waveform context
 *
 * @returns The waveform context value
 * @throws Error if used outside of a WaveformProvider
 *
 * @example
 * ```tsx
 * function MyWaveformComponent() {
 *   const { dataPoints, svgRef, hasProgress } = useWaveform();
 *   // ...
 * }
 * ```
 */
export function useWaveform() {
  const context = useContext(WaveformContext);
  if (!context) {
    throw new Error('useWaveform must be used within a WaveformProvider');
  }
  return context;
}
