// Define the simplified structure needed by MusicPlayer props in page.tsx
type TrackData = {
  id: number;
  src: string;
  waveformJson: string;
};

/**
 * Generates an array of simplified mock track data with unique waveforms.
 * @param count The desired number of items in the generated array.
 * @returns An array of mock track data.
 */
export function generateTestData(count: number): TrackData[] {
  const result: TrackData[] = [];

  for (let i = 0; i < count; i++) {
    const uniqueId = 1000 + i; // Simple unique ID generation

    // Generate unique waveform data for each track inside the loop
    const uniqueWaveformJson = JSON.stringify(
      Array.from({ length: 100 }, () =>
        Number.parseFloat(Math.random().toFixed(4))
      )
    );

    const newItem: TrackData = {
      id: uniqueId,
      src: 'https://cdn.uppbeat.io/audio-output/344/1010/main-version/streaming-previews/STREAMING-home-weary-pines-main-version-01-49-3459.mp3',
      waveformJson: uniqueWaveformJson, // Assign the unique JSON
    };
    result.push(newItem);
  }
  return result;
}
