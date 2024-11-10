Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var WaveformClient = require('./Waveform-client-C_9pfDF0.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

function SingleBar({ x, width, point, className, fill, isFirstRender }) {
    const barHeight = Math.max(1, point * 50);
    return /*#__PURE__*/ React__default.default.createElement("rect", {
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
    const { dataPoints, hasProgress, id } = WaveformClient.useWaveform();
    const [previouslyRenderedBars, setPreviouslyRenderedBars] = React.useState(dataPoints.length);
    if (previouslyRenderedBars > dataPoints.length) setPreviouslyRenderedBars(dataPoints.length);
    const newBars = dataPoints.slice(previouslyRenderedBars);
    return /*#__PURE__*/ React__default.default.createElement(React__default.default.Fragment, null, /*#__PURE__*/ React__default.default.createElement("g", {
        fill: hasProgress ? `url(#gradient-${id})` : 'currentColor'
    }, /*#__PURE__*/ React__default.default.createElement("g", null, dataPoints.slice(0, previouslyRenderedBars).map((point, index)=>/*#__PURE__*/ React__default.default.createElement(SingleBar, {
            key: index,
            x: index * (width + gap),
            width: width,
            point: point,
            isFirstRender: false
        }))), /*#__PURE__*/ React__default.default.createElement("g", {
        "data-new-bars": newBars.length > 0 ? 'true' : 'false',
        onAnimationEnd: ()=>setPreviouslyRenderedBars(dataPoints.length)
    }, newBars.map((point, index)=>{
        const actualIndex = index + previouslyRenderedBars;
        return /*#__PURE__*/ React__default.default.createElement(SingleBar, {
            key: actualIndex,
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
