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
}
declare const Waveform: ({ data, thickness }: WaveformProps) => react_jsx_runtime.JSX.Element;

export { Waveform };
