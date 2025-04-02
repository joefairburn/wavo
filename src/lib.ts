import { NormalizedAmplitude, WaveformData } from './Waveform';

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
 * Memoized version of calculateReducedDataPoints to avoid unnecessary recalculations
 * when the inputs haven't changed.
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

// Create a singleton instance for the app to use
export const getReducedDataPoints = memoizedReducedDataPoints();

/**
 * Utility function to handle requestIdleCallback with fallback
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
 */
export const createDebouncedFunction = <T>(callback: (value: T) => void, delay = 30) => {
  let timeoutId: NodeJS.Timeout;

  return (value: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(value), delay);
  };
};
