import React, { useState } from 'react';
import { dataPoints } from '@docs/fixtures/data';
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
      <Waveform.Progress progress={progress} color="#FFF" />
    </Waveform.Container>
  );
};

export default WaveformWithProgress;
