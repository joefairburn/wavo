Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var WaveformClient = require('./Waveform-client-BwOj_1pW.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

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

function SingleBar({ x, width, point, className, fill, radius = 2 }) {
    const barHeight = Math.max(1, point * 50);
    const heightInPixels = barHeight * 2;
    const normalizedRadius = Math.min(radius, width < radius * 2 ? width / 2 : radius, heightInPixels < radius * 2 ? heightInPixels / 2 : radius);
    return /*#__PURE__*/ React__default.default.createElement("rect", {
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
function Bars({ width = 3, gap = 1, radius = 2 }) {
    const [svgWidth, setSvgWidth] = React.useState(null);
    const barCount = svgWidth ? Math.floor(svgWidth / (width + gap)) : 0;
    const { dataPoints: _dataPoints, hasProgress, id, svgRef } = WaveformClient.useWaveform();
    const reducedDataPoints = React__default.default.useMemo(()=>{
        var _calculateReducedDataPoints;
        return (_calculateReducedDataPoints = calculateReducedDataPoints(barCount, _dataPoints)) != null ? _calculateReducedDataPoints : [];
    }, [
        barCount,
        _dataPoints
    ]);
    const [previouslyRenderedBars, setPreviouslyRenderedBars] = React.useState(null);
    React.useLayoutEffect(()=>{
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
    if (previouslyRenderedBars && previouslyRenderedBars > reducedDataPoints.length) setPreviouslyRenderedBars(reducedDataPoints.length);
    const newBars = reducedDataPoints.slice(previouslyRenderedBars != null ? previouslyRenderedBars : reducedDataPoints.length);
    return /*#__PURE__*/ React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/ React__default.default.createElement("g", {
        fill: hasProgress ? `url(#gradient-${id})` : 'currentColor'
    }, /*#__PURE__*/ React__default.default.createElement("g", null, reducedDataPoints.slice(0, previouslyRenderedBars != null ? previouslyRenderedBars : reducedDataPoints.length).map((point, index)=>/*#__PURE__*/ React__default.default.createElement(SingleBar, {
            radius: radius,
            key: index,
            x: index * (width + gap),
            width: width,
            point: point,
            isFirstRender: false
        }))), /*#__PURE__*/ React__default.default.createElement("g", {
        "data-new-bars": newBars.length > 0 ? 'true' : 'false',
        onAnimationEnd: ()=>setPreviouslyRenderedBars(reducedDataPoints.length)
    }, newBars.map((point, index)=>{
        const actualIndex = index + (previouslyRenderedBars != null ? previouslyRenderedBars : reducedDataPoints.length);
        return /*#__PURE__*/ React__default.default.createElement(SingleBar, {
            key: actualIndex,
            radius: radius,
            x: actualIndex * (width + gap),
            width: width,
            point: point,
            isFirstRender: true
        });
    }))));
}

var index = {
    Container: WaveformClient.Waveform,
    Bars,
    Progress: WaveformClient.Progress
};

exports.default = index;
