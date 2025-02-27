// Re-export everything from exports.ts
export * from './exports';

// For backward compatibility
import { Waveform, BarsContainer, Progress } from './exports';
const components = { Container: Waveform, Bars: BarsContainer, Progress };
export default components;
