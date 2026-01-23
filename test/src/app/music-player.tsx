"use client";

import { useRef, useState } from "react";
import { type ProgressHandle, Waveform } from "wavo";

export default function MusicPlayer({
  src,
  waveformJson,
  id,
}: {
  src: string;
  waveformJson: string;
  id: string;
}) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<ProgressHandle>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(percentage);
      // Update progress via ref for better performance
      progressRef.current?.setProgress(percentage);
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
      case "ArrowLeft":
        handleClick(Math.max(0, progress - STEP));
        event.preventDefault();
        break;
      case "ArrowRight":
        handleClick(Math.min(1, progress + STEP));
        event.preventDefault();
        break;
      case " ":
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

  return (
    <div
      className="flex h-24 w-full flex-row items-center justify-center gap-4 p-4"
      data-testid="music-player"
      key={id}
      style={{ "--wavo-progress-color": "#f23d75" } as React.CSSProperties}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: Test music file doesn't need captions */}
      <audio className="mb-2" controls onTimeUpdate={handleTimeUpdate} ref={audioRef} src={src} />
      <Waveform.Container
        className="h-full w-full rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300"
        dataPoints={JSON.parse(waveformJson)}
        lazyLoad={true}
        onClick={handleClick}
        onDrag={handleClick}
        onDragEnd={() => audioRef.current?.play()}
        onDragStart={() => audioRef.current?.pause()}
        onKeyDown={handleKeyDown}
        progress={progress}
      >
        <Waveform.Bars gap={2} width={2} />
        <Waveform.Progress color="var(--wavo-progress-color)" ref={progressRef} />
      </Waveform.Container>
    </div>
  );
}
