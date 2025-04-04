import MusicPlayer from './MusicPlayer';
import { generateTestData } from '@/utils/testDataGenerator';

const NUMBER_OF_WAVEFORMS = 1000;
// Removed testTracks generation from module scope

export default function Home() {
  // Generate data inside the component function to get new data on each render/refresh
  const testTracks = generateTestData(NUMBER_OF_WAVEFORMS);

  return (
    <div className="w-screen flex flex-col items-center justify-center gap-4">
      {testTracks.map(track => (
        <MusicPlayer
          key={track.id}
          id={track.id.toString()}
          // Directly use the properties from the simplified track object
          src={track.src}
          waveformJson={track.waveformJson}
        />
      ))}
    </div>
  );
}
