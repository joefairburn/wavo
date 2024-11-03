import React from 'react';

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
    shouldAnimate?: boolean;
}
declare const Waveform: React.ForwardRefExoticComponent<WaveformProps & React.RefAttributes<SVGSVGElement>>;

export { Waveform as default };
