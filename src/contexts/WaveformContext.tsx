import React, { createContext, useContext, useId } from 'react';

interface WaveformContextType {
  dataPoints: number[];
  id: string;
  svgRef: React.RefObject<SVGSVGElement> | null;
  hasProgress: boolean;
  isStyled: boolean;
  transitionDuration: number;
}

const WaveformContext = createContext<WaveformContextType | null>(null);

interface WaveformProviderProps {
  children: React.ReactNode;
  dataPoints: number[];
  svgRef: React.RefObject<SVGSVGElement>;
  hasProgress: boolean;
  isStyled: boolean;
  transitionDuration: number;
}

export function WaveformProvider({
  children,
  dataPoints,
  svgRef,
  hasProgress,
  isStyled,
  transitionDuration,
}: WaveformProviderProps) {
  const id = useId().replace(/:/g, '');

  return (
    <WaveformContext.Provider value={{ dataPoints, id, svgRef, hasProgress, isStyled, transitionDuration }}>
      {children}
    </WaveformContext.Provider>
  );
}

export function useWaveform() {
  const context = useContext(WaveformContext);
  if (!context) {
    throw new Error('useWaveform must be used within a WaveformProvider');
  }
  return context;
}
