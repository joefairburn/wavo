import * as react_jsx_runtime from 'react/jsx-runtime';

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
declare function FontRenderer({ data, thickness, gap }: WaveformProps): react_jsx_runtime.JSX.Element;

interface WaveformAsSVGProps {
    dataPoints: number[];
    gap: number;
    width: number;
}
declare function WaveformAsSVG$1({ dataPoints, gap, width, }: WaveformAsSVGProps): react_jsx_runtime.JSX.Element;

declare const WaveformAsFont: typeof FontRenderer;
declare const WaveformAsSVG: typeof WaveformAsSVG$1;

export { WaveformAsFont, WaveformAsSVG };
