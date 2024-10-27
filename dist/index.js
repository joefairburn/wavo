'use client';
var React = require('react');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

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
    return base / thickness;
};
const Waveform = ({ data, thickness = 50 })=>{
    const id = React.useId();
    const dataAttr = `waveform-${id}`;
    const ref = React.useRef(null);
    const dataSize = data.length;
    if (thickness < 1 || thickness > 100) {
        throw new Error('Waveform thickness must be between 1 and 100');
    }
    /*
   * Convert thickness from 1-100 to 0.04-1 range
   * This results in the fontweight being between 40 and 1000
   */ const normalizedThickness = Math.min(Math.max(thickness, 1), 100) / 100 * (1 - 0.04) + 0.04;
    const fontWeight = 1000 * normalizedThickness;
    React.useInsertionEffect(()=>{
        const ratio = calcRatio(dataSize, normalizedThickness);
        console.time('Waveform');
        const style = document.createElement('style');
        style.textContent = `
      [data-waveform="${dataAttr}"] {
        container-type: inline-size;
      }
      [data-waveform="${dataAttr}"]::before {
        display: block;	
        content: "${data}"; 
        height: 100%; 
				font-weight: ${fontWeight};
        font-size: calc(${ratio}cqw / ${dataSize});
      }
      ${BREAKPOINTS.map(({ maxWidth, reduction })=>`
        @media (max-width: ${maxWidth}px) {
          [data-waveform="${dataAttr}"]::before {
            content: "${generateReducedContent(data, reduction)}";
            font-size: calc(${ratio}cqw / ${Math.floor(dataSize / reduction)});
          }
        }
      `).join('\n')}
    `;
        document.head.appendChild(style);
        console.timeEnd('Waveform');
        return ()=>{
            document.head.removeChild(style);
        };
    }, [
        dataAttr,
        data,
        dataSize
    ]);
    return /*#__PURE__*/ React__default.default.createElement("div", {
        ref: ref,
        "aria-hidden": "true",
        "data-waveform": dataAttr
    });
};

exports.Waveform = Waveform;
