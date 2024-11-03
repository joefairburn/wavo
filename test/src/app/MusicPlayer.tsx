'use client';

import { useRef, useState } from 'react';
import Waveform from 'wavelet';

export default function MusicPlayer({ src, waveformJson, id }: { src: string; waveformJson: string; id: string }) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const handleClick = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percentage;
    }
  };

  return (
    <div className="h-24 w-full flex flex-row items-center justify-center" key={id}>
      <audio ref={audioRef} controls className="mb-2" src={src} onTimeUpdate={handleTimeUpdate} />
      <Waveform
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
