import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioProgress, PROGRESS_UPDATE_FRAME_INTERVAL } from "./use-audio-progress";
import type { ProgressHandle } from "../components/progress";

type Listeners = Record<string, ((...args: unknown[]) => void)[]>;

const createMockAudio = (
  overrides: Record<string, unknown> = {},
): {
  currentTime: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  emit: (event: string) => void;
} => {
  const listeners: Listeners = {};
  return {
    currentTime: 30,
    duration: 60,
    paused: true,
    ended: false,
    addEventListener: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }),
    removeEventListener: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((l) => l !== cb);
      }
    }),
    emit: (event: string) => {
      for (const cb of listeners[event] || []) cb();
    },
    ...overrides,
  };
};

const createRafController = () => {
  let callback: FrameRequestCallback | null = null;
  let id = 0;
  const requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    callback = cb;
    id++;
    return id;
  });
  const cancelAnimationFrame = vi.fn();
  return {
    __raf: { requestAnimationFrame, cancelAnimationFrame },
    tick: () => callback?.(performance.now()),
    requestAnimationFrame,
    cancelAnimationFrame,
  };
};

const createProgressRef = (setProgress = vi.fn()) =>
  ({ current: { setProgress } }) as unknown as React.RefObject<ProgressHandle | null>;

const createAudioRef = (mockAudio: ReturnType<typeof createMockAudio>) =>
  ({ current: mockAudio }) as unknown as React.RefObject<HTMLAudioElement | null>;

