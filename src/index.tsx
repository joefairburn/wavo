// Export components directly (don't import from exports.ts)

import { Bars } from './components/bars';
import { default as Path } from './components/path';
import { Progress } from './components/progress';
import { Waveform as WaveformComponent } from './waveform';

export const Waveform = {
  Container: WaveformComponent,
  Bars,
  Progress,
  Path,
};

export type { BarsProps } from './components/bars';
export type { BarRadius, PathProps, RenderType } from './components/path';
// Export types explicitly
export type { EasingFunction, WaveformData, WaveformProps } from './waveform';
