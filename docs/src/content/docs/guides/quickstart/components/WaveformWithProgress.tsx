import Wave from 'wavo';
import { dataPoints } from '@docs/fixtures/data';
import { useState } from 'react';

const WaveformWithProgress = () => {
  const [progress, setProgress] = useState(0);

  const handleProgressChange = (value: number) => {
    setProgress(value);
  };

  return (
    <Wave.Container
      className="w-full text-neutral-400"
      dataPoints={dataPoints}
      onClick={handleProgressChange}
      onDrag={handleProgressChange}
    >
      <Wave.Bars gap={1} width={2} />
      <Wave.Progress progress={progress} color="#FFF" />
    </Wave.Container>
  );
};

export default WaveformWithProgress;
