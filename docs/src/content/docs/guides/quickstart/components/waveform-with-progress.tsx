import { dataPoints } from "@docs/fixtures/data";
import type React from "react";
import { useState } from "react";
import { Waveform } from "wavo";

const WaveformWithProgress = () => {
  const [progress, setProgress] = useState(0.5);

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        setProgress((p) => Math.min(1, p + 0.02));
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        setProgress((p) => Math.max(0, p - 0.02));
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
      onClick={setProgress}
      onDrag={setProgress}
      onKeyDown={handleKeyDown}
      progress={progress}
    >
      <Waveform.Bars gap={10} width={5} />
      <Waveform.Progress color="#f96706" />
    </Waveform.Container>
  );
};

export default WaveformWithProgress;
