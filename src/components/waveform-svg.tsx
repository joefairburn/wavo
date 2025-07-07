import type React from 'react';
import { useWaveform } from '../contexts/waveform-context';

/**
 * Props for the WaveformSVG component
 */
export interface WaveformSVGProps {
  /**
   * Reference to the SVG element
   * Used for measurements and interactions
   */
  svgRef: React.RefObject<SVGSVGElement>;

  /**
   * Child components to render inside the SVG
   * Typically Bars, Path, and Progress components
   */
  children: React.ReactNode;

  /**
   * Whether children should be rendered
   * Used for lazy loading functionality
   */
  shouldRender: boolean;

  /**
   * Whether the code is running on the client side
   * Prevents SSR issues with browser-specific features
   */
  isClient: boolean;

  /**
   * SVG element attributes
   * Includes standard SVG attributes plus custom data attributes
   */
  svgAttributes: React.SVGAttributes<SVGSVGElement> & {
    /**
     * Marker attribute for styling and identification
     */
    'data-wavo-svg'?: string;

    /**
     * Animation state indicator
     * Used to trigger CSS animations
     */
    'data-wavo-animate'?: string;
  };
}

/**
 * Core SVG container for waveform visualization
 *
 * This component handles the SVG element creation and configuration,
 * including reference management, styling, and conditional rendering.
 * It acts as the actual DOM container for all waveform content.
 *
 * Features:
 * - Manages the SVG reference
 * - Applies transition duration as CSS variable
 * - Conditionally renders children based on client-side state and visibility
 * - Handles SVG attributes including ARIA properties for accessibility
 *
 * @internal Used by the Waveform component, not meant for direct usage
 *
 * @param props - Component props
 * @returns SVG element containing waveform visualization
 */
export const WaveformSVG: React.FC<WaveformSVGProps> = ({
  svgRef,
  children,
  shouldRender,
  isClient,
  svgAttributes,
}) => {
  const { transitionDuration } = useWaveform();

  // Extract existing style if any
  const { style: existingStyle, ...otherAttributes } = svgAttributes;

  // Merge existing style with our CSS variable
  const mergedStyle = {
    ...existingStyle,
    '--wavo-transition-duration': `${transitionDuration}s`,
  } as React.CSSProperties;

  return (
    // Note: Accessibility attributes (aria-label, role, etc.) are provided via otherAttributes from parent Waveform component
    <svg ref={svgRef} {...otherAttributes} style={mergedStyle}>
      <title>Waveform visualization</title>
      {/* Only render children if the component is visible and the SVG is mounted. */}
      {isClient && shouldRender && children}
    </svg>
  );
};

export default WaveformSVG;
