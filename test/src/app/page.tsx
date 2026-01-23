import { generateTestData } from "@/utils/test-data-generator";
import MusicPlayer from "./music-player";

const NUMBER_OF_WAVEFORMS = 1000;
// Removed testTracks generation from module scope

export default function Home() {
  // Generate data inside the component function to get new data on each render/refresh
  const testTracks = generateTestData(NUMBER_OF_WAVEFORMS);

  return (
    <div className="flex w-screen flex-col items-center justify-center gap-4">
      {testTracks.map((track) => (
        <MusicPlayer
          id={track.id.toString()}
          key={track.id}
          // Directly use the properties from the simplified track object
          src={track.src}
          waveformJson={track.waveformJson}
        />
      ))}
    </div>
  );
}
