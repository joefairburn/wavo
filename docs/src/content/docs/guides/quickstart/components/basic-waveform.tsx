import { dataPoints } from "@docs/fixtures/data";
import { Waveform } from "wavo";

const BasicWaveform = () => {
  return (
    <Waveform.Container className="w-full text-[#f96706]" dataPoints={dataPoints}>
      <Waveform.Bars gap={10} width={5} />
    </Waveform.Container>
  );
};

export default BasicWaveform;
