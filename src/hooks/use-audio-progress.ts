import { useCallback, useEffect, useRef } from "react";
import type { ProgressHandle } from "../components/progress";

/**
 * Audio source interface that provides current time and duration
 */
export interface AudioSource {
  currentTime: number;
  duration: number;
  paused?: boolean;
  ended?: boolean;
}

/**
 * Options for the useAudioProgress hook
 */
export interface UseAudioProgressOptions {
  /**
   * Audio element reference (HTMLAudioElement)
   */
  audioRef?: React.RefObject<HTMLAudioElement | null>;

  /**
   * Custom audio source (for Web Audio API, etc.)
   * Should provide currentTime, duration, and optionally paused/ended
   */
  audioSource?: AudioSource;

  /**
   * Progress component reference to update
   */
  progressRef: React.RefObject<ProgressHandle | null>;

  /**
   * Optional callback for progress updates (for state synchronization)
   */
  onProgressUpdate?: (progress: number) => void;

  /**
   * Whether to enable 60fps updates (default: true)
   */
  enableHighFrequency?: boolean;

  /**
   * For custom audio sources, manually control when to start/stop updates
   * If not provided, will attempt to use audio element events
   */
  isPlaying?: boolean;
}

/**
 * Custom hook that handles 60fps audio progress updates using requestAnimationFrame
 *
 * Automatically manages the RAF loop lifecycle based on audio play/pause/ended events
 * and updates multiple progress refs efficiently without causing React re-renders.
 *
 * @param options Configuration options
 *
 * @example
 * ```tsx
 * const audioRef = useRef<HTMLAudioElement>(null);
 * const progressRef1 = useRef<ProgressHandle>(null);
 * const progressRef2 = useRef<ProgressHandle>(null);
 * const [progress, setProgress] = useState(0);
 *
 * useAudioProgress({
 *   audioRef,
 *   progressRefs: [progressRef1, progressRef2],
 *   onProgressUpdate: setProgress, // Optional: sync with React state
 * });
 *
 * // Now progress updates automatically at 60fps!
 * <audio ref={audioRef} src="music.mp3" controls />
 * <Waveform>
 *   <Bars />
 *   <Progress ref={progressRef1} color="#f00" />
 * </Waveform>
 * ```
 */
export function useAudioProgress({
  audioRef,
  audioSource,
  progressRef,
  onProgressUpdate,
  enableHighFrequency = true,
  isPlaying,
}: UseAudioProgressOptions) {
  const rafRef = useRef<number | undefined>(undefined);
  // Frame counter for deterministic throttling of onProgressUpdate callback
  const frameCountRef = useRef(0);

  // 60fps progress update loop using requestAnimationFrame
  const updateProgress = useCallback(() => {
    let source: AudioSource | null = null;
    let shouldPlay = false;

    // Determine audio source and playing state
    if (audioRef?.current) {
      source = audioRef.current;
      shouldPlay = !(audioRef.current.paused || audioRef.current.ended);
    } else if (audioSource) {
      source = audioSource;
      shouldPlay = isPlaying ?? !(audioSource.paused || audioSource.ended);
    }

    if (source && shouldPlay && source.duration) {
      const percentage = source.currentTime / source.duration;

      // Update progress ref for smooth visual progress
      progressRef.current?.setProgress(percentage);

      // Optional state callback (called every 6th frame ~10fps to avoid excessive re-renders)
      // Using deterministic frame counter instead of Math.random() for predictable behavior
      frameCountRef.current++;
      if (onProgressUpdate && frameCountRef.current % 6 === 0) {
        onProgressUpdate(percentage);
      }
    }

    // Continue the animation loop
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [audioRef, audioSource, progressRef, onProgressUpdate, isPlaying]);

  // Start/stop the animation loop based on audio state
  useEffect(() => {
    if (!enableHighFrequency) {
      return;
    }

    const startLoop = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    const stopLoop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };

    // Handle HTMLAudioElement with events
    if (audioRef?.current) {
      const audio = audioRef.current;

      audio.addEventListener("play", startLoop);
      audio.addEventListener("pause", stopLoop);
      audio.addEventListener("ended", stopLoop);

      // Start loop immediately if audio is already playing
      if (!audio.paused) {
        startLoop();
      }

      return () => {
        audio.removeEventListener("play", startLoop);
        audio.removeEventListener("pause", stopLoop);
        audio.removeEventListener("ended", stopLoop);
        stopLoop();
      };
    }

    // Handle custom audio source with manual isPlaying control
    if (audioSource) {
      if (isPlaying) {
        startLoop();
      } else {
        stopLoop();
      }

      return () => {
        stopLoop();
      };
    }
  }, [audioRef, audioSource, updateProgress, enableHighFrequency, isPlaying]);

  // Return a manual update function for seeking, etc.
  return useCallback(
    (percentage: number) => {
      // Immediately update progress ref
      progressRef.current?.setProgress(percentage);

      // Update state if callback provided
      if (onProgressUpdate) {
        onProgressUpdate(percentage);
      }
    },
    [progressRef, onProgressUpdate],
  );
}
