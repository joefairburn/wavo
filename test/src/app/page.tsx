import { dummyData } from '@/fixtures/testData';
import MusicPlayer from './MusicPlayer';

export default function Home() {
  return (
    <div className=" w-screen flex flex-col items-center justify-center gap-4">
      {dummyData.map(track => (
        <MusicPlayer
          key={track.id}
          id={track.id.toString()}
          src={track.track_version[0].version_preview_uri}
          waveformJson={track.track_version[0].waveform_json}
        />
      ))}
    </div>
  );
}
