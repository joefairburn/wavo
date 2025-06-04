import { u as useWaveform, P as Progress, W as Waveform$1 } from './Waveform-client-Cgklj21k.js';
import React, { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';

/**
 * Finds the nearest valid amplitude value in a specified direction
 *
 * Searches through the dataPoints array starting from startIndex, moving in the direction
 * specified by increment, until reaching endCondition. Returns the first non-NaN value found.
 *
 * @param dataPoints - Array of amplitude values to search through
 * @param startIndex - Index position to start the search from
 * @param increment - Direction to search: positive for forward, negative for backward
 * @param endCondition - Stop searching when reaching this index
 * @returns The first valid amplitude value found, or NaN if none exists
 *
 * @internal Used by calculateSegmentAverage to handle gaps in data
 */ const findNeighborValue = (dataPoints, startIndex, increment, endCondition)=>{
    for(let i = startIndex; increment > 0 ? i < endCondition : i >= endCondition; i += increment){
        if (!isNaN(dataPoints[i])) return dataPoints[i];
    }
    return NaN;
};
/**
 * Calculates the average amplitude for a segment of the waveform data
 *
 * Takes a slice of the dataPoints array and calculates the average of valid values.
 * If no valid values exist, attempts to infer a value based on neighboring segments.
 *
 * @param dataPoints - Array of amplitude values
 * @param startIndex - Start index of the segment (inclusive)
 * @param endIndex - End index of the segment (exclusive)
 * @returns The average amplitude for the segment
 *
 * @internal Used by calculateReducedDataPoints to reduce data resolution
 */ const calculateSegmentAverage = (dataPoints, startIndex, endIndex)=>{
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
/**
 * Reduces a large dataset to a specified number of points
 *
 * Divides the input data into segments and calculates the average value for each segment.
 * This allows for rendering a waveform with fewer points while preserving the overall shape.
 *
 * @param barCount - Number of bars/points to generate in the output
 * @param dataPoints - Original high-resolution waveform data
 * @returns An array of averaged amplitude values with length equal to barCount
 *
 * @example
 * ```ts
 * // Reduce 10,000 data points to just 100 bars for display
 * const reducedData = calculateReducedDataPoints(100, originalAudioData);
 * ```
 */ const calculateReducedDataPoints = (barCount, dataPoints)=>{
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
 * Creates a memoized version of calculateReducedDataPoints for better performance
 *
 * Returns a function that caches results based on input parameters to avoid
 * unnecessary recalculations when inputs haven't changed. This is particularly
 * useful for large waveforms where the reduction calculation is expensive.
 *
 * @returns A memoized function with the same signature as calculateReducedDataPoints
 *
 * @internal Used to create the singleton getReducedDataPoints function
 */ const memoizedReducedDataPoints = ()=>{
    // Use a Map to store results
    const cache = new Map();
    return (barCount, dataPoints)=>{
        // Skip caching for small data sets
        if (dataPoints.length < 1000 && barCount < 100) {
            return calculateReducedDataPoints(barCount, dataPoints);
        }
        // Create a unique key that includes data content
        const key = `${barCount}:${dataPoints.length}:${dataPoints.toString()}`;
        if (cache.has(key)) {
            const cachedResult = cache.get(key);
            if (cachedResult) return cachedResult;
        }
        const result = calculateReducedDataPoints(barCount, dataPoints);
        cache.set(key, result);
        // Limit cache size to prevent memory issues
        if (cache.size > 20) {
            // Get the first key - TS doesn't know it's not undefined here
            const keys = Array.from(cache.keys());
            if (keys.length > 0) {
                cache.delete(keys[0]);
            }
        }
        return result;
    };
};
/**
 * Singleton instance of the memoized data reduction function
 *
 * This pre-initialized function provides efficient waveform data reduction
 * with built-in caching. Use this throughout the application instead of
 * calling calculateReducedDataPoints directly.
 *
 * @param barCount - Number of bars/points to generate
 * @param dataPoints - Original high-resolution waveform data
 * @returns An array of averaged amplitude values with length equal to barCount
 *
 * @example
 * ```ts
 * // In a component:
 * const reducedData = getReducedDataPoints(100, originalAudioData);
 * ```
 */ const getReducedDataPoints = memoizedReducedDataPoints();

/**
 * Renders a single bar of the waveform visualization
 *
 * Memoized component that renders a rectangle with the appropriate dimensions and styling
 * based on the amplitude value. The height is calculated as a percentage of the container.
 *
 * @param props - Properties for the bar
 */ const SingleBar = /*#__PURE__*/ React.memo(function SingleBar({ x, width, point, className, fill, radius = 2 }) {
    const barHeight = Math.max(1, point * 50);
    const heightInPixels = barHeight * 2;
    // Calculate normalized radius that respects the bar's dimensions
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
});
/**
 * Internal renderer component for the bars visualization
 *
 * Handles the actual rendering of bars based on the calculated data points.
 * This component is memoized to prevent unnecessary re-renders.
 *
 * @private
 */ const BarsRenderer = /*#__PURE__*/ React.memo(function BarsRenderer({ width = 3, gap = 1, radius = 2, className, dataPoints }) {
    const { hasProgress, id } = useWaveform();
    const previousDataPointsRef = useRef(dataPoints.length);
    useEffect(()=>{
        previousDataPointsRef.current = dataPoints.length;
    }, [
        dataPoints
    ]);
    const newBars = dataPoints.slice(previousDataPointsRef.current);
    // Memoize the previously rendered bars to prevent unnecessary re-renders
    const previousBars = useMemo(()=>{
        return dataPoints.slice(0, previousDataPointsRef.current).map((point, index)=>/*#__PURE__*/ React.createElement(SingleBar, {
                radius: radius,
                key: index,
                x: index * (width + gap),
                width: width,
                point: point
            }));
    }, [
        dataPoints,
        previousDataPointsRef.current,
        radius,
        width,
        gap
    ]);
    // Memoize the newly added bars
    const newBarsElements = useMemo(()=>{
        if (newBars.length === 0) return null;
        return /*#__PURE__*/ React.createElement("g", {
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
                point: point
            });
        }));
    }, [
        newBars,
        previousDataPointsRef.current,
        radius,
        width,
        gap,
        dataPoints.length
    ]);
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("g", {
        fill: hasProgress ? `url(#gradient-${id})` : 'currentColor',
        className: className
    }, /*#__PURE__*/ React.createElement("g", null, previousBars), newBarsElements));
});
/**
 * Bar-based waveform visualization component
 *
 * Renders the waveform as a series of vertical bars, with heights proportional to
 * the amplitude values. Automatically adjusts the number of bars based on available
 * width and handles resizing for responsive layouts.
 *
 * Features:
 * - Automatic bar count calculation based on container width
 * - Responsive resizing with ResizeObserver
 * - Optimized rendering with memoization
 * - Visual distinction between playing and non-playing sections (when used with Progress)
 * - Customizable bar width, gap, and corner radius
 *
 * @example
 * ```tsx
 * // Basic usage within a Waveform container
 * <Waveform dataPoints={audioData}>
 *   <Bars />
 * </Waveform>
 *
 * // Customized appearance
 * <Waveform dataPoints={audioData}>
 *   <Bars width={2} gap={1} radius={3} className="custom-bars" />
 *   <Progress />
 * </Waveform>
 * ```
 */ const Bars = ({ width = 3, gap = 1, radius = 2, className })=>{
    const [svgWidth, setSvgWidth] = useState(0); // Initialize with 0 or a sensible default
    const { dataPoints: _dataPoints, svgRef } = useWaveform();
    // Use ResizeObserver to update width when SVG container size changes
    useEffect(()=>{
        // Ensure svgRef is available
        if (!(svgRef == null ? void 0 : svgRef.current)) return;
        const resizeObserver = new ResizeObserver((entries)=>{
            for (const entry of entries){
                // Ensure contentRect is available and provides width
                if (entry.contentRect) {
                    const newWidth = entry.contentRect.width;
                    // Update state only if width has actually changed to avoid unnecessary renders
                    setSvgWidth((prevWidth)=>prevWidth !== newWidth ? newWidth : prevWidth);
                }
            }
        });
        // Start observing the SVG element
        resizeObserver.observe(svgRef.current);
        // Cleanup function to disconnect observer on component unmount or ref change
        return ()=>resizeObserver.disconnect();
    }, [
        svgRef
    ]); // Dependency array includes svgRef
    // Calculate bar count based on available space
    const barCount = useMemo(()=>{
        if (!svgWidth || svgWidth <= 0) return 0; // Handle zero or negative width
        const barTotalWidth = width + gap;
        return Math.max(1, Math.floor(svgWidth / barTotalWidth)); // Ensure at least 1 bar if width > 0
    }, [
        svgWidth,
        width,
        gap
    ]);
    // Calculate reduced data points based on bar count
    const reducedDataPoints = useMemo(()=>{
        return getReducedDataPoints(barCount, _dataPoints);
    }, [
        _dataPoints,
        barCount
    ]);
    // Render nothing until width is properly measured and bars calculated
    if (barCount === 0) return null;
    return /*#__PURE__*/ React.createElement(BarsRenderer, {
        width: width,
        gap: gap,
        radius: radius,
        className: className,
        dataPoints: reducedDataPoints
    });
};

