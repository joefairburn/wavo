import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock clientWidth/clientHeight for elements since jsdom doesn't compute layout
// This needs to be set up before any tests run
Object.defineProperty(Element.prototype, "clientWidth", {
  configurable: true,
  get() {
    return 200;
  },
});

Object.defineProperty(Element.prototype, "clientHeight", {
  configurable: true,
  get() {
    return 100;
  },
});

// Mock ResizeObserver which is not available in jsdom
class MockResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Immediately call the callback with mock entry for the target
    // This simulates the initial observation
    const entry: ResizeObserverEntry = {
      target,
      contentRect: {
        width: 200,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      },
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    };
    this.callback([entry], this);
  }

  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

afterEach(() => {
  cleanup();
});
