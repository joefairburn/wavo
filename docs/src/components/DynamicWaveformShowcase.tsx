import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type PathHandle, Waveform } from "wavo";
import { useFPS } from "../hooks/use-fps";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import {
  applyWaveEffect,
  applyWaveFromCursor,
  generateRandomWaveform,
  WAVE_CONFIG,
  type Wave,
} from "../utils/waveform";

const BAR_COUNT = 100;

const DynamicWaveformShowcase = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fps = useFPS();
  const pathRef = useRef<PathHandle>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  // Wave state
  const [isHovering, setIsHovering] = useState(false);
  const cursorPositionRef = useRef<number>(0);
  const wavesRef = useRef<Wave[]>([]);
  const lastWaveTimeRef = useRef(0);
  const lastWavePositionRef = useRef(0);

  // Stable initial data - only computed once
  const initialDataPoints = useMemo(
    () =>
      prefersReducedMotion ? generateRandomWaveform(BAR_COUNT) : applyWaveEffect(BAR_COUNT, 0),
    [prefersReducedMotion],
  );

  // Mouse event handlers for wave effect
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    cursorPositionRef.current = x / rect.width;
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Animation loop using requestAnimationFrame with imperative updates
  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      pathRef.current?.setDataPoints(generateRandomWaveform(BAR_COUNT));
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTimeRef.current) / 1000;

      // Clean up expired waves
      wavesRef.current = wavesRef.current.filter(
        (wave) => (currentTime - wave.startTime) / 1000 < WAVE_CONFIG.LIFETIME,
      );

      // Maybe spawn a new wave when hovering
      if (isHovering) {
        const position = cursorPositionRef.current;
        const timeSinceLastWave = currentTime - lastWaveTimeRef.current;
        const positionDelta = Math.abs(position - lastWavePositionRef.current);

        if (
          timeSinceLastWave > WAVE_CONFIG.SPAWN_COOLDOWN &&
          positionDelta > WAVE_CONFIG.SPAWN_THRESHOLD
        ) {
          wavesRef.current.push({
            origin: position,
            startTime: currentTime,
          });
          lastWaveTimeRef.current = currentTime;
          lastWavePositionRef.current = position;

          if (wavesRef.current.length > WAVE_CONFIG.MAX_WAVES) {
            wavesRef.current.shift();
          }
        }
      }

      // Generate waveform data - cursor waves layer on top of the continuous flow
      const baseWave = applyWaveEffect(BAR_COUNT, elapsed);
      const waveformData =
        wavesRef.current.length > 0
          ? applyWaveFromCursor(BAR_COUNT, currentTime, wavesRef.current, baseWave)
          : baseWave;

      pathRef.current?.setDataPoints(waveformData);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion, isHovering]);

  return (
    <div
      className="relative h-32 bg-black flex items-center justify-center overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Waveform container */}
      <div className="relative z-10 w-full h-full px-4 py-6 flex items-center">
        <Waveform.Container
          className="w-full h-full text-[#f96706]"
          dataPoints={initialDataPoints}
          transitionDuration={0}
          easing="linear"
        >
          <Waveform.Path ref={pathRef} type="bar" width={5} gap={4} radius={0} />
        </Waveform.Container>
      </div>

      {/* FPS indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span
          className={`size-2 rounded-full bg-[#f96706] ${prefersReducedMotion ? "" : "animate-pulse"}`}
        />
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#f96706]">
          {fps} FPS
        </span>
      </div>
    </div>
  );
};

export default DynamicWaveformShowcase;
