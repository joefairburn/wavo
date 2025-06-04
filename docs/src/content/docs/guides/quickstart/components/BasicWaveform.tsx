import React from 'react';
import { Waveform } from 'wavo';
import { dataPoints } from '@docs/fixtures/data';

const BasicWaveform = () => {
  return (
    <Waveform.Container className="w-full text-neutral-400" dataPoints={dataPoints}>
      <Waveform.Bars gap={1} width={2} />
    </Waveform.Container>
  );
};

export default BasicWaveform;
