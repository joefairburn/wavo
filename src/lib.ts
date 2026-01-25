import type { NormalizedAmplitude, WaveformData } from "./waveform";

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
 */
const findNeighborValue = (
  dataPoints: readonly NormalizedAmplitude[],
  startIndex: number,
  increment: number,
  endCondition: number,
): number => {
  for (let i = startIndex; increment > 0 ? i < endCondition : i >= endCondition; i += increment) {
    if (!Number.isNaN(dataPoints[i])) {
      return dataPoints[i];
    }
  }

  return Number.NaN;
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
 */
const calculateSegmentAverage = (
  dataPoints: readonly NormalizedAmplitude[],
  startIndex: number,
  endIndex: number,
): number => {
  let sum = 0;
  let count = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const val = dataPoints[i];
    if (!Number.isNaN(val)) {
      sum += val;
      count++;
    }
  }

  if (count > 0) {
    return sum / count;
  }

  // If no valid points, search for neighbors
  const prevValue = findNeighborValue(dataPoints, startIndex - 1, -1, 0);
  const nextValue = findNeighborValue(dataPoints, endIndex, 1, dataPoints.length);

  // Calculate final value based on available neighbors
  if (!(Number.isNaN(prevValue) || Number.isNaN(nextValue))) {
    return (prevValue + nextValue) / 2;
  }
  if (!Number.isNaN(prevValue)) {
    return prevValue;
  }
  if (!Number.isNaN(nextValue)) {
    return nextValue;
  }
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
 */
export const calculateReducedDataPoints = (
  barCount: number,
  dataPoints: WaveformData,
): number[] => {
  if (barCount === 0) {
    return [];
  }

  const length = dataPoints.length; // Cache length
  return Array.from({ length: barCount }, (_, barIndex) => {
    const startIndex = Math.floor((barIndex / barCount) * length);
    const endIndex = Math.floor(((barIndex + 1) / barCount) * length);
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
 * Uses a WeakMap with data array reference as key for O(1) cache lookups:
 * - Has O(1) lookup time regardless of array size
 * - Automatically garbage collects when data arrays are no longer referenced
 * - Stores per-barCount results in a nested Map for multi-resolution support
 *
 * Note: This assumes immutable data patterns - create a new array when data changes.
 *
 * @returns A memoized function with the same signature as calculateReducedDataPoints
 *
 * @internal Used to create the singleton getReducedDataPoints function
 */
export const memoizedReducedDataPoints = () => {
  // WeakMap keyed by data array reference, value is Map of barCount -> result
  // WeakMap allows garbage collection when data arrays are no longer referenced
  const cache = new WeakMap<WaveformData, Map<number, number[]>>();

  return (barCount: number, dataPoints: WaveformData): number[] => {
    // Skip caching for small data sets where computation is cheap
    if (dataPoints.length < 1000 && barCount < 100) {
      return calculateReducedDataPoints(barCount, dataPoints);
    }

    // Get or create the barCount map for this data array
    let barCountMap = cache.get(dataPoints);
    if (!barCountMap) {
      barCountMap = new Map<number, number[]>();
      cache.set(dataPoints, barCountMap);
    }

    // Check if we have a cached result for this barCount
    const cachedResult = barCountMap.get(barCount);
    if (cachedResult) {
      return cachedResult;
    }

    // Calculate and cache the result
    const result = calculateReducedDataPoints(barCount, dataPoints);
    barCountMap.set(barCount, result);

    // Limit barCount entries per data array to prevent memory issues
    if (barCountMap.size > 20) {
      const firstKey = barCountMap.keys().next().value;
      if (firstKey !== undefined) {
        barCountMap.delete(firstKey);
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
 */
export const getReducedDataPoints = memoizedReducedDataPoints();

/**
 * Cross-browser implementation of requestIdleCallback
 *
 * Schedules a callback to be called during browser idle periods.
 * Falls back to setTimeout for browsers that don't support requestIdleCallback.
 *
 * @param callback - Function to call during idle period
 * @param timeout - Maximum delay before the callback is invoked regardless of idle state
 * @returns Numeric ID that can be used to cancel the callback
 */
export const requestIdleCallback = (callback: () => void, timeout = 2000) => {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 100);
};

/**
 * Creates a debounced version of a function
 *
 * Returns a function that will only execute after the specified delay
 * has passed without the function being called again. Useful for handling
 * rapid events like resize or scroll.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds before executing the function
 * @returns Debounced function
 *
 * @example
 * ```ts
 * // Create a debounced resize handler
 * const handleResize = createDebouncedFunction((width) => {
 *   console.log(`Window resized to ${width}px`);
 * }, 100);
 *
 * window.addEventListener('resize', () => handleResize(window.innerWidth));
 * ```
 */
export const createDebouncedFunction = <T>(callback: (value: T) => void, delay = 30) => {
  let timeoutId: NodeJS.Timeout;

  return (value: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(value), delay);
  };
};
