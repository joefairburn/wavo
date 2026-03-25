"use client";

import { dataPoints, musicFile } from "@docs/fixtures/data";
import { useRef, useState, useEffect } from "react";
import { Waveform, useAudioProgress } from "wavo";

function formatTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const AudioPlayerDemo = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const { ref: progressRef, update: updateProgress } = useAudioProgress({
    audioRef,
    onProgressUpdate: setProgress,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleSeek = (percentage: number) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = duration * percentage;
      updateProgress(percentage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const STEP = 0.05;
    switch (event.key) {
      case "ArrowLeft":
        handleSeek(Math.max(0, progress - STEP));
        event.preventDefault();
        break;
      case "ArrowRight":
        handleSeek(Math.min(1, progress + STEP));
        event.preventDefault();
        break;
      case " ":
        togglePlayback();
        event.preventDefault();
        break;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play();
      }
    }
  };

  return (
    <div className="border-2 border-white/10 bg-[#0a0a0a]">
      {/* biome-ignore lint/a11y/useMediaCaption: Demo audio */}
      <audio ref={audioRef} src={musicFile} preload="metadata" />

      {/* Waveform */}
      <div className="relative h-[140px] w-full bg-black px-4">
        <Waveform
          className="h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f96706]"
          dataPoints={dataPoints}
          progress={progress}
          onClick={handleSeek}
          onDrag={handleSeek}
          onDragStart={() => {
            wasPlayingRef.current = !audioRef.current?.paused;
            audioRef.current?.pause();
          }}
          onDragEnd={() => {
            if (wasPlayingRef.current) {
              void audioRef.current?.play();
            }
          }}
          onKeyDown={handleKeyDown}
        >
          <Waveform.Bars width={3} gap={2} radius={1} />
          <Waveform.Progress ref={progressRef} color="#f96706" />
        </Waveform>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 border-t border-white/10 bg-[#111] p-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f96706] text-black transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <title>Pause</title>
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <title>Play</title>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Time Display */}
        <div className="flex-1">
          <div className="font-mono text-sm text-white">
            {formatTime(progress * duration)}
            <span className="mx-2 text-white/30">/</span>
            <span className="text-white/50">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Info */}
        <div className="font-mono text-[10px] uppercase text-white/30">Click or drag to seek</div>
      </div>
    </div>
  );
};

export default AudioPlayerDemo;
