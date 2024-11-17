import { useInsertionEffect } from 'react';

// Add this at the top of the file, outside the hook
let stylesInserted = false;

export function useStyles({
  unstyled = false,
  transitionDuration = 1,
}: { unstyled?: boolean; transitionDuration?: number } = {}) {
  return useInsertionEffect(() => {
    // Return early if styles were already inserted, or if we're using the unstyled prop.
    if (stylesInserted || unstyled) return;

    // Only show animations on higher performance devices
    const isHighPerformance = typeof navigator !== 'undefined' && navigator.hardwareConcurrency >= 4;

    const shouldAnimate = isHighPerformance;
    if (!shouldAnimate) return;

    stylesInserted = true;
    const style = document.createElement('style');
    style.innerHTML = `
      @media (prefers-reduced-motion: no-preference) {
        [data-wavo-bar] {
          will-change: height, y;
          transition: height ${transitionDuration}s ease-in-out, y ${transitionDuration}s ease-in-out;
        }
        [data-wavo-svg] [data-new-bars='true'] {
          will-change: transform;
          transform: scaleY(0);
          transform-origin: center;
          animation: growBars ${transitionDuration}s forwards ease-in-out;
        }
        @keyframes growBars {
          0% {
            opacity: 0;
            transform: scaleY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
