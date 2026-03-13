import { useRef, useState, useEffect } from "react";
import { Waveform, type BarsHandle } from "wavo";

const RealtimeDemo = () => {
  const barsRef = useRef<BarsHandle>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");

  useEffect(() => {
    // Check permission state on mount
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((result) => {
          setPermissionState(result.state as "prompt" | "granted" | "denied");
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let animationId: number;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    const setup = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionState("granted");
        setError(null);

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const visualize = () => {
          analyser.getByteFrequencyData(dataArray);

          // Normalize to 0-1 range with some boost
          const normalized = Array.from(dataArray).map((v) => Math.min(1, (v / 255) * 1.5));

          barsRef.current?.setDataPoints(normalized);
          animationId = requestAnimationFrame(visualize);
        };

        animationId = requestAnimationFrame(visualize);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError("Microphone access denied. Please allow microphone access to use this demo.");
            setPermissionState("denied");
          } else {
            setError(err.message);
          }
        }
        setIsActive(false);
      }
    };

    setup();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive]);

  const initialData = new Array(128).fill(0.05);

  return (
    <div className="border-2 border-white/10 bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-6 py-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f96706]">
          Real-time Visualization
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isActive ? "animate-pulse bg-red-500" : "bg-white/20"}`}
          />
          <span className="font-mono text-[10px] text-white/50">
            {isActive ? "LISTENING" : "IDLE"}
          </span>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative h-[200px] w-full border-b border-white/10 bg-black">
        <Waveform className="h-full w-full px-4" dataPoints={initialData}>
          <Waveform.Bars ref={barsRef} width={3} gap={2} radius={1} optimized />
        </Waveform>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
            <p className="text-center font-mono text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#0e0e0e] p-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            disabled={permissionState === "denied"}
            className={`px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-colors ${
              permissionState === "denied"
                ? "cursor-not-allowed bg-white/10 text-white/30"
                : isActive
                  ? "bg-red-500 text-white"
                  : "bg-[#f96706] text-black"
            }`}
          >
            {isActive ? "Stop" : "Start"} Microphone
          </button>

          <div className="flex-1">
            <p className="font-mono text-[10px] text-white/40">
              {permissionState === "denied"
                ? "Microphone access was denied. Please enable it in your browser settings."
                : "Click to start capturing audio from your microphone. The waveform updates at 60fps using the imperative API."}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 border border-white/10 bg-[#151515] p-3">
          <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white/30">
            How it works
          </h4>
          <ul className="space-y-1 font-mono text-[10px] text-white/50">
            <li>• Uses Web Audio API AnalyserNode for frequency data</li>
            <li>• Updates bars imperatively via setDataPoints() at 60fps</li>
            <li>• No React re-renders during visualization</li>
            <li>• Uses optimized mode for better performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDemo;