// CSS variable names
const CSS_VAR_BAR_WIDTH = '--wavo-bar-width';
const CSS_VAR_BAR_GAP = '--wavo-bar-gap';
/**
 * Creates a path string for a series of bars with rounded corners
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each bar
 * @param gap - Gap between bars
 * @param radius - Radius for bar corners
 * @returns A path string for SVG
 */ const createBarPath = (dataPoints, width, gap, radius)=>{
    if (!dataPoints.length) return '';
    const paths = [];
    // Process each data point to create a path
    dataPoints.forEach((point, index)=>{
        const barHeight = Math.max(1, point * 50);
        const heightInPixels = barHeight * 2;
        // Calculate x position considering width and gap
        const x = index * (width + gap);
        // Calculate y positions for top and bottom of the bar
        const yTop = 50 - barHeight;
        const yBottom = 50 + barHeight;
        // Adjust radius based on bar dimensions
        const normalizedRadius = Math.min(radius, width < radius * 2 ? width / 2 : radius, heightInPixels < radius * 2 ? heightInPixels / 2 : radius);
        // Skip path creation for zero height bars
        if (barHeight <= 0) return;
        // Create path for a rounded rectangle
        if (normalizedRadius > 0) {
            // Top-left corner
            paths.push(`M${x + normalizedRadius},${yTop}`);
            // Top edge and top-right corner
            paths.push(`H${x + width - normalizedRadius}`);
            paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + width},${yTop + normalizedRadius}`);
            // Right edge and bottom-right corner
            paths.push(`V${yBottom - normalizedRadius}`);
            paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + width - normalizedRadius},${yBottom}`);
            // Bottom edge and bottom-left corner
            paths.push(`H${x + normalizedRadius}`);
            paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x},${yBottom - normalizedRadius}`);
            // Left edge and close the path
            paths.push(`V${yTop + normalizedRadius}`);
            paths.push(`A${normalizedRadius},${normalizedRadius} 0 0 1 ${x + normalizedRadius},${yTop}`);
            paths.push('Z');
        } else {
            // Simple rectangle without rounded corners
            paths.push(`M${x},${yTop}`);
            paths.push(`H${x + width}`);
            paths.push(`V${yBottom}`);
            paths.push(`H${x}`);
            paths.push(`V${yTop}`);
            paths.push('Z');
        }
    });
    return paths.join(' ');
};
/**
 * Creates a path string for a continuous line connecting data points
 * Can render as jagged line or smooth curve depending on curvature
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @param curvature - Smoothness of the curve (0 = jagged lines, 1 = very smooth)
 * @returns A path string for SVG
 */ const createLinePath = (dataPoints, width, gap, curvature = 0)=>{
    if (!dataPoints.length) return '';
    // If curvature is zero or very low, create a traditional jagged line path
    if (curvature <= 0.05) {
        return createJaggedLinePath(dataPoints, width, gap);
    }
    // Otherwise create a smooth curve with the specified curvature
    return createSmoothLinePath(dataPoints, width, gap, curvature);
};
/**
 * Creates a path string for a jagged line connecting data points
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @returns A path string for SVG
 */ const createJaggedLinePath = (dataPoints, width, gap)=>{
    if (!dataPoints.length) return '';
    const totalWidth = width + gap;
    let path = '';
    // Create the top half of the waveform
    path += 'M0,50 '; // Start at the middle
    dataPoints.forEach((point, index)=>{
        const barHeight = Math.max(1, point * 50);
        const x = index * totalWidth + width / 2; // Center of each bar
        path += `L${x},${50 - barHeight} `;
    });
    // Connect to the bottom half
    const lastIndex = dataPoints.length - 1;
    const lastX = lastIndex * totalWidth + width / 2;
    path += `L${lastX},50 `; // Back to middle line at the end
    // Create the bottom half of the waveform (mirror of top)
    for(let i = dataPoints.length - 1; i >= 0; i--){
        const point = dataPoints[i];
        const barHeight = Math.max(1, point * 50);
        const x = i * totalWidth + width / 2; // Center of each bar
        path += `L${x},${50 + barHeight} `;
    }
    // Close the path
    path += 'L0,50 Z';
    return path;
};
/**
 * Creates a path string for a smooth curve connecting data points
 * Uses cubic bezier curves for smooth transitions between points
 *
 * @param dataPoints - Array of normalized amplitude values
 * @param width - Width of each segment
 * @param gap - Gap between segments
 * @param curvature - Smoothness of the curve (0-1)
 * @returns A path string for SVG
 */ const createSmoothLinePath = (dataPoints, width, gap, curvature)=>{
    if (!dataPoints.length) return '';
    if (dataPoints.length < 3) return createJaggedLinePath(dataPoints, width, gap); // Fallback to line path for few points
    // Clamp curvature between 0 and 1
    const tensionFactor = Math.min(Math.max(curvature, 0), 1);
    const totalWidth = width + gap;
    const points = [];
    // Generate points for the top half
    points.push([
        0,
        50
    ]); // Start at the middle
    dataPoints.forEach((point, index)=>{
        const barHeight = Math.max(1, point * 50);
        const x = index * totalWidth + width / 2; // Center of each bar
        points.push([
            x,
            50 - barHeight
        ]);
    });
    const lastIndex = dataPoints.length - 1;
    const lastX = lastIndex * totalWidth + width / 2;
    points.push([
        lastX,
        50
    ]); // Back to middle line at the end
    // Generate points for the bottom half (mirror of top)
    for(let i = dataPoints.length - 1; i >= 0; i--){
        const point = dataPoints[i];
        const barHeight = Math.max(1, point * 50);
        const x = i * totalWidth + width / 2;
        points.push([
            x,
            50 + barHeight
        ]);
    }
    // Close back to starting point
    points.push([
        0,
        50
    ]);
    // Create the path with smooth curves
    return createSmoothPath(points, tensionFactor);
};
/**
 * Creates a smooth path from a set of points
 *
 * @param points - Array of [x,y] coordinates
 * @param tensionFactor - How smooth the curve should be (0-1)
 * @returns SVG path string
 */ const createSmoothPath = (points, tensionFactor)=>{
    if (points.length < 2) return '';
    let path = `M${points[0][0]},${points[0][1]} `;
    // Enhanced tension calculation
    const tension = 0.2 + tensionFactor * 0.3; // Map 0-1 to sensible tension range 0.2-0.5
    if (points.length === 2) {
        // With only two points, just draw a line
        path += `L${points[1][0]},${points[1][1]} `;
        return path;
    }
    // For three or more points, use cubic bezier curves
    for(let i = 0; i < points.length - 1; i++){
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        // Control points
        const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
        const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
        path += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]} `;
    }
    // Close the path
    path += 'Z';
    return path;
};
/**
 * Path-based waveform visualization component
 *
 * Renders the waveform as a single SVG path element, which provides better performance
 * for larger waveforms than the Bars component, which creates many individual elements.
 *
 * Supports two rendering modes:
 * 1. 'bar' - Similar appearance to Bars but as a single optimized path element
 * 2. 'line' - Continuous line/curve connecting all data points
 *
 * Features:
 * - Better performance for large waveforms (uses single path vs. many elements)
 * - Support for both bar and line/curve rendering modes
 * - Automatic data point reduction for optimal rendering
 * - Responsive to container size changes
 * - Compatible with Progress component for partial coloring
 *
 * @example
 * ```tsx
 * // Basic bar-type path (better performance than Bars for large datasets)
 * <Waveform dataPoints={audioData}>
 *   <Path type="bar" width={2} gap={1} radius={3} />
 * </Waveform>
 *
 * // Continuous line visualization
 * <Waveform dataPoints={audioData}>
 *   <Path type="line" smooth={true} curvature={0.5} />
 * </Waveform>
 *
 * // With progress indicator
 * <Waveform dataPoints={audioData} progress={0.5}>
 *   <Path type="line" />
 *   <Progress progress={0.5} color="#f00" />
 * </Waveform>
 * ```
 */ const Path = ({ type = 'bar', width = 3, gap = 1, radius = 2, curvature = 0, smooth = true, className })=>{
    const { dataPoints: _dataPoints, svgRef, hasProgress, id } = useWaveform();
    // We need this state to force re-renders when the size changes
    const [svgWidth, setSvgWidth] = useState(null);
    // Function to measure and update SVG dimensions
    const updateSvgDimensions = useCallback(()=>{
        if (svgRef == null ? void 0 : svgRef.current) {
            setSvgWidth(svgRef.current.clientWidth);
        }
    }, [
        svgRef
    ]);
    // Calculate segment width and gap using CSS variables if available
    const cssBarWidth = useMemo(()=>{
        if (!(svgRef == null ? void 0 : svgRef.current)) return width;
        const style = window.getComputedStyle(svgRef.current);
        const cssWidth = style.getPropertyValue(CSS_VAR_BAR_WIDTH);
        return cssWidth ? parseInt(cssWidth, 10) : width;
    }, [
        svgRef,
        width
    ]);
    const cssBarGap = useMemo(()=>{
        if (!(svgRef == null ? void 0 : svgRef.current)) return gap;
        const style = window.getComputedStyle(svgRef.current);
        const cssGap = style.getPropertyValue(CSS_VAR_BAR_GAP);
        return cssGap ? parseInt(cssGap, 10) : gap;
    }, [
        svgRef,
        gap
    ]);
    // Calculate segment count based on SVG width and dimensions
    const segmentCount = useMemo(()=>{
        if (!svgWidth) return 0;
        return Math.floor(svgWidth / (cssBarWidth + cssBarGap));
    }, [
        svgWidth,
        cssBarWidth,
        cssBarGap
    ]);
    // Use the memoized version for better performance with large datasets
    const reducedDataPoints = useMemo(()=>{
        if (!segmentCount) return [];
        return getReducedDataPoints(segmentCount, _dataPoints);
    }, [
        segmentCount,
        _dataPoints
    ]);
    // Generate the path string
    const pathString = useMemo(()=>{
        if (!reducedDataPoints.length) return '';
        if (type === 'bar') {
            return createBarPath(reducedDataPoints, cssBarWidth, cssBarGap, radius);
        } else if (type === 'line') {
            // Use 0.1 curvature if smooth is true, otherwise use the provided curvature
            const smoothingValue = smooth ? 0.1 : curvature;
            return createLinePath(reducedDataPoints, cssBarWidth, cssBarGap, smoothingValue);
        }
        return '';
    }, [
        reducedDataPoints,
        cssBarWidth,
        cssBarGap,
        radius,
        type,
        curvature,
        smooth
    ]);
    // Calculate the viewBox to ensure the path scales properly with the container
    const viewBox = useMemo(()=>{
        if (!svgWidth) return '0 0 100 100';
        // Width is just the full svg width to allow all bars to be visible
        const totalWidth = segmentCount * (cssBarWidth + cssBarGap);
        // Use the container's aspect ratio to ensure we fit in the SVG
        return `0 0 ${totalWidth} 100`;
    }, [
        svgWidth,
        segmentCount,
        cssBarWidth,
        cssBarGap
    ]);
    // Set up resize observer and initial measurement
    useLayoutEffect(()=>{
        if (!(svgRef == null ? void 0 : svgRef.current)) return;
        // Initial measurement
        updateSvgDimensions();
        // Set up resize observer
        const resizeObserver = new ResizeObserver(()=>{
            updateSvgDimensions();
        });
        resizeObserver.observe(svgRef.current);
        return ()=>resizeObserver.disconnect();
    }, [
        svgRef,
        updateSvgDimensions
    ]);
    // Return null if there are no datapoints
    if (!reducedDataPoints.length || !pathString) return null;
    return(// Use an svg element to apply proper scaling within the parent SVG
    /*#__PURE__*/ React.createElement("svg", {
        width: "100%",
        height: "100%",
        preserveAspectRatio: "none",
        viewBox: viewBox,
        style: {
            overflow: 'visible'
        }
    }, /*#__PURE__*/ React.createElement("path", {
        d: pathString,
        fill: hasProgress ? `url(#gradient-${id})` : 'var(--wavo-bar-color, currentColor)',
        className: className,
        "data-wavo-path": type,
        style: {
            willChange: 'none'
        }
    })));
};

// Export components directly (don't import from exports.ts)
const Waveform = {
    Container: Waveform$1,
    Bars,
    Progress,
    Path
};

export { Waveform };
