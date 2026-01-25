// Export components directly (don't import from exports.ts)

import { Bars } from "./components/bars";
import { default as Path } from "./components/path";
import { Progress } from "./components/progress";
import { Waveform as WaveformComponent } from "./waveform";

export const Waveform = {
  Container: WaveformComponent,
  Bars,
  Progress,
  Path,
};

export type { BarsHandle, BarsProps } from "./components/bars";
export type { BarRadius, PathHandle, PathProps, RenderType } from "./components/path";
export type { GradientStop, ProgressHandle, ProgressProps } from "./components/progress";
export type { UseAudioProgressOptions } from "./hooks/use-audio-progress";
// Export hooks
export { useAudioProgress } from "./hooks/use-audio-progress";
// Export types explicitly
export type { EasingFunction, WaveformData, WaveformProps } from "./waveform";
