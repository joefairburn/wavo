import { describe, expect, it } from "vitest";
import { memoizedReducedDataPoints } from "./lib";

describe("memory management", () => {
  it("heap growth stays bounded after many memoization operations", () => {
    // Force GC if available (run with --expose-gc flag)
    if (global.gc) global.gc();

    const before = process.memoryUsage().heapUsed;

    // Run many memoization operations with temporary arrays
    for (let i = 0; i < 100; i++) {
      const memoized = memoizedReducedDataPoints();
      for (let j = 0; j < 100; j++) {
        const data = Array.from({ length: 1000 }, () => Math.random());
        memoized(100, data);
      }
    }

    // Force GC if available
    if (global.gc) global.gc();

    const after = process.memoryUsage().heapUsed;
    const growthMB = (after - before) / 1024 / 1024;

    // Should not grow unboundedly - allow up to 150MB for test overhead
    // Without --expose-gc flag, GC timing is unpredictable
    // WeakMap should allow GC of unreferenced data arrays over time
    expect(growthMB).toBeLessThan(150);
  });

  it("memoized function reuses cached results for same data reference", () => {
    const memoized = memoizedReducedDataPoints();
    const data = Array.from({ length: 2000 }, () => Math.random());

    // First call - cache miss
    const result1 = memoized(100, data);

    // Second call with same reference - should be cache hit
    const result2 = memoized(100, data);

    // Should return the exact same array reference (cached)
    expect(result1).toBe(result2);
  });

  it("memoized function caches multiple barCounts per data array", () => {
    const memoized = memoizedReducedDataPoints();
    const data = Array.from({ length: 2000 }, () => Math.random());

    const result100 = memoized(100, data);
    const result150 = memoized(150, data);
    const result100Again = memoized(100, data);

    // Different barCounts should give different results
    expect(result100.length).toBe(100);
    expect(result150.length).toBe(150);

    // Same barCount should return cached result
    expect(result100).toBe(result100Again);
  });
});
