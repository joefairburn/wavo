import { NormalizedAmplitude, WaveformData } from './Waveform';

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
 */
const calculateSegmentAverage = (
  dataPoints: readonly NormalizedAmplitude[],
  startIndex: number,
  endIndex: number,
): number => {
  // Calculate average using reduce
  const segment = dataPoints.slice(startIndex, endIndex);
  const { sum, count } = segment.reduce(
    (acc, val) => {
      if (!isNaN(val)) {
        acc.sum += val;
        acc.count++;
      }
      return acc;
    },
    { sum: 0, count: 0 },
  );

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
 */
export const calculateReducedDataPoints = (barCount: number, dataPoints: WaveformData): number[] => {
  if (barCount === 0) return [];

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
 * @returns A memoized function with the same signature as calculateReducedDataPoints
 *
 * @internal Used to create the singleton getReducedDataPoints function
 */
export const memoizedReducedDataPoints = () => {
  // Use a Map to store results
  const cache = new Map<string, number[]>();

  return (barCount: number, dataPoints: WaveformData): number[] => {
    // Skip caching for small data sets
    if (dataPoints.length < 1000 && barCount < 100) {
      return calculateReducedDataPoints(barCount, dataPoints);
    }

    const key = `${barCount}:${dataPoints.length}`;

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
  if ('requestIdleCallback' in window) {
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
