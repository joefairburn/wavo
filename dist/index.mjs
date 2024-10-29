import React, { useId, useRef, useInsertionEffect } from 'react';
import { W as WaveformAsSVG$1 } from './WaveformAsSVG-client-DUdu8eO1.mjs';

const BREAKPOINTS = [
    {
        maxWidth: 1200,
        reduction: 2
    },
    {
        maxWidth: 768,
        reduction: 4
    },
    {
        maxWidth: 480,
        reduction: 8
    }
];
const generateReducedContent = (data, reduction)=>{
    const result = [];
    const segmentSize = Math.floor(data.length / reduction);
    // Process each segment
    for(let i = 0; i < segmentSize; i++){
        let sum = 0;
        // Calculate sum for this position across all segments
        for(let j = 0; j < reduction; j++){
            const index = i + segmentSize * j;
            sum += parseInt(data[index] || '0');
        }
        result.push(Math.round(sum / reduction));
    }
    return result.join('');
};
const calcRatio = (dataSize, thickness)=>{
    const base = 400;
    //@TODO: Maybe round this? Not sure if that could cause issues.
    return base / thickness;
};
function FontRenderer({ data, thickness = 25, gap = 0 }) {
    const id = useId();
    const ref = useRef(null);
    const dataSize = data.length;
    const dataHash = `wf-${thickness}-${gap}`;
    if (thickness < 1 || thickness > 100) {
        throw new Error('Waveform thickness must be between 1 and 100');
    }
    /*
   * Convert thickness from 1-100 to 0.04-1 range
   * This results in the fontweight being between 40 and 1000
   */ const normalizedThickness = Math.min(Math.max(thickness, 1), 100) / 100 * (1 - 0.04) + 0.04;
    const fontWeight = 1000 * normalizedThickness;
    useInsertionEffect(()=>{
        const ratio = calcRatio(dataSize, normalizedThickness);
        /*
     * Remove existing style with this hash if it exists
     * This allows us to share styles between multiple waveforms, if they have the same props.
     */ const existingStyle = document.querySelector(`style[data-waveform-style="${dataHash}"]`);
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
        font-size: calc(${ratio}cqw / ${dataSize} - ${ratio / 100 * gap}px);
				letter-spacing: ${gap}px;
      }
      ${BREAKPOINTS.map(({ maxWidth, reduction })=>`
        @media (max-width: ${maxWidth}px) {
          [data-waveform-hash="${dataHash}"]::before {
            content: "${generateReducedContent(data, reduction)}";
            font-size: calc(${ratio}cqw / ${Math.floor(dataSize / reduction)} - ${ratio / 100 * gap}px);	
          }
        }
      `).join('\n')}
    `;
        document.head.appendChild(style);
        console.timeEnd('Waveform');
        return ()=>{
            const styleToRemove = document.querySelector(`style[data-waveform-style="${dataHash}"]`);
            if (styleToRemove) {
                document.head.removeChild(styleToRemove);
            }
        };
    }, [
        dataHash,
        data,
        dataSize,
        normalizedThickness,
        gap,
        fontWeight
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        ref: ref,
        "aria-hidden": "true",
        "data-waveform-id": id,
        "data-waveform-hash": dataHash
    });
}

const WaveformAsFont = FontRenderer;
const WaveformAsSVG = WaveformAsSVG$1;

export { WaveformAsFont, WaveformAsSVG };
