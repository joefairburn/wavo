// Re-export the Path component and its types from Path.tsx
import { Path, type PathProps, type RenderType, type BarRadius } from './Path';

export { Path };
export type { PathProps, RenderType, BarRadius };

// Also export as default for backward compatibility
export default Path;
