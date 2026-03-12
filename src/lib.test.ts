import { describe, expect, it } from "vitest";
import { calculateReducedDataPoints, memoizedReducedDataPoints } from "./lib";

describe("calculateReducedDataPoints", () => {
  it("returns empty array when barCount is 0", () => {
    const result = calculateReducedDataPoints(0, [0.5, 0.6, 0.7]);
    expect(result).toEqual([]);
  });

  it("returns single average when barCount is 1", () => {
    const result = calculateReducedDataPoints(1, [0.2, 0.4, 0.6]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(0.4);
  });

  it("reduces data points to specified bar count", () => {
    const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const result = calculateReducedDataPoints(5, data);
    expect(result).toHaveLength(5);
  });

  it("handles empty data array", () => {
    const result = calculateReducedDataPoints(5, []);
    expect(result).toHaveLength(5);
    result.forEach((val) => expect(val).toBe(0));
  });

  it("calculates correct averages for segments", () => {
    // 4 data points reduced to 2 bars
    // First bar: average of [0.2, 0.4] = 0.3
    // Second bar: average of [0.6, 0.8] = 0.7
    const data = [0.2, 0.4, 0.6, 0.8];
    const result = calculateReducedDataPoints(2, data);
    expect(result[0]).toBeCloseTo(0.3);
    expect(result[1]).toBeCloseTo(0.7);
  });

  it("handles NaN values by using neighbor values", () => {
    const data = [0.5, Number.NaN, Number.NaN, 0.5];
    const result = calculateReducedDataPoints(2, data);
    // First segment [0.5, NaN] should use 0.5
    // Second segment [NaN, 0.5] should use 0.5
    expect(result[0]).toBe(0.5);
    expect(result[1]).toBe(0.5);
  });

  it("preserves data when barCount equals data length", () => {
    const data = [0.1, 0.5, 0.9];
    const result = calculateReducedDataPoints(3, data);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[1]).toBeCloseTo(0.5);
    expect(result[2]).toBeCloseTo(0.9);
  });
});

describe("memoizedReducedDataPoints", () => {
  it("returns a function", () => {
    const memoized = memoizedReducedDataPoints();
    expect(typeof memoized).toBe("function");
  });

  it("returns same result for same inputs", () => {
    const memoized = memoizedReducedDataPoints();
    const data = [0.1, 0.2, 0.3, 0.4, 0.5];
    const result1 = memoized(2, data);
    const result2 = memoized(2, data);
    expect(result1).toEqual(result2);
  });

  it("returns different results for different bar counts", () => {
    const memoized = memoizedReducedDataPoints();
    const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const result1 = memoized(2, data);
    const result2 = memoized(4, data);
    expect(result1).toHaveLength(2);
    expect(result2).toHaveLength(4);
  });

  it("caches results for large datasets", () => {
    const memoized = memoizedReducedDataPoints();
    // Create data larger than cache threshold (1000)
    const largeData = Array.from({ length: 1500 }, () => Math.random());
    const result1 = memoized(100, largeData);
    const result2 = memoized(100, largeData);
    // Should be the exact same reference when cached
    expect(result1).toBe(result2);
  });

  it("skips caching for small datasets", () => {
    const memoized = memoizedReducedDataPoints();
    const smallData = [0.1, 0.2, 0.3];
    const result1 = memoized(2, smallData);
    const result2 = memoized(2, smallData);
    // Results should be equal but not necessarily the same reference
    expect(result1).toEqual(result2);
  });
});
