import React, { createContext, useContext, useId } from 'react';
import { WaveformData, EasingFunction } from '../Waveform';

export interface WaveformContextProps {
  dataPoints: WaveformData;
  svgRef: React.RefObject<SVGSVGElement>;
  hasProgress: boolean;
  isStyled: boolean;
  transitionDuration: number;
  easing: EasingFunction;
  id: string;
}

interface WaveformContextType {
  dataPoints: WaveformData;
  id: string;
  svgRef: React.RefObject<SVGSVGElement> | null;
  hasProgress: boolean;
  isStyled: boolean;
  transitionDuration: number;
  easing: EasingFunction;
}

const WaveformContext = createContext<WaveformContextType | null>(null);

interface WaveformProviderProps {
  children: React.ReactNode;
  dataPoints: WaveformData;
  svgRef: React.RefObject<SVGSVGElement>;
  hasProgress: boolean;
  isStyled: boolean;
  transitionDuration: number;
  easing: EasingFunction;
}

export function WaveformProvider({
  children,
  dataPoints,
  svgRef,
  hasProgress,
  isStyled,
  transitionDuration,
  easing,
}: WaveformProviderProps) {
  const id = useId().replace(/:/g, '');

  return (
    <WaveformContext.Provider value={{ dataPoints, id, svgRef, hasProgress, isStyled, transitionDuration, easing }}>
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
