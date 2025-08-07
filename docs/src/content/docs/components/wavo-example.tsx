import { dataPoints, musicFile } from '@docs/fixtures/data';
import type React from 'react';
import { useRef, useState } from 'react';
import {
  type BarRadius,
  type EasingFunction,
  type ProgressHandle,
  type RenderType,
  useAudioProgress,
  Waveform,
} from 'wavo';
import ResizableContainer from '../../../components/resizable-container';

const WavoExample = () => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef1 = useRef<ProgressHandle>(null);
  const progressRef2 = useRef<ProgressHandle>(null);

  const [controls, setControls] = useState({
    gap: 2,
    width: 2,
    color: '#f23d75',
    radius: 2 as BarRadius,
    type: 'bar' as RenderType,
    smooth: true,
    transitionDuration: 2,
    easing: [0.1, 0.9, 0.2, 1.0] as EasingFunction,
  });

  // Use the audio progress hooks for 60fps updates (one per progress component)
  const updateProgress1 = useAudioProgress({
    audioRef,
    progressRef: progressRef1,
    onProgressUpdate: setProgress,
  });

  const updateProgress2 = useAudioProgress({
    audioRef,
    progressRef: progressRef2,
  });

  const handleClick = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percentage;
      // Use the manual update functions for responsive seeking
      updateProgress1(percentage);
      updateProgress2(percentage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const STEP = 0.05; // 5% increment/decrement

    switch (event.key) {
      case 'ArrowLeft':
        handleClick(Math.max(0, progress - STEP));
        event.preventDefault();
        break;
      case 'ArrowRight':
        handleClick(Math.min(1, progress + STEP));
        event.preventDefault();
        break;
      case ' ':
        event.preventDefault();
        if (audioRef.current?.paused) {
          audioRef.current.play();
        } else {
          audioRef.current?.pause();
        }
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  // Define all CSS variables needed
  const cssVariables = {
    '--wavo-bar-color': '#333333',
    '--wavo-bar-color-progress': controls.color,
    '--wavo-bar-width': `${controls.width}px`,
    '--wavo-bar-gap': `${controls.gap}px`,
    '--wavo-transition-duration': `${controls.transitionDuration}s`,
  } as React.CSSProperties;

  return (
    <div
      className="flex h-auto w-full flex-col items-center justify-center gap-4 p-4"
      style={cssVariables}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: Demo music file doesn't need captions */}
      <audio
        aria-label="Background music for waveform demo (no captions needed)"
        className="hidden"
        controls
        ref={audioRef}
        src={musicFile}
      />

      <ResizableContainer initialHeight={100} initialWidth={700}>
        <Waveform.Container
          className="!h-full w-full rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 focus-visible:ring-opacity-75"
          dataPoints={dataPoints}
          easing={controls.easing}
          lazyLoad={true}
          onClick={handleClick}
          onDrag={handleClick}
          onDragEnd={() => audioRef.current?.play()}
          onDragStart={() => audioRef.current?.pause()}
          onKeyDown={handleKeyDown}
          progress={progress}
          transitionDuration={controls.transitionDuration}
        >
          {controls.type === 'bar' && (
            <Waveform.Bars
              gap={controls.gap}
              radius={controls.radius}
              width={controls.width}
            />
          )}
          {controls.type === 'line' && (
            <Waveform.Path
              gap={controls.gap}
              radius={controls.radius}
              smooth={controls.smooth}
              type={controls.type}
              width={controls.width}
            />
          )}
          <Waveform.Progress color={controls.color} ref={progressRef1} />
        </Waveform.Container>
      </ResizableContainer>

      <ResizableContainer initialHeight={100} initialWidth={700}>
        <Waveform.Container
          className="!h-full w-full rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 focus-visible:ring-opacity-75"
          dataPoints={dataPoints}
          easing={controls.easing}
          lazyLoad={true}
          onClick={handleClick}
          onDrag={handleClick}
          onDragEnd={() => audioRef.current?.play()}
          onDragStart={() => audioRef.current?.pause()}
          onKeyDown={handleKeyDown}
          progress={progress}
          transitionDuration={controls.transitionDuration}
        >
          <Waveform.Path
            gap={controls.gap}
            radius={controls.radius}
            smooth={controls.smooth}
            type={controls.type}
            width={controls.width}
          />
          <Waveform.Progress color={controls.color} ref={progressRef2} />
        </Waveform.Container>
      </ResizableContainer>

      <div className="mt-4 flex flex-row flex-wrap items-center justify-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-sm" htmlFor="type">
            Type
          </label>
          <select
            className="w-20 rounded border p-1 text-sm"
            onChange={(e) =>
              setControls({ ...controls, type: e.target.value as RenderType })
            }
            value={controls.type}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </div>

        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-sm" htmlFor="color">
            Color
          </label>
          <input
            className="w-16"
            onChange={(e) =>
              setControls({ ...controls, color: e.target.value })
            }
            type="color"
            value={controls.color}
          />
        </div>

        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-sm" htmlFor="gap">
            Gap
          </label>
          <input
            className="w-16"
            max="10"
            min="1"
            onChange={(e) =>
              setControls({
                ...controls,
                gap: Number.parseInt(e.target.value, 10),
              })
            }
            type="range"
            value={controls.gap}
          />
        </div>

        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-sm" htmlFor="width">
            Width
          </label>
          <input
            className="w-16"
            max="10"
            min="1"
            onChange={(e) =>
              setControls({
                ...controls,
                width: Number.parseInt(e.target.value, 10),
              })
            }
            type="range"
            value={controls.width}
          />
        </div>

        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-sm" htmlFor="radius">
            Radius
          </label>
          <input
            className="w-16"
            disabled={controls.type === 'line'}
            max="5"
            min="0"
            onChange={(e) => {
              const value = Number.parseInt(e.target.value, 10);
              const radius = (
                value >= 0 && value <= 5 ? value : 2
              ) as BarRadius;
              setControls({ ...controls, radius });
            }}
            type="range"
            value={controls.radius}
          />
        </div>

        {controls.type === 'line' && (
          <div className="flex flex-row items-center gap-2">
            <label className="font-medium text-sm" htmlFor="smooth">
              Smooth
            </label>
            <input
              checked={controls.smooth}
              onChange={(e) =>
                setControls({ ...controls, smooth: e.target.checked })
              }
              type="checkbox"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WavoExample;
