import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { renderHook } from "@testing-library/react";
import { cssVariables, getEasingFunction, useStyles, __resetStylesInjected } from "./use-styles";

describe("getEasingFunction", () => {
  it("returns string easing values as-is", () => {
    expect(getEasingFunction("ease-in")).toBe("ease-in");
    expect(getEasingFunction("ease-out")).toBe("ease-out");
    expect(getEasingFunction("ease-in-out")).toBe("ease-in-out");
    expect(getEasingFunction("linear")).toBe("linear");
    expect(getEasingFunction("ease")).toBe("ease");
  });

  it("converts array to cubic-bezier string", () => {
    expect(getEasingFunction([0.42, 0, 0.58, 1])).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
  });

  it("clamps x values to 0-1 range", () => {
    expect(getEasingFunction([-0.5, 0, 1.5, 1])).toBe("cubic-bezier(0, 0, 1, 1)");
  });

  it("does not clamp y values", () => {
    expect(getEasingFunction([0.5, -2, 0.5, 2])).toBe("cubic-bezier(0.5, -2, 0.5, 2)");
  });

  it("returns default cubic-bezier when given 'cubic-bezier' without params", () => {
    expect(getEasingFunction("cubic-bezier")).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
  });
});

describe("cssVariables", () => {
  it("contains expected keys", () => {
    expect(cssVariables).toHaveProperty("BAR_WIDTH");
    expect(cssVariables).toHaveProperty("BAR_GAP");
    expect(cssVariables).toHaveProperty("BAR_COLOR");
    expect(cssVariables).toHaveProperty("BAR_COLOR_PROGRESS");
    expect(cssVariables).toHaveProperty("TRANSITION_DURATION");
    expect(cssVariables).toHaveProperty("EASING_FUNCTION");
  });

  it("values are CSS variable strings starting with --wavo-", () => {
    for (const value of Object.values(cssVariables)) {
      expect(value).toMatch(/^--wavo-/);
    }
  });
});

describe("useStyles", () => {
  beforeEach(() => {
    __resetStylesInjected();
  });

  afterEach(() => {
    const style = document.querySelector("[data-wavo-styles]");
    if (style) {
      style.remove();
    }
  });

  it("injects a style element with data-wavo-styles attribute into document.head", () => {
    renderHook(() => useStyles());

    const style = document.querySelector("[data-wavo-styles]");
    expect(style).not.toBeNull();
    expect(style?.tagName.toLowerCase()).toBe("style");
    expect(document.head.contains(style)).toBe(true);
  });

  it("returns an object with cssVariables", () => {
    const { result } = renderHook(() => useStyles());

    expect(result.current).toHaveProperty("cssVariables");
    expect(result.current.cssVariables).toBe(cssVariables);
  });

  it("does not inject styles when unstyled is true", () => {
    renderHook(() => useStyles({ unstyled: true }));

    const style = document.querySelector("[data-wavo-styles]");
    expect(style).toBeNull();
  });
});
