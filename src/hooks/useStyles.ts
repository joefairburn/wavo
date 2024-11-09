import { useInsertionEffect } from 'react';

// Add this at the top of the file, outside the hook
let stylesInserted = false;

export function useStyles({ unstyled = false }: { unstyled?: boolean } = {}) {
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
        [data-wavelet-bar] {
          will-change: height, y;
          transition: height 1s ease-in-out, y 1s ease-in-out;
        }
        [data-wavelet-svg] [data-new-bars='true'] {
          will-change: transform;
          transform: scaleY(0);
          transform-origin: center;
          animation: growBars 1s forwards ease-in-out;
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
