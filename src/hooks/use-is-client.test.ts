import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsClient } from "./use-is-client";

describe("useIsClient", () => {
  it("returns true after effect runs", () => {
    const { result } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);
  });

  it("stays true on subsequent renders", () => {
    const { result, rerender } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(true);
  });
});
