import { dataPoints } from '@docs/fixtures/data';
import type React from 'react';
import { useState } from 'react';
import { Waveform } from 'wavo';

const WaveformWithProgress = () => {
  const [progress, setProgress] = useState(0);

  const handleProgressChange = (value: number) => {
    setProgress(value);
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        setProgress(progress + 0.02);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setProgress(progress - 0.02);
        break;
      case ' ':
        event.preventDefault();
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  return (
    <Waveform.Container
      className="w-full text-neutral-400"
      dataPoints={dataPoints}
      onClick={handleProgressChange}
      onDrag={handleProgressChange}
      onKeyDown={handleKeyDown}
    >
      <Waveform.Bars gap={1} width={2} />
      <Waveform.Progress color="#FFF" progress={progress} />
    </Waveform.Container>
  );
};

export default WaveformWithProgress;
