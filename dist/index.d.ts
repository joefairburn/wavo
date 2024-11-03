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
}
declare function Waveform({ dataPoints, gap, width, completionPercentage, lazyLoad, animationSpeed, progress, onClick, onDrag, onDragStart, onDragEnd, className, }: WaveformProps): React.JSX.Element;

export { Waveform as default };
