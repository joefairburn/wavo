import { bench, describe } from "vitest";
import { calculateReducedDataPoints, memoizedReducedDataPoints } from "./lib";

// Test data at various scales
const small = Array.from({ length: 100 }, () => Math.random());
const medium = Array.from({ length: 1000 }, () => Math.random());
const large = Array.from({ length: 10000 }, () => Math.random());
const huge = Array.from({ length: 100000 }, () => Math.random());

describe("calculateReducedDataPoints", () => {
  bench("100 points -> 50 bars", () => {
    calculateReducedDataPoints(50, small);
  });

  bench("1000 points -> 100 bars", () => {
    calculateReducedDataPoints(100, medium);
  });

  bench("10000 points -> 200 bars", () => {
    calculateReducedDataPoints(200, large);
  });

  bench("100000 points -> 500 bars (stress)", () => {
    calculateReducedDataPoints(500, huge);
  });
});

describe("memoizedReducedDataPoints", () => {
  const memoized = memoizedReducedDataPoints();
  memoized(100, large); // warm up cache

  bench("cache hit (same barCount)", () => {
    memoized(100, large);
  });

  bench("cache hit (different barCount)", () => {
    memoized(150, large);
  });

  bench("cache miss (new data)", () => {
    const newData = Array.from({ length: 1500 }, () => Math.random());
    memoized(100, newData);
  });
});

describe("frame budget (16.67ms)", () => {
  bench("full render cycle", () => {
    const memoized = memoizedReducedDataPoints();
    const data = Array.from({ length: 5000 }, () => Math.random());
    for (const barCount of [50, 100, 150, 200]) {
      memoized(barCount, data);
    }
  });

  bench("60 progress updates", () => {
    const memoized = memoizedReducedDataPoints();
    const data = Array.from({ length: 1000 }, () => Math.random());
    for (let i = 0; i < 60; i++) {
      memoized(100, data);
    }
  });
});

describe("memory", () => {
  bench("repeated memoization (1000 arrays)", () => {
    const memoized = memoizedReducedDataPoints();
    for (let i = 0; i < 1000; i++) {
      const data = Array.from({ length: 1000 }, () => Math.random());
      memoized(100, data);
    }
  });
});
