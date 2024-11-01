import React from 'react';

interface WaveformProps {
    dataPoints: number[];
    gap: number;
    width: number;
    completionPercentage?: number;
}
declare function Waveform({ dataPoints, gap, width, completionPercentage }: WaveformProps): React.JSX.Element | null;

export { Waveform as default };
