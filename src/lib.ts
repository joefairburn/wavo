const findNeighborValue = (
  dataPoints: number[], 
  startIndex: number, 
  increment: number, 
  endCondition: number
): number => {
  for (let i = startIndex; increment > 0 ? i < endCondition : i >= endCondition; i += increment) {
    if (!isNaN(dataPoints[i])) return dataPoints[i];
  }
  
  return NaN;
};

const calculateSegmentAverage = (dataPoints: number[], startIndex: number, endIndex: number): number => {
  // Calculate average using reduce
  const segment = dataPoints.slice(startIndex, endIndex);
  const { sum, count } = segment.reduce((acc, val) => {
    if (!isNaN(val)) {
      acc.sum += val;
      acc.count++;
    }
    return acc;
  }, { sum: 0, count: 0 });

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

export const calculateReducedDataPoints = (barCount: number, dataPoints: number[]): number[] => {
  if (barCount === 0) return [];
  
  const length = dataPoints.length; // Cache length
  return Array.from({ length: barCount }, (_, barIndex) => {
    const startIndex = Math.floor((barIndex / barCount) * length);
    const endIndex = Math.floor(((barIndex + 1) / barCount) * length);
    return calculateSegmentAverage(dataPoints, startIndex, endIndex);
  });
};

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