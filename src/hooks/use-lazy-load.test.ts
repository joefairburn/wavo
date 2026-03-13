import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLazyLoad } from "./use-lazy-load";

const createObserverController = () => {
  let callback: IntersectionObserverCallback;
  const instance = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  };
  const __createObserver = vi.fn(
    (cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) => {
      callback = cb;
      return instance as unknown as IntersectionObserver;
    },
  );
  return {
    __createObserver,
    instance,
    trigger: (entries: Partial<IntersectionObserverEntry>[]) =>
      callback(entries as IntersectionObserverEntry[], instance as unknown as IntersectionObserver),
  };
};

describe("useLazyLoad", () => {
  let observer: ReturnType<typeof createObserverController>;

  beforeEach(() => {
    observer = createObserverController();
  });

  it("returns shouldRender true immediately when enabled is false", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { result } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: false, __createObserver: observer.__createObserver }),
    );

    expect(result.current.shouldRender).toBe(true);
    expect(observer.__createObserver).not.toHaveBeenCalled();
  });

  it("returns shouldRender false initially when enabled is true", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { result } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    expect(result.current.shouldRender).toBe(false);
  });

  it("sets shouldRender to true when element becomes visible", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { result } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    act(() => {
      observer.trigger([{ isIntersecting: true }]);
    });

    expect(result.current.shouldRender).toBe(true);
  });

  it("sets shouldRender to false when element leaves viewport after being visible", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { result } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    act(() => {
      observer.trigger([{ isIntersecting: true }]);
    });

    expect(result.current.shouldRender).toBe(true);

    act(() => {
      observer.trigger([{ isIntersecting: false }]);
    });

    expect(result.current.shouldRender).toBe(false);
  });

  it("keeps shouldRender false when element has not been visible and isIntersecting is false", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { result } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    act(() => {
      observer.trigger([{ isIntersecting: false }]);
    });

    expect(result.current.shouldRender).toBe(false);
  });

  it("creates observer with correct options", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    renderHook(() =>
      useLazyLoad({
        elementRef,
        enabled: true,
        rootMargin: "100px",
        threshold: 0.5,
        __createObserver: observer.__createObserver,
      }),
    );

    expect(observer.__createObserver).toHaveBeenCalledWith(expect.any(Function), {
      root: null,
      rootMargin: "100px",
      threshold: 0.5,
    });
    expect(observer.instance.observe).toHaveBeenCalledWith(element);
  });

  it("disconnects observer on unmount", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    const { unmount } = renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    expect(observer.instance.disconnect).not.toHaveBeenCalled();

    unmount();

    expect(observer.instance.disconnect).toHaveBeenCalled();
  });

  it("uses default rootMargin of 50px and threshold of 0", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };

    renderHook(() =>
      useLazyLoad({ elementRef, enabled: true, __createObserver: observer.__createObserver }),
    );

    expect(observer.__createObserver).toHaveBeenCalledWith(expect.any(Function), {
      root: null,
      rootMargin: "50px",
      threshold: 0,
    });
  });
});
