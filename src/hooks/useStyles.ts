import { useInsertionEffect } from 'react';

// Add this at the top of the file, outside the hook
let stylesInserted = false;

export function useStyles() {
  return useInsertionEffect(() => {
    // Return early if styles were already inserted
    if (stylesInserted) return;

    // Only show animations on higher performance devices
    const isHighPerformance = typeof navigator !== 'undefined' && navigator.hardwareConcurrency >= 4;

    const shouldAnimate = isHighPerformance;
    if (!shouldAnimate) return;

    stylesInserted = true;
    const style = document.createElement('style');
    style.innerHTML = `[data-wavelet-svg] { --wavelet-progress-color: #F23D75; } [data-wavelet-bar] { willChange: height, y; transition: height 1s ease-in-out, y 1s ease-in-out; } [data-wavelet-svg] [data-wavelet-progress] { color: var(--wavelet-progress-color); }`;

    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
