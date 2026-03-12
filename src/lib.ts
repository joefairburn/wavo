import type { NormalizedAmplitude, WaveformData } from "./waveform";

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
  let prevValue = Number.NaN;
  for (let i = startIndex - 1; i >= 0; i--) {
    if (!Number.isNaN(dataPoints[i])) {
      prevValue = dataPoints[i];
      break;
    }
  }

  let nextValue = Number.NaN;
  for (let i = endIndex; i < dataPoints.length; i++) {
    if (!Number.isNaN(dataPoints[i])) {
      nextValue = dataPoints[i];
      break;
    }
  }

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
