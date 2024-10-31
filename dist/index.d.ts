import React from 'react';

interface WaveformProps {
    /** The waveform data as a string of numbers */
    data: string;
    /**
     * Controls the thickness of the waveform lines
     * @default 50
     * @min 1
     * @max 100
     */
    thickness?: number;
    /**
     * Controls the gap between the waveform lines
     * @default 0
     * @min 0
     * @max 1
     */
    gap?: number;
}
declare function FontRenderer({ data, thickness, gap }: WaveformProps): React.JSX.Element;

interface WaveformAsSVGProps$1 {
    dataPoints: number[];
    gap: number;
    width: number;
    completionPercentage?: number;
}
declare function WaveformAsSVG$1({ dataPoints, gap, width, completionPercentage, }: WaveformAsSVGProps$1): React.JSX.Element | null;

interface WaveformAsSVGProps {
    dataPoints: number[];
    gap: number;
    width: number;
    completionPercentage?: number;
}
declare function WaveformAsPath$1({ dataPoints, gap, width, completionPercentage, }: WaveformAsSVGProps): React.JSX.Element | null;

declare const WaveformAsFont: typeof FontRenderer;
declare const WaveformAsSVG: typeof WaveformAsSVG$1;
declare const WaveformAsPath: typeof WaveformAsPath$1;

export { WaveformAsFont, WaveformAsPath, WaveformAsSVG };
