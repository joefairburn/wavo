import { useEffect, useRef, useState } from "react";
import { Waveform } from "wavo";

/**
 * Applies a traveling wave effect - bars start at 0 and wave through.
 * Creates a ripple effect moving across the waveform.
 */
function applyWaveEffect(
  length: number,
  time: number,
  speed: number = 1.5,
  wavelength: number = 0.15,
): number[] {
  const data: number[] = [];

  for (let i = 0; i < length; i++) {
    // Traveling sine wave - height is purely from the wave
    // Use (1 + sin) / 2 to get values from 0 to 1
    const wave = (1 + Math.sin(time * speed + i * wavelength)) / 2;

    // Scale to reasonable range (0.05 to 0.9)
    const value = 0.05 + wave * 0.85;

    data.push(value);
  }

  return data;
}

/**
 * Generate static waveform data for reduced motion preference
 */
function generateStaticWaveform(length: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    // Create a gentle curve that looks natural
    const normalized = i / length;
    const value = 0.3 + 0.4 * Math.sin(normalized * Math.PI);
    data.push(value);
  }
  return data;
}

const BAR_COUNT = 100;

/**
 * Hook to check if user prefers reduced motion
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

const DynamicWaveformShowcase = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [dataPoints, setDataPoints] = useState<number[]>(() =>
    prefersReducedMotion ? generateStaticWaveform(BAR_COUNT) : applyWaveEffect(BAR_COUNT, 0),
  );

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setDataPoints(generateStaticWaveform(BAR_COUNT));
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTimeRef.current) / 1000;
      setDataPoints(applyWaveEffect(BAR_COUNT, elapsed));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative h-32 bg-black flex items-center justify-center overflow-hidden">
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
          dataPoints={dataPoints}
          transitionDuration={0}
          easing="linear"
        >
          <Waveform.Path type="bar" width={5} gap={4} radius={0} />
        </Waveform.Container>
      </div>

      {/* Live indicator - hide pulse animation for reduced motion */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span
          className={`size-2 rounded-full bg-[#f96706] ${prefersReducedMotion ? "" : "animate-pulse"}`}
        />
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#f96706]">
          {prefersReducedMotion ? "Static" : "Live"}
        </span>
      </div>
    </div>
  );
};

export default DynamicWaveformShowcase;
