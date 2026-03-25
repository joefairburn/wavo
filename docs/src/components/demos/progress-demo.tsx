'use client';

import { dataPoints } from "@docs/fixtures/data";
import { useState, useRef, useEffect } from "react";
import { Waveform, type GradientStop, type ProgressHandle } from "wavo";

type DemoMode = "single" | "gradient" | "imperative";

const sliderClasses =
  "w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 " +
  "[&::-webkit-slider-thumb]:bg-[#f96706] [&::-webkit-slider-thumb]:rounded-none " +
  "hover:[&::-webkit-slider-thumb]:bg-white transition-all";

// Preset gradients
const gradientPresets: { name: string; gradient: GradientStop[] }[] = [
  {
    name: "Sunset",
    gradient: [
      { offset: "0%", color: "#f96706" },
      { offset: "50%", color: "#ff4757" },
      { offset: "100%", color: "#ffd93d" },
    ],
  },
  {
    name: "Ocean",
    gradient: [
      { offset: "0%", color: "#0077b6" },
      { offset: "100%", color: "#00b4d8" },
    ],
  },
  {
    name: "Neon",
    gradient: [
      { offset: "0%", color: "#ff006e" },
      { offset: "50%", color: "#8338ec" },
      { offset: "100%", color: "#3a86ff" },
    ],
  },
  {
    name: "Forest",
    gradient: [
      { offset: "0%", color: "#2d6a4f" },
      { offset: "100%", color: "#95d5b2" },
    ],
  },
];

const ProgressDemo = () => {
  const [progress, setProgress] = useState(0.5);
  const [demoMode, setDemoMode] = useState<DemoMode>("gradient");
  const [color, setColor] = useState("#f96706");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressRef = useRef<ProgressHandle>(null);
  const animationRef = useRef<number>(0);

  // Animate progress imperatively
  useEffect(() => {
    if (!isAnimating || demoMode !== "imperative") {
      return;
    }

    let startTime: number;
    const duration = 3000; // 3 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = (elapsed % duration) / duration;

      progressRef.current?.setProgress(newProgress);
      setProgress(newProgress);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isAnimating, demoMode]);

  return (
    <div className="border-2 border-white/10 bg-[#050505]">
      {/* Header */}
      <div className="flex items-center border-b border-white/10 bg-[#1a1a1a]">
        <div className="border-r border-white/10 bg-[#1a1a1a] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Progress
        </div>
        <div className="ml-4 flex border border-white/10 bg-black p-0.5" role="tablist">
          {[
            { value: "single", label: "Single Color" },
            { value: "gradient", label: "Gradient" },
            { value: "imperative", label: "Imperative" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={demoMode === option.value}
              onClick={() => {
                setDemoMode(option.value as DemoMode);
                setIsAnimating(false);
              }}
              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                demoMode === option.value
                  ? "bg-[#f96706] text-black shadow-sm"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Waveform Display */}
      <div className="h-[200px] w-full border-b border-white/10 bg-black">
        <Waveform
          className="h-full w-full px-4"
          dataPoints={dataPoints}
          progress={progress}
          onClick={setProgress}
        >
          <Waveform.Bars width={3} gap={2} radius={1} />
          {demoMode === "single" && <Waveform.Progress color={color} />}
          {demoMode === "gradient" && (
            <Waveform.Progress gradient={gradientPresets[selectedPreset].gradient} />
          )}
          {demoMode === "imperative" && <Waveform.Progress ref={progressRef} color="#f96706" />}
        </Waveform>
      </div>

      {/* Controls */}
      <div className="bg-[#0e0e0e] p-6">
        {demoMode === "single" && (
          <div className="space-y-4">
            <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
              Color
            </h4>
            <div className="flex gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 cursor-pointer border border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 border border-white/10 bg-[#1a1a1a] px-3 font-mono text-xs text-white"
              />
            </div>
          </div>
        )}

        {demoMode === "gradient" && (
          <div className="space-y-4">
            <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
              Gradient Presets
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {gradientPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedPreset(index)}
                  className={`flex flex-col items-center gap-2 border p-3 transition-colors ${
                    selectedPreset === index
                      ? "border-[#f96706] bg-[#f96706]/10"
                      : "border-white/10 bg-[#1a1a1a] hover:border-white/20"
                  }`}
                >
                  <div
                    className="h-4 w-full"
                    style={{
                      background: `linear-gradient(to right, ${preset.gradient
                        .map((s) => `${s.color} ${s.offset}`)
                        .join(", ")})`,
                    }}
                  />
                  <span className="font-mono text-[10px] text-white/60">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="border border-white/10 bg-[#151515] p-3">
              <pre className="overflow-x-auto font-mono text-[10px] text-white/60">
                {JSON.stringify(gradientPresets[selectedPreset].gradient, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {demoMode === "imperative" && (
          <div className="space-y-4">
            <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
              Imperative Updates
            </h4>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAnimating(!isAnimating)}
                className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                  isAnimating ? "bg-red-500 text-white" : "bg-[#f96706] text-black"
                }`}
              >
                {isAnimating ? "Stop" : "Animate"}
              </button>
              <span className="font-mono text-[10px] text-white/40">
                Using setProgress() at 60fps without re-renders
              </span>
            </div>
          </div>
        )}

        {/* Progress Slider */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-white/60">progress</span>
            <span className="text-[#f96706]">{progress.toFixed(3)}</span>
          </div>
          <input
            className={sliderClasses}
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value);
              setProgress(value);
              if (demoMode === "imperative") {
                progressRef.current?.setProgress(value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressDemo;
