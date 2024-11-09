import React, { createContext, useContext, useId } from 'react';

interface WaveformContextType {
  dataPoints: number[];
  id: string;
  svgRef: React.RefObject<SVGSVGElement> | null;
  hasProgress: boolean;
  isStyled: boolean;
}

const WaveformContext = createContext<WaveformContextType | null>(null);

interface WaveformProviderProps {
  children: React.ReactNode;
  dataPoints: number[];
  svgRef: React.RefObject<SVGSVGElement>;
  hasProgress: boolean;
  isStyled: boolean;
}

export function WaveformProvider({ children, dataPoints, svgRef, hasProgress, isStyled }: WaveformProviderProps) {
  const id = useId().replace(/:/g, '');

  return (
    <WaveformContext.Provider value={{ dataPoints, id, svgRef, hasProgress, isStyled }}>
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
