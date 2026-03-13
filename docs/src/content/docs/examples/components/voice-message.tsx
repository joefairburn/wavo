import { dataPoints, musicFile } from "@docs/fixtures/data";
import { useRef, useState, useEffect } from "react";
import { Waveform, useAudioProgress } from "wavo";

function formatTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const VoiceMessageDemo = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
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
    <div className="mx-auto max-w-md">
      {/* biome-ignore lint/a11y/useMediaCaption: Demo audio */}
      <audio ref={audioRef} src={musicFile} preload="metadata" />

      {/* Voice Message Bubble */}
      <div className="flex gap-3 rounded-2xl rounded-bl-sm bg-[#1a1a1a] p-3">
        {/* Play Button */}
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f96706]"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="white" viewBox="0 0 24 24">
              <title>Pause</title>
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="h-4 w-4 ml-0.5" fill="white" viewBox="0 0 24 24">
              <title>Play</title>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Waveform and Time */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-8">
            <Waveform
              className="h-full w-full"
              dataPoints={dataPoints}
              progress={progress}
              onClick={handleSeek}
              onDrag={handleSeek}
            >
              <Waveform.Bars width={2} gap={1} radius={1} />
              <Waveform.Progress ref={progressRef} color="#f96706" />
            </Waveform>
          </div>
          <div className="font-mono text-[10px] text-white/50">
            {formatTime(isPlaying ? progress * duration : duration)}
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-1 text-right font-mono text-[10px] text-white/30">12:34 PM</div>
    </div>
  );
};

export default VoiceMessageDemo;
