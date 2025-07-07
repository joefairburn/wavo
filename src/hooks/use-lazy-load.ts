import { useEffect, useRef, useState } from 'react';

/**
 * Options for configuring the lazy loading behavior
 */
export interface LazyLoadOptions {
  /**
   * Reference to the element that should be observed for visibility
   */
  elementRef: React.RefObject<HTMLElement | SVGElement>;

  /**
   * Whether lazy loading is enabled
   * When false, content will always render regardless of visibility
   */
  enabled: boolean;

  /**
   * Margin around the root element for triggering intersections earlier/later
   * Can be used to preload content before it becomes visible
   * @default "50px"
   */
  rootMargin?: string;

  /**
   * Percentage of the target element that must be visible to trigger the callback
   * Value between 0 and 1, where 0 means any part visible, 1 means fully visible
   * @default 0
   */
  threshold?: number;
}

/**
 * Result returned by the useLazyLoad hook
 */
export interface LazyLoadResult {
  /**
   * Whether the content should be rendered based on visibility
   * Will be true when the element is or has been visible, false otherwise
   */
  shouldRender: boolean;
}

/**
 * Hook for implementing efficient lazy loading of components
 *
 * Uses the Intersection Observer API to determine if an element is visible in the viewport.
 * This helps optimize performance by only rendering components when they're needed,
 * which is particularly useful for resource-intensive visualizations.
 *
 * Features:
 * - Automatically manages intersection observer lifecycle
 * - Only renders content when the target element is in or near the viewport
 * - Supports customizable margins and thresholds
 * - Can be fully disabled when needed
 *
 * @param options - Configuration options for lazy loading behavior
 * @returns Object containing the shouldRender flag
 *
 * @example
 * ```tsx
 * function LazyComponent() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { shouldRender } = useLazyLoad({
 *     elementRef: ref,
 *     enabled: true,
 *     rootMargin: '100px',
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {shouldRender && <ExpensiveVisualization />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useLazyLoad = ({
  elementRef,
  enabled,
  rootMargin = '50px',
  threshold = 0,
}: LazyLoadOptions): LazyLoadResult => {
  // If lazy loading is disabled, shouldRender is always true
  const [shouldRender, setShouldRender] = useState(!enabled);
  // Track if the element has been visible at least once
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    // Skip observer setup if lazy loading is disabled or element ref is not available
    if (!(enabled && elementRef.current)) {
      return;
    }

    // Create an intersection observer to watch for visibility changes
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // When element becomes visible, update state and flag
            hasBeenVisible.current = true;
            setShouldRender(true);
          } else if (hasBeenVisible.current) {
            // When element is no longer visible, update state only if it was visible before
            setShouldRender(false);
          }
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin,
        threshold,
      }
    );

    // Start observing the target element
    observer.observe(elementRef.current);

    // Clean up the observer when the component unmounts or dependencies change
    return () => observer.disconnect();
  }, [enabled, elementRef, rootMargin, threshold]);

  return { shouldRender };
};
