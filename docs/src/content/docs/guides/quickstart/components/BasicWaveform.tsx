import Wave from 'wavo';
import { dataPoints } from '@docs/fixtures/data';

const BasicWaveform = () => {
  return (
    <Wave.Container className="w-full text-neutral-400" dataPoints={dataPoints} gap={1} width={2}>
      <Wave.Bars gap={1} width={2} />
    </Wave.Container>
  );
};

export default BasicWaveform;
