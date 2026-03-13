import { dataPoints } from "@docs/fixtures/data";
import { useState } from "react";
import { Waveform } from "wavo";

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

const PathDemo = () => {
  const [width, setWidth] = useState(3);
  const [gap, setGap] = useState(2);
  const [smooth, setSmooth] = useState(true);
  const [curvature, setCurvature] = useState(0.5);
  const [progress, setProgress] = useState(0.5);

  return (
    <div className="border-2 border-white/10 bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-6 py-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Path
        </span>
        <span className="font-mono text-[10px] text-white/30">{smooth ? "SMOOTH" : "JAGGED"}</span>
      </div>

      {/* Waveform Display */}
      <div className="h-[200px] w-full border-b border-white/10 bg-black">
        <Waveform.Container
          className="h-full w-full px-4"
          dataPoints={dataPoints}
          progress={progress}
          onClick={setProgress}
        >
          <Waveform.Path
            type="line"
            width={width}
            gap={gap}
            smooth={smooth}
            curvature={curvature}
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

        {/* Curve Settings */}
        <div className="space-y-4">
          <h4 className="border-b border-white/5 pb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">
            Curve
          </h4>

          <div className="flex items-center justify-between">
            <label className="font-mono text-xs text-white/60" htmlFor="smooth-toggle">
              smooth
            </label>
            <Toggle id="smooth-toggle" checked={smooth} onChange={setSmooth} />
          </div>

          {!smooth && (
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-white/60">curvature</span>
                <span className="text-[#f96706]">{curvature.toFixed(2)}</span>
              </div>
              <input
                className={sliderClasses}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={curvature}
                onChange={(e) => setCurvature(Number.parseFloat(e.target.value))}
              />
              <p className="font-mono text-[10px] text-white/30">
                0 = jagged lines, 1 = very smooth curves
              </p>
            </div>
          )}

          <div className="border border-white/10 bg-[#151515] p-3">
            <p className="font-mono text-[10px] text-white/40">
              Path renders as a single SVG path element for optimal performance. Use for line-based
              visualizations or when you need smooth curves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathDemo;
