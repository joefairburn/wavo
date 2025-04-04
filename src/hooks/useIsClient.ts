import { useEffect, useState } from 'react';

/**
 * Hook to detect if code is running on the client-side
 *
 * This hook safely detects whether the code is running in a browser environment
 * or during server-side rendering. It ensures that browser-specific code only
 * executes in the client environment, preventing errors during SSR.
 *
 * The hook returns false during initial server-side rendering and updates to true
 * after hydration on the client. This pattern is useful for:
 * - Safely accessing browser APIs like window, document, localStorage
 * - Preventing hydration mismatches in SSR frameworks like Next.js
 * - Conditionally rendering components that depend on browser environment
 *
 * @returns A boolean indicating whether the code is running on the client-side
 *
 * @example
 * ```tsx
 * function ClientSafeComponent() {
 *   const isClient = useIsClient();
 *
 *   // Safely use browser APIs
 *   return isClient ? (
 *     <div>Window width: {window.innerWidth}px</div>
 *   ) : (
 *     <div>Loading...</div>
 *   );
 * }
 * ```
 */
export const useIsClient = () => {
  // Initialize to false to represent server environment
  const [isClient, setIsClient] = useState(false);

  // Effect only runs in browser after hydration
  useEffect(() => {
    // Update to true when running on client
    setIsClient(true);
  }, []);

  return isClient;
};

export default useIsClient;
