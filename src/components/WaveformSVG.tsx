import React from 'react';

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
  return (
    <svg ref={svgRef} {...svgAttributes}>
      {/* Only render children if the component is visible and the SVG is mounted. */}
      {isClient && shouldRender && children}
    </svg>
  );
};

export default WaveformSVG;
