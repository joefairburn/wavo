'use client';

import React, { useId, useInsertionEffect, useRef } from 'react';

export type Breakpoint = {
  maxWidth: number;
  reduction: number; // e.g., 2 means half the data, 4 means quarter, etc.
};

const BREAKPOINTS: Breakpoint[] = [
  { maxWidth: 1200, reduction: 2 },
  { maxWidth: 768, reduction: 4 },
  { maxWidth: 480, reduction: 8 },
];

const generateReducedContent = (data: string, reduction: number) => {
  const result = [];
  const segmentSize = Math.floor(data.length / reduction);

  // Process each segment
  for (let i = 0; i < segmentSize; i++) {
    let sum = 0;
    // Calculate sum for this position across all segments
    for (let j = 0; j < reduction; j++) {
      const index = i + segmentSize * j;
      sum += parseInt(data[index] || '0');
    }
    result.push(Math.round(sum / reduction));
  }

  return result.join('');
};

const calcRatio = (dataSize: number, thickness: number) => {
  const base = 400;

  //@TODO: Maybe round this? Not sure if that could cause issues.
  return base / thickness;
};

export interface WaveformProps {
  /** The waveform data as a string of numbers */
  data: string;
  /**
   * Controls the thickness of the waveform lines
   * @default 50
   * @min 1
   * @max 100
   */
  thickness?: number;
  /**
   * Controls the gap between the waveform lines
   * @default 0
   * @min 0
   * @max 1
   */
  gap?: number;
}

export default function FontRenderer({ data, thickness = 25, gap = 0 }: WaveformProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const dataSize = data.length;

  const dataHash = `wf-${thickness}-${gap}`;

  if (thickness < 1 || thickness > 100) {
    throw new Error('Waveform thickness must be between 1 and 100');
  }

  /*
   * Convert thickness from 1-100 to 0.04-1 range
   * This results in the fontweight being between 40 and 1000
   */
  const normalizedThickness = (Math.min(Math.max(thickness, 1), 100) / 100) * (1 - 0.04) + 0.04;

  const fontWeight = 1000 * normalizedThickness;

  useInsertionEffect(() => {
    const ratio = calcRatio(dataSize, normalizedThickness);

    /*
     * Remove existing style with this hash if it exists
     * This allows us to share styles between multiple waveforms, if they have the same props.
     */
    const existingStyle = document.querySelector(`style[data-waveform-style="${dataHash}"]`);
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }

    const style = document.createElement('style');
    // Add identifier attribute to style tag
    style.setAttribute('data-waveform-style', dataHash);

    style.textContent = `
      [data-waveform-hash="${dataHash}"] {
        container-type: inline-size;
				width: 100%;
      }
      [data-waveform-hash="${dataHash}"]::before {
        display: block;	
        content: "${data}"; 
        height: 100%; 
				font-weight: ${fontWeight};
        font-size: calc(${ratio}cqw / ${dataSize} - ${(ratio / 100) * gap}px);
				letter-spacing: ${gap}px;
      }
      ${BREAKPOINTS.map(
        ({ maxWidth, reduction }) => `
        @media (max-width: ${maxWidth}px) {
          [data-waveform-hash="${dataHash}"]::before {
            content: "${generateReducedContent(data, reduction)}";
            font-size: calc(${ratio}cqw / ${Math.floor(dataSize / reduction)} - ${(ratio / 100) * gap}px);	
          }
        }
      `,
      ).join('\n')}
    `;
    document.head.appendChild(style);

    console.timeEnd('Waveform');
    return () => {
      const styleToRemove = document.querySelector(`style[data-waveform-style="${dataHash}"]`);
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, [dataHash, data, dataSize, normalizedThickness, gap, fontWeight]);

  return <div ref={ref} aria-hidden="true" data-waveform-id={id} data-waveform-hash={dataHash} />;
}
