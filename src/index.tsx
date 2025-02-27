// Re-export everything from exports.ts
export * from './exports';

// For backward compatibility
import { Waveform, Bars, Progress } from './exports';
const components = { Container: Waveform, Bars, Progress };
export default components;
