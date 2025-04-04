import { dataPoints, musicFile } from '@docs/fixtures/data';
import React, { useRef, useState } from 'react';
import Waveform, { type EasingFunction } from 'wavo';

const WavoExample = () => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;
  type RenderType = 'bar' | 'line';

  const [controls, setControls] = useState({
    gap: 2,
    width: 2,
    color: '#f23d75',
    radius: 2 as BarRadius,
    type: 'bar' as RenderType,
    transitionDuration: 2,
    easing: [0.1, 0.9, 0.2, 1.0] as EasingFunction,
  });

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(percentage);
    }
  };

  const handleClick = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percentage;
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
    <div className="h-24 w-full flex flex-row items-center justify-center gap-4 p-4" style={cssVariables}>
      <audio ref={audioRef} controls className="hidden" src={musicFile} onTimeUpdate={handleTimeUpdate} />
      <Waveform.Container
        className="w-full !h-full focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 focus-visible:ring-opacity-75 rounded-lg"
        dataPoints={dataPoints}
        lazyLoad={true}
        progress={progress}
        onClick={handleClick}
        onDrag={handleClick}
        onDragStart={() => audioRef.current?.pause()}
        onDragEnd={() => audioRef.current?.play()}
        onKeyDown={handleKeyDown}
        transitionDuration={controls.transitionDuration}
        easing={controls.easing}
      >
        {/* <Waveform.Path type={controls.type} width={controls.width} gap={controls.gap} radius={controls.radius} /> */}
        <Waveform.Bars width={controls.width} gap={controls.gap} radius={controls.radius} />
        <Waveform.Progress progress={progress} color={controls.color} />
      </Waveform.Container>
      <div className="flex flex-col gap-2 min-w-[220px]">
        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium" htmlFor="type">
            Type
          </label>
          <select
            value={controls.type}
            onChange={e => setControls({ ...controls, type: e.target.value as RenderType })}
            className="w-20 p-1 text-sm border rounded"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium" htmlFor="color">
            Color
          </label>
          <input
            className="w-16"
            type="color"
            value={controls.color}
            onChange={e => setControls({ ...controls, color: e.target.value })}
          />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium" htmlFor="gap">
            Gap
          </label>
          <input
            className="w-16"
            type="range"
            min="1"
            max="10"
            value={controls.gap}
            onChange={e => setControls({ ...controls, gap: parseInt(e.target.value) })}
          />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium" htmlFor="width">
            Width
          </label>
          <input
            className="w-16"
            type="range"
            min="1"
            max="10"
            value={controls.width}
            onChange={e => setControls({ ...controls, width: parseInt(e.target.value) })}
          />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <label className="text-sm font-medium" htmlFor="radius">
            Radius
          </label>
          <input
            className="w-16"
            type="range"
            min="0"
            max="5"
            value={controls.radius}
            onChange={e => {
              const value = parseInt(e.target.value);
              const radius = (value >= 0 && value <= 5 ? value : 2) as BarRadius;
              setControls({ ...controls, radius });
            }}
            disabled={controls.type === 'line'}
          />
        </div>
      </div>
    </div>
  );
};

export default WavoExample;
