import React from 'react';
import { useWaveform } from '../contexts/WaveformContext';

export interface WaveformSVGProps {
  svgRef: React.RefObject<SVGSVGElement>;
  children: React.ReactNode;
  shouldRender: boolean;
  isClient: boolean;
  svgAttributes: React.SVGAttributes<SVGSVGElement> & {
    'data-wavo-svg'?: string;
    'data-wavo-animate'?: string;
  };
}

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
    <svg ref={svgRef} {...otherAttributes} style={mergedStyle}>
      {/* Only render children if the component is visible and the SVG is mounted. */}
      {isClient && shouldRender && children}
    </svg>
  );
};

export default WaveformSVG;
