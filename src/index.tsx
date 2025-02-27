import { BarsContainer } from './components/Bars';
import { Progress } from './components/Progress';
import Waveform from './Waveform';

// Re-export the components
export { Waveform, BarsContainer, Progress };

// Also export the types
export type { WaveformProps } from './Waveform';
export type { BarsProps } from './components/Bars';

// For backward compatibility
const components = { Container: Waveform, Bars: BarsContainer, Progress };
export default components;
