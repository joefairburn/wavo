import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { u as useWaveform, W as Waveform, P as Progress } from './Waveform-client-DF-nvZY9.mjs';

const findNeighborValue = (dataPoints, startIndex, increment, endCondition)=>{
    for(let i = startIndex; increment > 0 ? i < endCondition : i >= endCondition; i += increment){
        if (!isNaN(dataPoints[i])) return dataPoints[i];
    }
    return NaN;
};
const calculateSegmentAverage = (dataPoints, startIndex, endIndex)=>{
    // Calculate average using reduce
    const segment = dataPoints.slice(startIndex, endIndex);
    const { sum, count } = segment.reduce((acc, val)=>{
        if (!isNaN(val)) {
            acc.sum += val;
            acc.count++;
        }
        return acc;
    }, {
        sum: 0,
        count: 0
    });
    if (count > 0) return sum / count;
    // If no valid points, search for neighbors
    const prevValue = findNeighborValue(dataPoints, startIndex - 1, -1, 0);
    const nextValue = findNeighborValue(dataPoints, endIndex, 1, dataPoints.length);
    // Calculate final value based on available neighbors
    if (!isNaN(prevValue) && !isNaN(nextValue)) return (prevValue + nextValue) / 2;
    if (!isNaN(prevValue)) return prevValue;
    if (!isNaN(nextValue)) return nextValue;
    return 0;
};
const calculateReducedDataPoints = (barCount, dataPoints)=>{
    if (barCount === 0) return [];
    const length = dataPoints.length; // Cache length
    return Array.from({
        length: barCount
    }, (_, barIndex)=>{
        const startIndex = Math.floor(barIndex / barCount * length);
        const endIndex = Math.floor((barIndex + 1) / barCount * length);
        return calculateSegmentAverage(dataPoints, startIndex, endIndex);
    });
};
/**
 * Creates a debounced version of a function
 */ const createDebouncedFunction = (callback, delay = 30)=>{
    let timeoutId;
    return (value)=>{
        clearTimeout(timeoutId);
        timeoutId = setTimeout(()=>callback(value), delay);
    };
};

function SingleBar({ x, width, point, className, fill, radius = 2, shouldAnimateIn }) {
    const barHeight = Math.max(1, point * 50);
    const heightInPixels = barHeight * 2;
    const normalizedRadius = Math.min(radius, width < radius * 2 ? width / 2 : radius, heightInPixels < radius * 2 ? heightInPixels / 2 : radius);
    return /*#__PURE__*/ React.createElement("rect", {
        x: x + 'px',
        y: `${50 - barHeight}%`,
        width: width,
        height: `${barHeight * 2}%`,
        rx: `${normalizedRadius}px`,
        ry: `${normalizedRadius}px`,
        fill: fill,
        className: className,
        "data-wavo-bar": true
    });
}
const Bars = ({ width = 3, gap = 1, radius = 2, className, dataPoints })=>{
    const { hasProgress, id } = useWaveform();
    const previousDataPointsRef = useRef(dataPoints.length);
    useEffect(()=>{
        previousDataPointsRef.current = dataPoints.length;
    }, [
        dataPoints
    ]);
    const newBars = dataPoints.slice(previousDataPointsRef.current);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("g", {
        fill: hasProgress ? `url(#gradient-${id})` : 'currentColor',
        className: className
    }, /*#__PURE__*/ React.createElement("g", null, dataPoints.slice(0, previousDataPointsRef.current).map((point, index)=>/*#__PURE__*/ React.createElement(SingleBar, {
            radius: radius,
            key: index,
            x: index * (width + gap),
            width: width,
            point: point,
            shouldAnimateIn: false
        }))), newBars.length > 0 && /*#__PURE__*/ React.createElement("g", {
        key: previousDataPointsRef.current,
        "data-new-bars": "true",
        onAnimationEnd: ()=>{
            previousDataPointsRef.current = dataPoints.length;
        }
    }, newBars.map((point, index)=>{
        const actualIndex = index + previousDataPointsRef.current;
        return /*#__PURE__*/ React.createElement(SingleBar, {
            key: actualIndex,
            radius: radius,
            x: actualIndex * (width + gap),
            width: width,
            point: point,
            shouldAnimateIn: true
        });
    }))));
};
const BarsContainer = ({ width = 3, gap = 1, radius = 2, className })=>{
    const [svgWidth, setSvgWidth] = useState(null);
    const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
    const { dataPoints: _dataPoints, svgRef } = useWaveform();
    const reducedDataPoints = React.useMemo(()=>{
        var _calculateReducedDataPoints;
        return (_calculateReducedDataPoints = calculateReducedDataPoints(barCount, _dataPoints)) != null ? _calculateReducedDataPoints : [];
    }, [
        barCount,
        _dataPoints
    ]);
    useLayoutEffect(()=>{
        if (!(svgRef == null ? void 0 : svgRef.current)) return;
        const debouncedSetWidth = createDebouncedFunction(setSvgWidth);
        const resizeObserver = new ResizeObserver((entries)=>{
            for (const entry of entries){
                debouncedSetWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(svgRef.current);
        setSvgWidth(svgRef.current.clientWidth);
        return ()=>resizeObserver.disconnect();
    }, []);
    // Return null if there are no datapoints
    if (!reducedDataPoints.length) return null;
    return /*#__PURE__*/ React.createElement(Bars, {
        width: width,
        gap: gap,
        radius: radius,
        className: className,
        dataPoints: reducedDataPoints
    });
};

var index = {
    Container: Waveform,
    Bars: BarsContainer,
    Progress
};

export { index as default };
