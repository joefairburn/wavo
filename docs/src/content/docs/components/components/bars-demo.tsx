import { dataPoints } from "@docs/fixtures/data";
import { useState, useRef, useEffect } from "react";
import { Waveform, type BarRadius, type BarsHandle } from "wavo";

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

const BarsDemo = () => {
  const [width, setWidth] = useState(3);
  const [gap, setGap] = useState(2);
  const [radius, setRadius] = useState<BarRadius>(2);
  const [optimized, setOptimized] = useState(false);
  const [progress, setProgress] = useState(0.5);
  const [barCount, setBarCount] = useState(0);
  const barsRef = useRef<BarsHandle>(null);

  useEffect(() => {
    // Get bar count after initial render
    const count = barsRef.current?.getBarCount() ?? 0;
    setBarCount(count);
  }, [width, gap]);

  const radiusOptions: BarRadius[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="border-2 border-white/10 bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-6 py-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Bars
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-white/30">{barCount} bars</span>
          <span
            className={`font-mono text-[10px] ${optimized ? "text-green-400" : "text-white/30"}`}
          >
            {optimized ? "OPTIMIZED" : "STANDARD"}
          </span>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="h-[200px] w-full border-b border-white/10 bg-black">
        <Waveform.Container
          className="h-full w-full px-4"
          dataPoints={dataPoints}
          progress={progress}
          onClick={setProgress}
        >
          <Waveform.Bars
            ref={barsRef}
            width={width}
            gap={gap}
            radius={radius}
            optimized={optimized}
          />
          <Waveform.Progress color="#f96706" />
        </Waveform.Container>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 bg-[#0e0e0e] p-6 sm:grid-cols-2">
        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
            Dimensions
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-white/60">width</span>
              <span className="text-[#f96706]">{width}px</span>
            </div>
            <input
              className={sliderClasses}
              type="range"
              min="1"
              max="20"
              value={width}
              onChange={(e) => setWidth(Number.parseInt(e.target.value, 10))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-white/60">gap</span>
              <span className="text-[#f96706]">{gap}px</span>
            </div>
            <input
              className={sliderClasses}
              type="range"
              min="0"
              max="15"
              value={gap}
              onChange={(e) => setGap(Number.parseInt(e.target.value, 10))}
            />
          </div>

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
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
            Appearance
          </h4>

          <div className="space-y-2">
            <label className="font-mono text-xs text-white/60">radius</label>
            <div className="flex gap-1">
              {radiusOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-2 font-mono text-xs transition-colors ${
                    radius === r
                      ? "bg-[#f96706] text-black"
                      : "border border-white/10 bg-[#1a1a1a] text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border border-white/10 bg-[#151515] p-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-bold text-white/80">optimized</span>
              <span className="font-mono text-[10px] text-white/30">
                Single path for better performance
              </span>
            </div>
            <Toggle id="optimized-toggle" checked={optimized} onChange={setOptimized} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarsDemo;
