import React, { useCallback, useEffect, useState } from 'react';

export interface InteractionOptions<ElementType extends HTMLElement | SVGElement> {
  elementRef: React.RefObject<ElementType>;
  onClick?: (percentage: number) => void;
  onDrag?: (percentage: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onKeyDown?: React.KeyboardEventHandler<ElementType>;
}

export interface InteractionResult<ElementType extends HTMLElement | SVGElement> {
  eventHandlers: {
    onClick: React.MouseEventHandler<ElementType>;
    onMouseDown: React.MouseEventHandler<ElementType>;
    onKeyDown: React.KeyboardEventHandler<ElementType> | undefined;
  };
  isDragging: boolean;
  hasInteractions: boolean;
}

/**
 * A hook that handles mouse and keyboard interactions for elements that
 * support click, drag, and keyboard events.
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
  const hasInteractions = React.useMemo(
    () => Boolean(onClick || onDrag || onKeyDown || onDragStart || onDragEnd),
    [onClick, onDrag, onKeyDown, onDragStart, onDragEnd]
  );

  // Calculate percentage from mouse event
  const calculatePercentageFromEvent = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (!elementRef.current) return 0;
      const rect = elementRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      return x / rect.width;
    },
    [elementRef]
  );

  // Handle click events
  const handleClick = useCallback(
    (event: React.MouseEvent<ElementType>) => {
      if (!elementRef.current || !onClick) return;
      onClick(calculatePercentageFromEvent(event));
    },
    [onClick, calculatePercentageFromEvent, elementRef]
  );

  // Handle mouse down events
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<ElementType>) => {
      if (!elementRef.current) return;

      // If onDrag is provided, call it with the initial position
      onDrag?.(calculatePercentageFromEvent(event));

      setIsDragging(prev => {
        if (prev) return true;
        onDragStart?.();
        return true;
      });
    },
    [elementRef, onDrag, onDragStart, calculatePercentageFromEvent]
  );

  // Handle mouse up events
  const handleMouseUp = useCallback(() => {
    setIsDragging(prev => {
      if (!prev) return false;
      onDragEnd?.();
      return false;
    });
  }, [onDragEnd]);

  // Handle mouse move events
  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !elementRef.current || !onDrag) return;
      onDrag(calculatePercentageFromEvent(event));
    },
    [isDragging, onDrag, calculatePercentageFromEvent, elementRef]
  );

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleGlobalMouseMove, handleMouseUp]);

  return {
    eventHandlers: {
      onClick: handleClick as React.MouseEventHandler<ElementType>,
      onMouseDown: handleMouseDown as React.MouseEventHandler<ElementType>,
      onKeyDown: onKeyDown,
    },
    isDragging,
    hasInteractions,
  };
} 