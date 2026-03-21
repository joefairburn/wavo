import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vite-plus/test";
import { useInteraction } from "./use-interaction";

const createSVGElement = () => {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  document.body.appendChild(element);
  element.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return element;
};

describe("useInteraction", () => {
  let element: SVGSVGElement;
  let elementRef: { current: SVGSVGElement };

  beforeEach(() => {
    element = createSVGElement();
    elementRef = { current: element };
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe("hasInteractions", () => {
    it("is false when no callbacks are provided", () => {
      const { result } = renderHook(() => useInteraction({ elementRef }));

      expect(result.current.hasInteractions).toBe(false);
    });

    it("is true when onClick is provided", () => {
      const { result } = renderHook(() => useInteraction({ elementRef, onClick: vi.fn() }));

      expect(result.current.hasInteractions).toBe(true);
    });

    it("is true when onDrag is provided", () => {
      const { result } = renderHook(() => useInteraction({ elementRef, onDrag: vi.fn() }));

      expect(result.current.hasInteractions).toBe(true);
    });
  });

  describe("click handler", () => {
    it("calculates the correct percentage from click position", () => {
      const onClick = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onClick }));

      act(() => {
        result.current.eventHandlers.onClick({
          clientX: 100,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      expect(onClick).toHaveBeenCalledOnce();
      expect(onClick.mock.calls.at(0)?.at(0)).toBe(0.5);
    });

    it("clamps percentage to 0-1 range", () => {
      const onClick = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onClick }));

      // Click beyond the right edge
      act(() => {
        result.current.eventHandlers.onClick({
          clientX: 300,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      expect(onClick.mock.calls.at(0)?.at(0)).toBe(1);

      // Click beyond the left edge
      act(() => {
        result.current.eventHandlers.onClick({
          clientX: -50,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      expect(onClick.mock.calls.at(1)?.at(0)).toBe(0);
    });
  });

  describe("drag lifecycle", () => {
    it("mouseDown triggers onDragStart and sets isDragging", () => {
      const onDragStart = vi.fn();
      const onDrag = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onDragStart, onDrag }));

      expect(result.current.isDragging).toBe(false);

      act(() => {
        result.current.eventHandlers.onMouseDown({
          clientX: 100,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      expect(result.current.isDragging).toBe(true);
      expect(onDragStart).toHaveBeenCalledOnce();
      expect(onDrag).toHaveBeenCalledOnce();
      expect(onDrag.mock.calls.at(0)?.at(0)).toBe(0.5);
    });

    it("mousemove on document triggers onDrag with percentage during drag", () => {
      const onDrag = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onDrag }));

      // Start drag
      act(() => {
        result.current.eventHandlers.onMouseDown({
          clientX: 50,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      onDrag.mockClear();

      // Move mouse on document
      act(() => {
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 50 }));
      });

      expect(onDrag).toHaveBeenCalledOnce();
      expect(onDrag.mock.calls.at(0)?.at(0)).toBe(0.75);
    });

    it("mouseUp ends drag, calls onDragEnd, and sets isDragging to false", () => {
      const onDragEnd = vi.fn();
      const onDrag = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onDrag, onDragEnd }));

      // Start drag
      act(() => {
        result.current.eventHandlers.onMouseDown({
          clientX: 50,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      expect(result.current.isDragging).toBe(true);

      // End drag
      act(() => {
        document.dispatchEvent(new MouseEvent("mouseup", { clientX: 150, clientY: 50 }));
      });

      expect(result.current.isDragging).toBe(false);
      expect(onDragEnd).toHaveBeenCalledOnce();
    });
  });

  describe("keyboard handler", () => {
    it("passes through onKeyDown handler", () => {
      const onKeyDown = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onKeyDown }));

      expect(result.current.eventHandlers.onKeyDown).toBe(onKeyDown);
    });
  });

  describe("cleanup", () => {
    it("removes global listeners when drag ends", () => {
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();

      const { result } = renderHook(() => useInteraction({ elementRef, onDrag, onDragEnd }));

      // Start drag
      act(() => {
        result.current.eventHandlers.onMouseDown({
          clientX: 50,
          clientY: 50,
        } as unknown as React.MouseEvent<SVGSVGElement>);
      });

      // End drag
      act(() => {
        document.dispatchEvent(new MouseEvent("mouseup", { clientX: 100, clientY: 50 }));
      });

      onDrag.mockClear();

      // Further mousemove should not trigger onDrag
      act(() => {
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 50 }));
      });

      expect(onDrag).not.toHaveBeenCalled();
    });
  });
});
