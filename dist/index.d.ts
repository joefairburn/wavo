import React from 'react';

interface WaveformProps {
    dataPoints: number[];
    gap: number;
    width: number;
    completionPercentage?: number;
    lazyLoad?: boolean;
    animationSpeed?: number;
}
declare function Waveform({ dataPoints, gap, width, completionPercentage, lazyLoad, animationSpeed, }: WaveformProps): React.JSX.Element;

export { Waveform as default };