describe("useAudioProgress", () => {
  let raf: ReturnType<typeof createRafController>;

  beforeEach(() => {
    raf = createRafController();
  });

  describe("manual update function (returned value)", () => {
    it("returns a function", () => {
      const progressRef = createProgressRef();

      const { result } = renderHook(() => useAudioProgress({ progressRef, __raf: raf.__raf }));

      expect(typeof result.current).toBe("function");
    });

    it("sets progressRef.current.setProgress with the given percentage", () => {
      const setProgress = vi.fn();
      const progressRef = createProgressRef(setProgress);

      const { result } = renderHook(() => useAudioProgress({ progressRef, __raf: raf.__raf }));

      act(() => {
        result.current(0.75);
      });

      expect(setProgress).toHaveBeenCalledWith(0.75);
    });

    it("calls onProgressUpdate if provided", () => {
      const onProgressUpdate = vi.fn();
      const progressRef = createProgressRef();

      const { result } = renderHook(() =>
        useAudioProgress({ progressRef, onProgressUpdate, __raf: raf.__raf }),
      );

      act(() => {
        result.current(0.5);
      });

      expect(onProgressUpdate).toHaveBeenCalledWith(0.5);
    });
  });

  describe("audio element mode", () => {
    it("starts RAF loop when audio play event fires", () => {
      const mockAudio = createMockAudio();
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      expect(raf.requestAnimationFrame).not.toHaveBeenCalled();

      act(() => {
        mockAudio.paused = false;
        mockAudio.emit("play");
      });

      expect(raf.requestAnimationFrame).toHaveBeenCalled();
    });

    it("stops RAF loop when audio pause event fires", () => {
      const mockAudio = createMockAudio({ paused: false });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      expect(raf.requestAnimationFrame).toHaveBeenCalled();

      act(() => {
        mockAudio.paused = true;
        mockAudio.emit("pause");
      });

      expect(raf.cancelAnimationFrame).toHaveBeenCalled();
    });

    it("stops RAF loop when audio ended event fires", () => {
      const mockAudio = createMockAudio({ paused: false });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      expect(raf.requestAnimationFrame).toHaveBeenCalled();

      act(() => {
        mockAudio.ended = true;
        mockAudio.emit("ended");
      });

      expect(raf.cancelAnimationFrame).toHaveBeenCalled();
    });

    it("starts immediately if audio is already playing", () => {
      const mockAudio = createMockAudio({ paused: false });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      expect(raf.requestAnimationFrame).toHaveBeenCalled();
    });

    it("computes correct percentage (currentTime/duration) during RAF", () => {
      const setProgress = vi.fn();
      const mockAudio = createMockAudio({
        paused: false,
        currentTime: 15,
        duration: 60,
      });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef(setProgress);

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      act(() => {
        raf.tick();
      });

      expect(setProgress).toHaveBeenCalledWith(0.25);
    });

    it("calls progressRef.setProgress with percentage each frame", () => {
      const setProgress = vi.fn();
      const mockAudio = createMockAudio({
        paused: false,
        currentTime: 30,
        duration: 60,
      });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef(setProgress);

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      act(() => {
        raf.tick();
      });
      act(() => {
        raf.tick();
      });
      act(() => {
        raf.tick();
      });

      expect(setProgress).toHaveBeenCalledTimes(3);
      expect(setProgress).toHaveBeenCalledWith(0.5);
    });

    it("throttles onProgressUpdate to fire less frequently than setProgress", () => {
      const onProgressUpdate = vi.fn();
      const mockAudio = createMockAudio({
        paused: false,
        currentTime: 30,
        duration: 60,
      });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() =>
        useAudioProgress({ audioRef, progressRef, onProgressUpdate, __raf: raf.__raf }),
      );

      const totalFrames = PROGRESS_UPDATE_FRAME_INTERVAL * 2;
      for (let i = 0; i < totalFrames; i++) {
        act(() => {
          raf.tick();
        });
      }

      // onProgressUpdate fires every PROGRESS_UPDATE_FRAME_INTERVAL frames
      expect(onProgressUpdate).toHaveBeenCalledTimes(2);
      expect(onProgressUpdate).toHaveBeenCalledWith(0.5);
    });

    it("cleans up event listeners on unmount", () => {
      const mockAudio = createMockAudio();
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      const { unmount } = renderHook(() =>
        useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }),
      );

      unmount();

      expect(mockAudio.removeEventListener).toHaveBeenCalledWith("play", expect.any(Function));
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith("pause", expect.any(Function));
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith("ended", expect.any(Function));
    });
  });

  describe("custom audio source mode", () => {
    it("starts RAF loop when isPlaying is true", () => {
      const audioSource = { currentTime: 10, duration: 100 };
      const progressRef = createProgressRef();

      renderHook(() =>
        useAudioProgress({
          audioSource,
          progressRef,
          isPlaying: true,
          __raf: raf.__raf,
        }),
      );

      expect(raf.requestAnimationFrame).toHaveBeenCalled();
    });

    it("stops RAF loop when isPlaying changes to false", () => {
      const audioSource = { currentTime: 10, duration: 100 };
      const progressRef = createProgressRef();

      const { rerender } = renderHook(
        ({ isPlaying }: { isPlaying: boolean }) =>
          useAudioProgress({
            audioSource,
            progressRef,
            isPlaying,
            __raf: raf.__raf,
          }),
        { initialProps: { isPlaying: true } },
      );

      expect(raf.requestAnimationFrame).toHaveBeenCalled();

      rerender({ isPlaying: false });

      expect(raf.cancelAnimationFrame).toHaveBeenCalled();
    });

    it("uses audioSource.currentTime/duration for percentage", () => {
      const setProgress = vi.fn();
      const audioSource = { currentTime: 25, duration: 100 };
      const progressRef = createProgressRef(setProgress);

      renderHook(() =>
        useAudioProgress({
          audioSource,
          progressRef,
          isPlaying: true,
          __raf: raf.__raf,
        }),
      );

      act(() => {
        raf.tick();
      });

      expect(setProgress).toHaveBeenCalledWith(0.25);
    });
  });

  describe("null refs", () => {
    it("does not throw when progressRef.current is null", () => {
      const mockAudio = createMockAudio({ paused: false, currentTime: 30, duration: 60 });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = { current: null } as React.RefObject<ProgressHandle | null>;

      renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));

      expect(() => {
        act(() => {
          raf.tick();
        });
      }).not.toThrow();
    });

    it("does not throw when audioRef.current is null", () => {
      const audioRef = { current: null } as React.RefObject<HTMLAudioElement | null>;
      const progressRef = createProgressRef();

      expect(() => {
        renderHook(() => useAudioProgress({ audioRef, progressRef, __raf: raf.__raf }));
      }).not.toThrow();
    });
  });

  describe("enableHighFrequency", () => {
    it("does not start RAF loop when enableHighFrequency is false", () => {
      const mockAudio = createMockAudio({ paused: false });
      const audioRef = createAudioRef(mockAudio);
      const progressRef = createProgressRef();

      renderHook(() =>
        useAudioProgress({
          audioRef,
          progressRef,
          enableHighFrequency: false,
          __raf: raf.__raf,
        }),
      );

      expect(raf.requestAnimationFrame).not.toHaveBeenCalled();
    });
  });
});
