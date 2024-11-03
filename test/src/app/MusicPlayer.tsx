'use client';

import { useRef, useState } from 'react';
import Waveform from 'wavelet';

export default function MusicPlayer({ src, waveformJson, id }: { src: string; waveformJson: string; id: string }) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(percentage);
    }
  };

  const handleClick = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percentage;
    }
  };

  return (
    <div className="h-24 w-full flex flex-row items-center justify-center gap-4 p-4" key={id}>
      <audio ref={audioRef} controls className="mb-2" src={src} onTimeUpdate={handleTimeUpdate} />
      <Waveform
        className="w-full h-full focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 rounded-lg"
        dataPoints={JSON.parse(waveformJson)}
        gap={2}
        width={2}
        lazyLoad={true}
        progress={progress}
        onClick={handleClick}
        onDrag={handleClick}
        onDragStart={() => audioRef.current?.pause()}
        onDragEnd={() => audioRef.current?.play()}
      />
    </div>
  );
}
