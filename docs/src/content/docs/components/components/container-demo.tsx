import { dataPoints } from "@docs/fixtures/data";
import { useState, useRef } from "react";
import { Waveform, type EasingFunction } from "wavo";

type DemoMode = "basic" | "interactive" | "lazy";

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

const sliderClasses =
  "w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 " +
  "[&::-webkit-slider-thumb]:bg-[#f96706] [&::-webkit-slider-thumb]:rounded-none " +
  "hover:[&::-webkit-slider-thumb]:bg-white transition-all";

const ContainerDemo = () => {
  const [progress, setProgress] = useState(0.3);
  const [demoMode, setDemoMode] = useState<DemoMode>("interactive");
  const [lazyLoad, setLazyLoad] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(1);
  const [easing, setEasing] = useState<EasingFunction>("ease-out");
  const [lastEvent, setLastEvent] = useState<string>("");
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (percentage: number) => {
    setProgress(percentage);
    setLastEvent(`onClick: ${(percentage * 100).toFixed(1)}%`);
  };

  const handleDrag = (percentage: number) => {
    setProgress(percentage);
    setLastEvent(`onDrag: ${(percentage * 100).toFixed(1)}%`);
  };

  const handleDragStart = () => {
    setLastEvent("onDragStart");
  };

  const handleDragEnd = () => {
    setLastEvent("onDragEnd");
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const STEP = 0.05;
    switch (event.key) {
      case "ArrowLeft":
        setProgress((p) => Math.max(0, p - STEP));
        setLastEvent(`onKeyDown: ArrowLeft`);
        event.preventDefault();
        break;
      case "ArrowRight":
        setProgress((p) => Math.min(1, p + STEP));
        setLastEvent(`onKeyDown: ArrowRight`);
        event.preventDefault();
        break;
    }
  };

  const easingOptions: { label: string; value: EasingFunction }[] = [
    { label: "linear", value: "linear" },
    { label: "ease", value: "ease" },
    { label: "ease-in", value: "ease-in" },
    { label: "ease-out", value: "ease-out" },
    { label: "ease-in-out", value: "ease-in-out" },
    { label: "snappy", value: [0.1, 0.9, 0.2, 1.0] },
  ];

  return (
    <div className="border-2 border-white/10 bg-[#050505]">
      {/* Mode Tabs */}
      <div className="flex items-center border-b border-white/10 bg-[#1a1a1a]">
        <div className="border-r border-white/10 bg-[#1a1a1a] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Container
        </div>
        <div className="ml-4 flex border border-white/10 bg-black p-0.5" role="tablist">
          {[
            { value: "basic", label: "Basic" },
            { value: "interactive", label: "Interactive" },
            { value: "lazy", label: "Lazy Load" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={demoMode === option.value}
              onClick={() => setDemoMode(option.value as DemoMode)}
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
      <div className="relative h-[200px] w-full border-b border-white/10 bg-black">
        <Waveform
          ref={svgRef}
          className="h-full w-full px-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-400"
          dataPoints={dataPoints}
          progress={progress}
          lazyLoad={demoMode === "lazy" ? lazyLoad : false}
          transitionDuration={transitionDuration}
          easing={easing}
          onClick={demoMode === "interactive" ? handleClick : undefined}
          onDrag={demoMode === "interactive" ? handleDrag : undefined}
          onDragStart={demoMode === "interactive" ? handleDragStart : undefined}
          onDragEnd={demoMode === "interactive" ? handleDragEnd : undefined}
          onKeyDown={demoMode === "interactive" ? handleKeyDown : undefined}
        >
          <Waveform.Bars width={3} gap={2} radius={1} />
          <Waveform.Progress color="#f96706" />
        </Waveform>

        {/* Event Display */}
        {demoMode === "interactive" && lastEvent && (
          <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#f96706]">
            {lastEvent}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 bg-[#0e0e0e] p-6 sm:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
            Progress
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-white/60">progress</span>
              <span className="text-[#f96706]">{progress.toFixed(2)}</span>
            </div>
            <input
              className={sliderClasses}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={(e) => setProgress(Number.parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-white/60">transitionDuration</span>
              <span className="text-[#f96706]">{transitionDuration}s</span>
            </div>
            <input
              className={sliderClasses}
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
            Animation
          </h4>
          <div className="space-y-2">
            <label className="font-mono text-xs text-white/60" htmlFor="easing-select">
              easing
            </label>
            <select
              id="easing-select"
              className="w-full border border-white/10 bg-[#1a1a1a] px-3 py-2 font-mono text-xs text-white focus:border-[#f96706] focus:outline-none"
              value={typeof easing === "string" ? easing : "snappy"}
              onChange={(e) => {
                const selected = easingOptions.find((o) =>
                  typeof o.value === "string"
                    ? o.value === e.target.value
                    : o.label === e.target.value,
                );
                if (selected) setEasing(selected.value);
              }}
            >
              {easingOptions.map((opt) => (
                <option
                  key={opt.label}
                  value={typeof opt.value === "string" ? opt.value : opt.label}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {demoMode === "lazy" && (
            <div className="flex items-center justify-between pt-2">
              <label className="font-mono text-xs text-white/60" htmlFor="lazy-toggle">
                lazyLoad
              </label>
              <Toggle id="lazy-toggle" checked={lazyLoad} onChange={setLazyLoad} />
            </div>
          )}

          {demoMode === "interactive" && (
            <div className="border border-white/10 bg-[#151515] p-3">
              <p className="font-mono text-[10px] text-white/40">
                Click, drag, or use arrow keys to interact with the waveform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContainerDemo;
