import React, { useRef, useState } from 'react';
import Waveform from 'wavo';
import { musicFile, dataPoints } from '@docs/fixtures/data';

const WavoExample = () => {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  type BarRadius = 0 | 1 | 2 | 3 | 4 | 5;
  const [controls, setControls] = useState({ gap: 2, width: 2, color: '#f23d75', radius: 2 as BarRadius });

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

  return (
    <div
      className="h-24 w-full flex flex-row items-center justify-center gap-4 p-4"
      style={{ '--wavo-progress-color': controls.color } as React.CSSProperties}
    >
      <audio ref={audioRef} controls className="hidden" src={musicFile} onTimeUpdate={handleTimeUpdate} />
      <Waveform.Container
        className="w-full h-full focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 focus-visible:ring-opacity-75 rounded-lg"
        dataPoints={dataPoints}
        lazyLoad={true}
        progress={progress}
        onClick={handleClick}
        onDrag={handleClick}
        onDragStart={() => audioRef.current?.pause()}
        onDragEnd={() => audioRef.current?.play()}
        onKeyDown={handleKeyDown}
      >
        <Waveform.PathBars width={controls.width} gap={controls.gap} radius={controls.radius} />
        <Waveform.Progress color="var(--wavo-progress-color)" progress={progress} />
      </Waveform.Container>
      <div className="flex flex-col gap-2">
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
          />
        </div>
      </div>
    </div>
  );
};

export default WavoExample;
