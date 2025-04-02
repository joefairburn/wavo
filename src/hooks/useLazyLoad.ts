import { useEffect, useRef, useState } from 'react';

export interface LazyLoadOptions {
  elementRef: React.RefObject<HTMLElement | SVGElement>;
  enabled: boolean;
  rootMargin?: string;
  threshold?: number;
}

export interface LazyLoadResult {
  shouldRender: boolean;
}

/**
 * A hook that implements lazy loading using the Intersection Observer API.
 * It will only render content when the referenced element is visible in the viewport.
 */
export const useLazyLoad = ({ 
  elementRef, 
  enabled,
  rootMargin = '50px',
  threshold = 0 
}: LazyLoadOptions): LazyLoadResult => {
  const [shouldRender, setShouldRender] = useState(!enabled);
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            hasBeenVisible.current = true;
            setShouldRender(true);
          } else {
            if (hasBeenVisible.current) {
              setShouldRender(false);
            }
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [enabled, elementRef, rootMargin, threshold]);

  return { shouldRender };
}; 