import Wave from 'wavo';
import { dataPoints } from '@docs/fixtures/data';
import { useState, type KeyboardEventHandler } from 'react';

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
    <Wave.Container
      className="w-full text-neutral-400"
      dataPoints={dataPoints}
      onClick={handleProgressChange}
      onDrag={handleProgressChange}
      onKeyDown={handleKeyDown}
    >
      <Wave.Bars gap={1} width={2} />
      <Wave.Progress progress={progress} color="#FFF" />
    </Wave.Container>
  );
};

export default WaveformWithProgress;
