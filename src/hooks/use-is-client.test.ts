import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsClient } from "./use-is-client";

describe("useIsClient", () => {
  it("returns true after effect runs", () => {
    const { result } = renderHook(() => useIsClient());

    act(() => {
      // flush effects
    });

    expect(result.current).toBe(true);
  });

  it("stays true on subsequent renders", () => {
    const { result, rerender } = renderHook(() => useIsClient());

    act(() => {
      // flush effects
    });

    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(true);
  });
});
