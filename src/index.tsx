// Export components directly (don't import from exports.ts)
import { Waveform as WaveformComponent } from './Waveform';
import { Bars } from './components/Bars';
import { Progress } from './components/Progress';
import { default as Path } from './components/Path';

export const Waveform = {
  Container: WaveformComponent,
  Bars,
  Progress,
  Path,
};

// Export types explicitly
export type { EasingFunction, WaveformData, WaveformProps } from './Waveform';
export type { BarsProps } from './components/Bars';
export type { BarRadius, PathProps, RenderType } from './components/Path';
