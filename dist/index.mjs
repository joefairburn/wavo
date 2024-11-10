import React, { useState } from 'react';
import { u as useWaveform, a as useIsClient, W as Waveform, P as Progress } from './Waveform-client-5nhCWAXf.mjs';

function SingleBar({ x, width, point, className, fill, isFirstRender }) {
    useWaveform();
    useIsClient();
    const barHeight = Math.max(1, point * 50);
    // const isAnimated = isStyled && isFirstRender;
    return /*#__PURE__*/ React.createElement("rect", {
        x: x + 'px',
        y: `${50 - barHeight}%`,
        width: width,
        height: `${barHeight * 2}%`,
        fill: fill,
        className: className,
        "data-wavo-bar": true
    });
}
function Bars({ width = 3, gap = 1 }) {
    const { dataPoints, hasProgress, id } = useWaveform();
    const [previouslyRenderedBars, setPreviouslyRenderedBars] = useState(dataPoints.length);
    if (previouslyRenderedBars > dataPoints.length) setPreviouslyRenderedBars(dataPoints.length);
    const newBars = dataPoints.slice(previouslyRenderedBars);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("g", {
        fill: hasProgress ? `url(#gradient-${id})` : 'currentColor'
    }, /*#__PURE__*/ React.createElement("g", null, dataPoints.slice(0, previouslyRenderedBars).map((point, index)=>/*#__PURE__*/ React.createElement(SingleBar, {
            key: index,
            x: index * (width + gap),
            width: width,
            point: point,
            isFirstRender: false
        }))), /*#__PURE__*/ React.createElement("g", {
        "data-new-bars": newBars.length > 0 ? 'true' : 'false',
        onAnimationEnd: ()=>setPreviouslyRenderedBars(dataPoints.length)
    }, newBars.map((point, index)=>{
        const actualIndex = index + previouslyRenderedBars;
        return /*#__PURE__*/ React.createElement(SingleBar, {
            key: actualIndex,
            x: actualIndex * (width + gap),
            width: width,
            point: point,
            isFirstRender: true
        });
    }))));
}

var index = {
    Container: Waveform,
    Bars,
    Progress
};

export { index as default };
