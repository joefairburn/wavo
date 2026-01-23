import { dataPoints, musicFile } from "@docs/fixtures/data";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BarRadius,
  type EasingFunction,
  type GradientStop,
  type ProgressHandle,
  useAudioProgress,
  Waveform,
} from "wavo";

// Local type for the rendering mode toggle
type RenderMode = "bars" | "line";

// Helper to adjust color brightness
const adjustBrightness = (hex: string, percent: number): string => {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Generate gradient from a base color
const createGradient = (baseColor: string): GradientStop[] => [
  { offset: "0%", color: adjustBrightness(baseColor, -20) },
  { offset: "50%", color: baseColor },
  { offset: "100%", color: adjustBrightness(baseColor, 20) },
];

// Custom Toggle Switch component matching mockup design
const Toggle = ({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-10 cursor-pointer border transition-colors ${
      checked ? "border-[#f96706] bg-[#f96706]/20" : "border-white/20 bg-white/5"
    }`}
  >
    <div
      className={`absolute top-0.5 h-3.5 w-3.5 transition-transform ${
        checked ? "translate-x-5 bg-[#f96706]" : "translate-x-0.5 bg-white/40"
      }`}
    />
  </button>
);

// Hook to track real FPS using requestAnimationFrame
const useFPS = () => {
  const [fps, setFPS] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>(0);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Keep last 60 frame times for smoothing
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Calculate average FPS from frame times
    const avgFrameTime =
      frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const currentFPS = Math.round(1000 / avgFrameTime);

    setFPS(currentFPS);
    rafIdRef.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [measureFPS]);

  return fps;
};

// FPS Display component
const FPSDisplay = () => {
  const fps = useFPS();
  return <span>FPS: {fps}</span>;
};

const WavoExample = () => {
  const [progress, setProgress] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<ProgressHandle>(null);

  const [controls, setControls] = useState({
    gap: 10,
    width: 5,
    color: "#f96706",
    radius: 0 as BarRadius,
    renderMode: "bars" as RenderMode,
    optimized: true,
    smooth: true,
    transitionDuration: 2,
    easing: [0.1, 0.9, 0.2, 1.0] as EasingFunction,
    useGradient: true,
  });

  // Use the audio progress hook for 60fps updates
  const updateProgress = useAudioProgress({
    audioRef,
    progressRef,
    onProgressUpdate: setProgress,
  });

  const handleClick = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percentage;
      updateProgress(percentage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const STEP = 0.05;

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
        break;
    }
  };

  const cssVariables = {
    "--wavo-bar-color": "#3a2f27",
    "--wavo-bar-color-progress": controls.color,
    "--wavo-bar-width": `${controls.width}px`,
    "--wavo-bar-gap": `${controls.gap}px`,
    "--wavo-transition-duration": `${controls.transitionDuration}s`,
  } as React.CSSProperties;

  // Slider styling classes
  const sliderClasses =
    "w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 " +
    "[&::-webkit-slider-thumb]:bg-[#f96706] [&::-webkit-slider-thumb]:rounded-none " +
    "hover:[&::-webkit-slider-thumb]:bg-white transition-all";

  return (
    <div className="border-2 border-white/10 bg-[#050505]" style={cssVariables}>
      {/* biome-ignore lint/a11y/useMediaCaption: Demo music file doesn't need captions */}
      <audio
        aria-label="Background music for waveform demo (no captions needed)"
        className="hidden"
        controls
        ref={audioRef}
        src={musicFile}
      />

      {/* Header Bar */}
      <div className="flex items-center border-b border-white/10 bg-[#1a1a1a]">
        <div className="border-r border-white/10 bg-[#1a1a1a] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Preview
        </div>
        <div
          className="ml-4 flex border border-white/10 bg-black p-0.5"
          role="radiogroup"
          aria-label="Waveform rendering mode"
        >
          {[
            { value: "line", label: "Wave" },
            { value: "bars", label: "Bar" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={controls.renderMode === option.value}
              onClick={() => setControls({ ...controls, renderMode: option.value as RenderMode })}
              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                controls.renderMode === option.value
                  ? "bg-[#f96706] text-black shadow-sm"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Waveform Area */}
        <div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden border-b border-white/10 bg-black">
          {/* Waveform */}
          <Waveform.Container
            className="h-full w-full px-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-400 focus-visible:ring-opacity-75"
            dataPoints={dataPoints}
            easing={controls.easing}
            lazyLoad={true}
            onClick={handleClick}
            onDrag={handleClick}
            onDragEnd={() => audioRef.current?.play()}
            onDragStart={() => audioRef.current?.pause()}
            onKeyDown={handleKeyDown}
            progress={progress}
            transitionDuration={controls.transitionDuration}
          >
            {controls.renderMode === "bars" && (
              <Waveform.Bars
                gap={controls.gap}
                optimized={controls.optimized}
                radius={controls.radius}
                width={controls.width}
              />
            )}
            {controls.renderMode === "line" && (
              <Waveform.Path
                gap={controls.gap}
                smooth={controls.smooth}
                type="line"
                width={controls.width}
              />
            )}
            {controls.useGradient ? (
              <Waveform.Progress gradient={createGradient(controls.color)} ref={progressRef} />
            ) : (
              <Waveform.Progress color={controls.color} ref={progressRef} />
            )}
          </Waveform.Container>

          {/* Stats display */}
          <div className="absolute bottom-4 right-4 flex gap-4 font-mono text-[10px] uppercase text-white/30">
            <FPSDisplay />
            <span className="text-[#f96706]">SVG</span>
          </div>
        </div>

        {/* Controls Panel - 2 Column Grid */}
        <div className="grid grid-cols-1 gap-6 bg-[#0e0e0e] p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
          {/* Geometry Column */}
          <div className="space-y-5">
            <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
              Geometry
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-white/60">Gap</span>
                <span className="text-[#f96706]">{controls.gap}px</span>
              </div>
              <input
                className={sliderClasses}
                max="20"
                min="0"
                type="range"
                value={controls.gap}
                onChange={(e) =>
                  setControls({ ...controls, gap: Number.parseInt(e.target.value, 10) })
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-white/60">Width</span>
                <span className="text-[#f96706]">{controls.width}px</span>
              </div>
              <input
                className={sliderClasses}
                max="40"
                min="1"
                type="range"
                value={controls.width}
                onChange={(e) =>
                  setControls({ ...controls, width: Number.parseInt(e.target.value, 10) })
                }
              />
            </div>
            {controls.renderMode === "bars" && (
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-white/60">Radius</span>
                  <span className="text-[#f96706]">{controls.radius}px</span>
                </div>
                <input
                  className={sliderClasses}
                  max="5"
                  min="0"
                  type="range"
                  value={controls.radius}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10);
                    const radius = (value >= 0 && value <= 5 ? value : 0) as BarRadius;
                    setControls({ ...controls, radius });
                  }}
                />
              </div>
            )}
            {controls.renderMode === "line" && (
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-white/60" htmlFor="smooth-toggle">
                  Smooth
                </label>
                <Toggle
                  id="smooth-toggle"
                  checked={controls.smooth}
                  onChange={(checked) => setControls({ ...controls, smooth: checked })}
                />
              </div>
            )}
          </div>

          {/* Appearance Column */}
          <div className="space-y-5">
            <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
              Appearance
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-white/60" htmlFor="color-input">
                  Color
                </label>
                <span className="font-mono text-[10px] text-white/30">HEX / RGBA</span>
              </div>
              <div className="flex h-9 gap-2">
                <div className="relative h-full flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-white/30">
                    #
                  </span>
                  <input
                    id="color-input"
                    className="h-full w-full border border-white/10 bg-[#1a1a1a] pl-7 font-mono text-xs uppercase tracking-wider text-white transition-colors focus:border-[#f96706] focus:outline-none"
                    type="text"
                    value={controls.color.replace("#", "").toUpperCase()}
                    onChange={(e) => {
                      const hex = e.target.value.replace("#", "");
                      if (/^[\da-f]{0,6}$/i.test(hex)) {
                        setControls({ ...controls, color: `#${hex}` });
                      }
                    }}
                  />
                </div>
                <input
                  className="h-full w-9 cursor-pointer border border-white/10 bg-transparent p-0"
                  type="color"
                  value={controls.color}
                  onChange={(e) => setControls({ ...controls, color: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-white/60" htmlFor="gradient-toggle">
                Gradient Fill
              </label>
              <Toggle
                id="gradient-toggle"
                checked={controls.useGradient}
                onChange={(checked) => setControls({ ...controls, useGradient: checked })}
              />
            </div>
            {/* Optimized Toggle - in bordered box */}
            {controls.renderMode === "bars" && (
              <div className="pt-2">
                <div className="flex items-center justify-between border border-white/10 bg-[#151515] p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-bold text-white/80">Optimized?</span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-white/30">
                      Performance Mode
                    </span>
                  </div>
                  <Toggle
                    id="optimized-toggle"
                    checked={controls.optimized}
                    onChange={(checked) => setControls({ ...controls, optimized: checked })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WavoExample;
