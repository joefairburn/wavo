import { dataPoints } from "@docs/fixtures/data";
import { Waveform } from "wavo";

const BasicWaveform = () => {
  return (
    <Waveform.Container className="w-full text-neutral-400" dataPoints={dataPoints}>
      <Waveform.Bars gap={1} width={2} />
    </Waveform.Container>
  );
};

export default BasicWaveform;
