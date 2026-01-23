import { type RefObject, useCallback, useEffect, useState } from "react";

interface ResizableOptions {
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number; // If you want to preserve aspect ratio
  initialWidth?: number;
  initialHeight?: number;
}

interface ResizeState {
  width: number;
  height: number;
  isDragging: boolean;
  resizeDirection: string | null;
  position: { left: number; top: number }; // Track position as part of state
}

interface ResizableReturn {
  width: number;
  height: number;
  isDragging: boolean;
  resizeDirection: string | null;
  resizableProps: {
    style: React.CSSProperties;
    className: string;
    ref: RefObject<HTMLDivElement | null>;
  };
  resizeHandleProps: (direction: string) => {
    className: string;
    onMouseDown: (e: React.MouseEvent) => void;
  };
  wrapperClassName: string;
}

/**
 * A custom hook that provides resizable functionality for components
 *
 * @param containerRef React ref for the container element
 * @param options Configuration options for resizable behavior
 * @returns Object with state and props for resizable functionality
 */
export const useResizable = (
  containerRef: RefObject<HTMLDivElement | null>,
  options: ResizableOptions = {},
): ResizableReturn => {
  const {
    minWidth = 200,
    minHeight = 100,
    aspectRatio,
    initialWidth = 700,
    initialHeight = 200,
  } = options;

  const [state, setState] = useState<ResizeState>({
    width: initialWidth,
    height: initialHeight,
    isDragging: false,
    resizeDirection: null,
    position: { left: 0, top: 0 },
  });

  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  // Track the original container position
  const [_originalPosition, setOriginalPosition] = useState({
    left: 0,
    top: 0,
  });

  // Define cursor styles for different resize directions
  const cursors = {
    n: "cursor-ns-resize",
    e: "cursor-ew-resize",
    s: "cursor-ns-resize",
    w: "cursor-ew-resize",
    ne: "cursor-ne-resize",
    nw: "cursor-nw-resize",
    se: "cursor-se-resize",
    sw: "cursor-sw-resize",
  };

  // Start resize operation
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (containerRef.current) {
        setDragStartPos({ x: e.clientX, y: e.clientY });
        const rect = containerRef.current.getBoundingClientRect();

        setOriginalDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });

        setOriginalPosition({
          left: rect.left,
          top: rect.top,
        });

        setState((prev) => ({
          ...prev,
          isDragging: true,
          resizeDirection: direction,
        }));
      }
    },
    [containerRef],
  );

  // Handle mouse movement during resize
  const handleMouseMove = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex drag interaction logic is necessary
    (e: MouseEvent) => {
      if (!(state.isDragging && state.resizeDirection)) {
        return;
      }

      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;

      let newWidth = state.width;
      let newHeight = state.height;
      let newLeft = state.position.left;
      let newTop = state.position.top;

      // Calculate new dimensions based on resize direction
      if (state.resizeDirection.includes("e")) {
        // East (right) - just adjust width
        newWidth = Math.max(minWidth, originalDimensions.width + deltaX);
      }
      if (state.resizeDirection.includes("s")) {
        // South (bottom) - just adjust height
        newHeight = Math.max(minHeight, originalDimensions.height + deltaY);
      }
      if (state.resizeDirection.includes("w")) {
        // West (left) - adjust width and position
        const widthChange =
          originalDimensions.width - Math.max(minWidth, originalDimensions.width - deltaX);
        newWidth = originalDimensions.width - widthChange;
        newLeft = state.position.left + widthChange;
      }
      if (state.resizeDirection.includes("n")) {
        // North (top) - adjust height and position
        const heightChange =
          originalDimensions.height - Math.max(minHeight, originalDimensions.height - deltaY);
        newHeight = originalDimensions.height - heightChange;
        newTop = state.position.top + heightChange;
      }

      // Maintain aspect ratio if specified
      if (aspectRatio) {
        if (state.resizeDirection.includes("n") || state.resizeDirection.includes("s")) {
          // When adjusting height, calculate width based on aspect ratio
          const newWidthFromAspect = newHeight * aspectRatio;

          // Adjust left position for west-side resizing
          if (state.resizeDirection.includes("w")) {
            const widthDifference = newWidth - newWidthFromAspect;
            newLeft += widthDifference;
          }

          newWidth = newWidthFromAspect;
        } else {
          // When adjusting width, calculate height based on aspect ratio
          const newHeightFromAspect = newWidth / aspectRatio;

          // Adjust top position for north-side resizing
          if (state.resizeDirection.includes("n")) {
            const heightDifference = newHeight - newHeightFromAspect;
            newTop += heightDifference;
          }

          newHeight = newHeightFromAspect;
        }
      }

      // Update state with new dimensions and position
      setState((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
        position: {
          left: newLeft,
          top: newTop,
        },
      }));
    },
    [
      state.isDragging,
      state.resizeDirection,
      state.width,
      state.height,
      state.position,
      dragStartPos,
      originalDimensions,
      minWidth,
      minHeight,
      aspectRatio,
    ],
  );

  // End resize operation
  const handleMouseUp = useCallback(() => {
    if (state.isDragging) {
      setState((prev) => ({
        ...prev,
        isDragging: false,
        resizeDirection: null,
      }));
    }
  }, [state.isDragging]);

  // Set up event listeners
  useEffect(() => {
    if (state.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  // Initialize container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth || initialWidth;
      const height = containerRef.current.offsetHeight || initialHeight;

      setState((prev) => ({
        ...prev,
        width,
        height,
      }));
    }
  }, [initialWidth, initialHeight, containerRef.current]);

  // Determine cursor class based on drag state
  const getCursorClass = (): string => {
    if (!state.isDragging) {
      return "";
    }
    if (!state.resizeDirection) {
      return "cursor-move";
    }
    return cursors[state.resizeDirection as keyof typeof cursors] || "";
  };

  // Build container style (only for dynamic values that can't be handled by Tailwind)
  const containerStyle: React.CSSProperties = {
    width: `${state.width}px`,
    height: `${state.height}px`,
    left: `${state.position.left}px`,
    top: `${state.position.top}px`,
  };

  // Function to generate props for resize handles
  const getResizeHandleProps = (direction: string) => ({
    className: `absolute ${getPositionClasses(direction)} ${cursors[direction as keyof typeof cursors]} z-10`,
    onMouseDown: (e: React.MouseEvent) => handleResizeStart(e, direction),
  });

  // Helper function to determine position classes for handles
  const getPositionClasses = (direction: string): string => {
    switch (direction) {
      case "n":
        return "top-0 left-1/2 w-6 h-4 transform -translate-x-1/2";
      case "s":
        return "bottom-0 left-1/2 w-6 h-4 transform -translate-x-1/2";
      case "e":
        return "right-0 top-1/2 w-4 h-6 transform -translate-y-1/2";
      case "w":
        return "left-0 top-1/2 w-4 h-6 transform -translate-y-1/2";
      case "ne":
        return "top-0 right-0 w-4 h-4";
      case "nw":
        return "top-0 left-0 w-4 h-4";
      case "se":
        return "bottom-0 right-0 w-4 h-4";
      case "sw":
        return "bottom-0 left-0 w-4 h-4";
      default:
        return "";
    }
  };

  // Common classes for the wrapper
  const wrapperClassName = "relative w-full";

  return {
    width: state.width,
    height: state.height,
    isDragging: state.isDragging,
    resizeDirection: state.resizeDirection,
    resizableProps: {
      style: containerStyle,
      className: `absolute rounded-none border border-gray-200/5 p-4 overflow-hidden ${getCursorClass()}`,
      ref: containerRef,
    },
    resizeHandleProps: getResizeHandleProps,
    wrapperClassName,
  };
};
