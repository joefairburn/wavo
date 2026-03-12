import { dataPoints, musicFile } from "@docs/fixtures/data";
import { useRef, useState, useEffect } from "react";
import { Waveform, useAudioProgress, type ProgressHandle } from "wavo";

function formatTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const AccessiblePlayerDemo = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<ProgressHandle>(null);
  const wasPlayingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const updateProgress = useAudioProgress({
    audioRef,
    progressRef,
    onProgressUpdate: setProgress,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      setAnnouncement("Playing audio");
    };
    const handlePause = () => {
      setIsPlaying(false);
      setAnnouncement("Paused");
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setAnnouncement("Audio ended");
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
      setAnnouncement(`Seeked to ${Math.round(percentage * 100)}%`);
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
      case "Enter":
        togglePlayback();
        event.preventDefault();
        break;
      case "Home":
        handleSeek(0);
        event.preventDefault();
        break;
      case "End":
        handleSeek(1);
        event.preventDefault();
        break;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="border-2 border-white/10 bg-[#0a0a0a]">
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* biome-ignore lint/a11y/useMediaCaption: Demo audio */}
      <audio ref={audioRef} src={musicFile} preload="metadata" />

      {/* Header */}
      <div className="border-b border-white/10 bg-[#1a1a1a] px-6 py-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Accessible Audio Player
        </span>
      </div>

      {/* Waveform */}
      <div className="relative h-[140px] w-full bg-black px-4">
        <Waveform.Container
          className="h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f96706] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
              audioRef.current?.play();
            }
          }}
          onKeyDown={handleKeyDown}
        >
          <Waveform.Bars width={3} gap={2} radius={1} />
          <Waveform.Progress ref={progressRef} color="#f96706" />
        </Waveform.Container>
      </div>

      {/* Controls */}
      <div className="border-t border-white/10 bg-[#111] p-4">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f96706] text-black transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f96706] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] active:scale-95"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <title>Pause</title>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Play</title>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <div className="flex-1">
            <div
              className="font-mono text-sm text-white"
              aria-label={`${formatTime(progress * duration)} of ${formatTime(duration)}`}
            >
              {formatTime(progress * duration)}
              <span className="mx-2 text-white/30" aria-hidden="true">
                /
              </span>
              <span className="text-white/50">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="mt-4 border border-white/10 bg-[#151515] p-3">
          <h2 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white/30">
            Keyboard Controls
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-white/50">
            <li>
              <kbd className="rounded bg-white/10 px-1">Space</kbd> /{" "}
              <kbd className="rounded bg-white/10 px-1">Enter</kbd> Play/Pause
            </li>
            <li>
              <kbd className="rounded bg-white/10 px-1">←</kbd> Seek backward 5%
            </li>
            <li>
              <kbd className="rounded bg-white/10 px-1">→</kbd> Seek forward 5%
            </li>
            <li>
              <kbd className="rounded bg-white/10 px-1">Home</kbd> Go to start
            </li>
            <li>
              <kbd className="rounded bg-white/10 px-1">End</kbd> Go to end
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessiblePlayerDemo;
