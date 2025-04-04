import { useInsertionEffect } from 'react';

// Define the styles as a string template
export const waveformStyles = `
  @media (prefers-reduced-motion: no-preference) {
    [data-wavo-bar] {
      will-change: height, y;
      transition: height var(--wavo-transition-duration, 1s) ease-in-out, y var(--wavo-transition-duration, 1s) ease-in-out;
    }
    [data-wavo-svg] [data-new-bars='true'] {
      will-change: transform;
      transform: scaleY(0);
      transform-origin: center;
      animation: growBars var(--wavo-transition-duration, 1s) forwards ease-in-out;
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

// Define a global identifier for tracking style insertion
// Using a string that won't conflict with user's code
const STYLE_ATTRIBUTE_ID = 'data-wavo-styles';

export function useStyles({
  unstyled = false,
  transitionDuration = 1,
}: { unstyled?: boolean; transitionDuration?: number } = {}) {
  useInsertionEffect(() => {
    // Skip in SSR context
    if (typeof document === 'undefined') return;

    // Return early if using the unstyled prop
    if (unstyled) return;

    // Remove any existing styles (in case transition duration changed)
    const existingStyle = document.querySelector(`style[${STYLE_ATTRIBUTE_ID}]`);
    if (existingStyle) {
      existingStyle.parentNode?.removeChild(existingStyle);
    }

    // Only show animations on higher performance devices
    const isHighPerformance = navigator.hardwareConcurrency >= 4;
    if (!isHighPerformance) return;

    // Create and insert the style element with the appropriate transition duration
    const style = document.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE_ID, '');
    style.innerHTML = waveformStyles;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [unstyled, transitionDuration]);
}
