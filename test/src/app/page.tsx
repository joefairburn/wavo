import { testData } from '@/fixtures/testData';
import { Waveform } from 'wavelet';

export default function Home() {
  return <Waveform data={testData.waveform_json} />;
}
