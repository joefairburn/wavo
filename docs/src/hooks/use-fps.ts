import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook to track real FPS using requestAnimationFrame.
 * Updates state only when FPS changes by more than 2 to avoid unnecessary re-renders.
 */
export function useFPS(): number {
  const [fps, setFPS] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>(0);
  const lastDisplayedFPSRef = useRef(0);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    const avgFrameTime =
      frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const currentFPS = Math.round(1000 / avgFrameTime);

    // Only update state when FPS changes meaningfully (by more than 2)
    // to avoid unnecessary re-renders on every frame
    if (Math.abs(currentFPS - lastDisplayedFPSRef.current) > 2) {
      lastDisplayedFPSRef.current = currentFPS;
      setFPS(currentFPS);
    }

    rafIdRef.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [measureFPS]);

  return fps;
}
