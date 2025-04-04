// Re-export everything from exports.ts
export * from './exports';

// For backward compatibility
import { Container, Bars, Progress, Path } from './exports';
const components = { Container, Bars, Progress, Path };
export default components;
