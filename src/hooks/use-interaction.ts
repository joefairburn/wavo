import React, { useCallback, useEffect, useState } from "react";

/**
 * Creates a synthetic React mouse event from a native MouseEvent
 */
const toSyntheticEvent = <T extends HTMLElement | SVGElement>(
  e: MouseEvent,
  currentTarget: T | null,
) =>
  ({
    clientX: e.clientX,
    clientY: e.clientY,
    target: e.target,
    currentTarget,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  }) as unknown as React.MouseEvent<T>;

/**
 * Options for configuring element interactions
 *
 * @template ElementType - The type of DOM element being interacted with
 */
export interface InteractionOptions<ElementType extends HTMLElement | SVGElement> {
  /**
   * Reference to the DOM element that will receive the interaction events
   */
  elementRef: React.RefObject<ElementType | null>;

  /**
   * Callback fired when the element is clicked
   * @param percentage - Position as a percentage (0-1) from left edge
   * @param event - The original mouse event
   */
  onClick?: (percentage: number, event: React.MouseEvent<ElementType>) => void;

  /**
   * Callback fired during drag operations
   * @param percentage - Current position as a percentage (0-1) from left edge
   * @param event - The original mouse event
   */
  onDrag?: (percentage: number, event: React.MouseEvent<ElementType>) => void;

  /**
   * Callback fired when a drag operation starts
   * @param event - The original mouse event
   */
  onDragStart?: (event: React.MouseEvent<ElementType>) => void;

  /**
   * Callback fired when a drag operation ends
   * @param event - A synthetic mouse event based on the original event
   */
  onDragEnd?: (event: React.MouseEvent<ElementType>) => void;

  /**
   * Callback fired for keyboard events (for accessibility)
   * @param event - The original keyboard event
   */
  onKeyDown?: React.KeyboardEventHandler<ElementType>;
}

/**
 * Result returned by the useInteraction hook
 *
 * @template ElementType - The type of DOM element being interacted with
 */
export interface InteractionResult<ElementType extends HTMLElement | SVGElement> {
  /**
   * Event handlers to be spread onto the target element
   */
  eventHandlers: {
    /**
     * Handler for click events
     */
    onClick: React.MouseEventHandler<ElementType>;

    /**
     * Handler for mousedown events (initiates drag operations)
     */
    onMouseDown: React.MouseEventHandler<ElementType>;

    /**
     * Handler for keyboard events (passed through from options)
     */
    onKeyDown: React.KeyboardEventHandler<ElementType> | undefined;
  };

  /**
   * Whether a drag operation is currently in progress
   */
  isDragging: boolean;

  /**
   * Whether the element has any interactive behaviors
   * Used to determine if accessibility attributes should be added
   */
  hasInteractions: boolean;
}

/**
 * Hook that manages mouse and keyboard interactions for interactive elements
 *
 * Provides a unified way to handle click, drag, and keyboard events with proper
 * lifecycle management. Particularly useful for slider-like components such as
 * audio seekers, progress bars, or waveform visualizations.
 *
 * Features:
 * - Click handling with percentage calculation
 * - Drag operations with start/progress/end callbacks
 * - Automatic event listener cleanup
 * - Cross-element drag support (can drag outside the target element)
 * - Accessibility support with keyboard event handling
 *
 * @template ElementType - The DOM element type (defaults to SVGSVGElement)
 * @param options - Configuration options for the interactions
 * @returns Event handlers and state information
 *
 * @example
 * ```tsx
 * function AudioSeeker() {
 *   const ref = useRef<SVGSVGElement>(null);
 *   const { eventHandlers } = useInteraction({
 *     elementRef: ref,
 *     onClick: (percentage) => setPlaybackPosition(percentage * duration),
 *     onDrag: (percentage) => updateSeekPreview(percentage * duration),
 *   });
 *
 *   return <svg ref={ref} {...eventHandlers} />;
 * }
 * ```
 */
export function useInteraction<ElementType extends HTMLElement | SVGElement = SVGSVGElement>({
  elementRef,
  onClick,
  onDrag,
  onDragStart,
  onDragEnd,
  onKeyDown,
}: InteractionOptions<ElementType>): InteractionResult<ElementType> {
  const [isDragging, setIsDragging] = useState(false);

  // Determine if the component has any mouse or keyboard events
  const hasInteractions = !!(onClick || onDrag || onKeyDown || onDragStart || onDragEnd);

  /**
   * Calculates the relative position as a percentage (0-1) based on a mouse event
   * Ensures the value is clamped between 0 and 1
   */
  const calculatePercentageFromEvent = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (!elementRef.current) {
        return 0;
      }
      const rect = elementRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      return x / rect.width;
    },
    [elementRef],
  );

  /**
   * Handles click events on the target element
   * Calculates the click position and invokes the onClick callback
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<ElementType>) => {
      if (!(elementRef.current && onClick)) {
        return;
      }
      onClick(calculatePercentageFromEvent(event), event);
    },
    [onClick, calculatePercentageFromEvent, elementRef],
  );

  /**
   * Handles mousedown events on the target element
   * Initiates drag operations and calls the onDragStart callback
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<ElementType>) => {
      if (!elementRef.current) {
        return;
      }

      // If onDrag is provided, call it with the initial position
      onDrag?.(calculatePercentageFromEvent(event), event);

      setIsDragging((prev) => {
        if (prev) {
          return true;
        }
        onDragStart?.(event);
        return true;
      });
    },
    [elementRef, onDrag, onDragStart, calculatePercentageFromEvent],
  );

  /**
   * Handles mouseup events (end of drag operations)
   * This is attached to the document to catch events outside the target element
   */
  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      setIsDragging((prev) => {
        if (!prev) {
          return false;
        }
        // Convert the native MouseEvent to a React MouseEvent
        if (onDragEnd) {
          onDragEnd(toSyntheticEvent(event, elementRef.current));
        }
        return false;
      });
    },
    [onDragEnd, elementRef],
  );

  /**
   * Handles mousemove events during drag operations
   * This is attached to the document to track movement outside the target element
   */
  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!(isDragging && elementRef.current && onDrag)) {
        return;
      }
      // Convert the native MouseEvent to a React MouseEvent
      onDrag(calculatePercentageFromEvent(event), toSyntheticEvent(event, elementRef.current));
    },
    [isDragging, onDrag, calculatePercentageFromEvent, elementRef],
  );

  // Add and remove global event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      // Use passive: true since handlers don't call preventDefault()
      // This allows the browser to optimize event handling
      document.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
      document.addEventListener("mouseup", handleMouseUp, { passive: true });
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleGlobalMouseMove, handleMouseUp]);

  return {
    eventHandlers: {
      onClick: handleClick as React.MouseEventHandler<ElementType>,
      onMouseDown: handleMouseDown as React.MouseEventHandler<ElementType>,
      onKeyDown,
    },
    isDragging,
    hasInteractions,
  };
}
