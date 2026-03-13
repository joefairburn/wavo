import { Bars } from "./components/bars";
import { default as Path } from "./components/path";
import { Progress } from "./components/progress";
import { Waveform as WaveformComponent } from "./waveform";

/**
 * Main Waveform component with compound sub-components.
 *
 * Can be used directly as a component (`<Waveform dataPoints={data} />`)
 * or with sub-components for advanced customization:
 * - `<Waveform.Bars />` — Bar-based visualization
 * - `<Waveform.Path />` — Path/line-based visualization
 * - `<Waveform.Progress />` — Progress overlay
 */
const Waveform = Object.assign(WaveformComponent, {
  /** @deprecated Use `<Waveform>` directly instead of `<Waveform.Container>` */
  Container: WaveformComponent,
  Bars,
  Progress,
  Path,
});

export { Waveform };

// Direct named exports for convenience
export { Bars } from "./components/bars";
export { default as Path } from "./components/path";
export { Progress } from "./components/progress";

export type { BarsHandle, BarsProps } from "./components/bars";
export type { BarRadius, PathHandle, PathProps } from "./components/path";
export type { GradientStop, ProgressHandle, ProgressProps } from "./components/progress";
export type { UseAudioProgressOptions, UseAudioProgressReturn } from "./hooks/use-audio-progress";
export { useAudioProgress } from "./hooks/use-audio-progress";
export type { EasingFunction, WaveformData, WaveformProps } from "./waveform";
