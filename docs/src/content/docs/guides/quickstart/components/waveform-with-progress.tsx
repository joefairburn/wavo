import { dataPoints } from "@docs/fixtures/data";
import type React from "react";
import { useRef, useState } from "react";
import { type ProgressHandle, Waveform } from "wavo";

const WaveformWithProgress = () => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ProgressHandle>(null);

  const handleProgressChange = (value: number) => {
    setProgress(value);
    // Update progress via ref for better performance
    progressRef.current?.setProgress(value);
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        const newProgressRight = Math.min(1, progress + 0.02);
        setProgress(newProgressRight);
        progressRef.current?.setProgress(newProgressRight);
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        const newProgressLeft = Math.max(0, progress - 0.02);
        setProgress(newProgressLeft);
        progressRef.current?.setProgress(newProgressLeft);
        break;
      }
      case " ":
        event.preventDefault();
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  return (
    <Waveform.Container
      className="w-full text-[#3a2f27]"
      dataPoints={dataPoints}
      onClick={handleProgressChange}
      onDrag={handleProgressChange}
      onKeyDown={handleKeyDown}
    >
      <Waveform.Bars gap={1} width={2} />
      <Waveform.Progress color="#f96706" ref={progressRef} />
    </Waveform.Container>
  );
};

export default WaveformWithProgress;
