import { useInsertionEffect } from 'react';
import { EasingFunction } from '../Waveform';

/**
 * CSS variable names used throughout the component for consistent styling
 * These variables control the appearance and animation of waveform elements
 */
export const cssVariables = {
  /** Width of individual bars in pixels */
  BAR_WIDTH: '--wavo-bar-width',

  /** Gap between bars in pixels */
  BAR_GAP: '--wavo-bar-gap',

  /** Default color for waveform bars */
  BAR_COLOR: '--wavo-bar-color',

  /** Color for the "played" portion of the waveform */
  BAR_COLOR_PROGRESS: '--wavo-bar-color-progress',

  /** Duration of transitions/animations in seconds */
  TRANSITION_DURATION: '--wavo-transition-duration',

  /** CSS timing function for animations */
  EASING_FUNCTION: '--wavo-easing-function',
};

/**
 * Converts an easing value to a valid CSS timing function
 *
 * Takes the easing specification (either a named value or cubic-bezier parameters)
 * and converts it to a valid CSS timing function string that can be used in
 * transition or animation properties.
 *
 * @param easing - Easing function specification (string name or cubic-bezier parameters)
 * @returns A valid CSS timing function string
 *
 * @example
 * ```ts
 * getEasingFunction('ease-in') // Returns 'ease-in'
 * getEasingFunction([0.42, 0, 0.58, 1]) // Returns 'cubic-bezier(0.42, 0, 0.58, 1)'
 * ```
 */
export const getEasingFunction = (easing: EasingFunction): string => {
  // If easing is an array, treat it as cubic-bezier parameters
  if (Array.isArray(easing) && easing.length === 4) {
    const [x1, y1, x2, y2] = easing;
    // Ensure values are within the valid range (0-1 for x, any value for y)
    const validX1 = Math.max(0, Math.min(1, x1));
    const validX2 = Math.max(0, Math.min(1, x2));
    return `cubic-bezier(${validX1}, ${y1}, ${validX2}, ${y2})`;
  }

  // If it's 'cubic-bezier' without parameters, use a default
  if (easing === 'cubic-bezier') {
    return 'cubic-bezier(0.42, 0, 0.58, 1)'; // Default cubic-bezier (same as 'ease')
  }

  // Return the string value as-is
  return easing as string;
};

/**
 * Creates CSS styles for waveform animations
 *
 * Generates the CSS required for smooth transitions and animations
 * of the waveform elements, with appropriate performance optimizations
 * and motion reduction handling.
 *
 * @param easing - Easing function to use for animations
 * @returns A CSS string containing all animation styles
 */
export const createWaveformStyles = (easing: EasingFunction) => {
  const easingValue = getEasingFunction(easing);

  return `
  @media (prefers-reduced-motion: no-preference) {
    /* Apply transitions only to individual bars */
    [data-wavo-bar] {
      will-change: height, y;
      transition: height var(--wavo-transition-duration, 1s) var(--wavo-easing-function, ${easingValue}), 
                 y var(--wavo-transition-duration, 1s) var(--wavo-easing-function, ${easingValue});
    }

    /* Explicitly disable animations for Path elements */
    [data-wavo-path] {
      will-change: none !important;
      transition: none !important;
      animation: none !important;
    }
    
    /* Animation for groups of bars */
    [data-wavo-svg] [data-new-bars='true'] {
      will-change: transform;
      transform: scaleY(0);
      transform-origin: center;
      animation: growBars var(--wavo-transition-duration, 1s) forwards var(--wavo-easing-function, ${easingValue});
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
};

// Define a global identifier for tracking style insertion
// Using a string that won't conflict with user's code
const STYLE_ATTRIBUTE_ID = 'data-wavo-styles';

/**
 * Options for the useStyles hook
 */
interface StyleOptions {
  /**
   * When true, no styles will be injected (for custom styling)
   * @default false
   */
  unstyled?: boolean;

  /**
   * Duration in seconds for transitions and animations
   * @default 1
   */
  transitionDuration?: number;

  /**
   * Easing function for animations
   * @default 'ease-in-out'
   */
  easing?: EasingFunction;
}

/**
 * Hook that manages dynamic styles for waveform components
 *
 * Handles the injection and cleanup of CSS styles needed for animations
 * and transitions in the waveform visualization. Uses React's useInsertionEffect
 * for optimal style injection timing. Includes performance considerations and
 * accessibility features like respecting reduced motion preferences.
 *
 * Features:
 * - SSR-compatible (no style injection during server rendering)
 * - Dynamic style updates when props change
 * - Proper cleanup on unmount to prevent style leaks
 * - Hardware capability detection to disable animations on low-end devices
 * - Respect for user motion preferences
 * - Option to disable all styling for custom themes
 *
 * @param options - Styling configuration options
 * @returns Object containing cssVariables for reference
 *
 * @example
 * ```tsx
 * function WaveformContainer() {
 *   useStyles({
 *     transitionDuration: 0.5,
 *     easing: 'ease-out'
 *   });
 *
 *   return <Waveform>...</Waveform>;
 * }
 * ```
 */
export function useStyles({ unstyled = false, transitionDuration = 1, easing = 'ease-in-out' }: StyleOptions = {}) {
  useInsertionEffect(() => {
    // Skip in SSR context
    if (typeof document === 'undefined') return;

    // Return early if using the unstyled prop
    if (unstyled) return;

    // Remove any existing styles (in case transition duration or easing changed)
    const existingStyle = document.querySelector(`style[${STYLE_ATTRIBUTE_ID}]`);
    if (existingStyle) {
      existingStyle.parentNode?.removeChild(existingStyle);
    }

    // Only show animations on higher performance devices
    const isHighPerformance = navigator.hardwareConcurrency >= 4;
    if (!isHighPerformance) return;

    // Convert the easing function to a valid CSS value
    const easingValue = getEasingFunction(easing);

    // Create and insert the style element with the appropriate transition duration and easing
    const style = document.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE_ID, '');
    style.innerHTML = createWaveformStyles(easing);
    document.head.appendChild(style);

    // Set CSS variables
    document.documentElement.style.setProperty(cssVariables.TRANSITION_DURATION, `${transitionDuration}s`);
    document.documentElement.style.setProperty(cssVariables.EASING_FUNCTION, easingValue);

    // Cleanup function
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      document.documentElement.style.removeProperty(cssVariables.TRANSITION_DURATION);
      document.documentElement.style.removeProperty(cssVariables.EASING_FUNCTION);
    };
  }, [unstyled, transitionDuration, easing]);

  return { cssVariables };
}
