import type React from 'react';
import { useRef } from 'react';
import { useResizable } from '../hooks/use-resizable';

interface ResizableContainerProps {
  className?: string;
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  showDimensions?: boolean;
  style?: React.CSSProperties;
}

/**
 * A resizable container component that allows users to adjust the width and height
 * via draggable resize handles
 */
export const ResizableContainer: React.FC<ResizableContainerProps> = ({
  className = '',
  children,
  initialWidth = 700,
  initialHeight = 200,
  minWidth = 200,
  minHeight = 100,
  aspectRatio,
  showDimensions = true,
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { width, height, resizableProps, resizeHandleProps, wrapperClassName } =
    useResizable(containerRef, {
      initialWidth,
      initialHeight,
      minWidth,
      minHeight,
      aspectRatio,
    });

  // Only use the southeast (bottom-right) handle
  const direction = 'se';

  // Wrapper style with dynamic height
  const wrapperStyle = {
    height: `${height}px`,
    minHeight: `${minHeight}px`,
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Container wrapper with style for dynamic height instead of invalid Tailwind classes */}
      <div className={`${wrapperClassName} mb-4`} style={wrapperStyle}>
        <div
          {...resizableProps}
          className={`${resizableProps.className} ${className} shadow-sm`}
          style={{
            ...resizableProps.style,
            ...style,
          }}
        >
          {/* Only the bottom-right resize handle with a resize icon */}
          {(() => {
            const handleProps = resizeHandleProps(direction);
            // Make the handle more visible with additional styles
            const handleClassName = `${handleProps.className} bg-black bg-opacity-5 hover:bg-opacity-10 transition-colors flex items-center justify-center`;
            return (
              <div key={direction} {...handleProps} className={handleClassName}>
                {/* Simple half square icon indicating resize functionality */}
                <svg
                  aria-label="Resize handle"
                  className="opacity-70"
                  fill="none"
                  height="10"
                  viewBox="0 0 10 10"
                  width="10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Resize handle</title>
                  <path
                    d="M9 1v8H1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            );
          })()}

          {children}
        </div>
      </div>

      {/* Dimensions display */}
      {showDimensions && (
        <div className="mt-2 text-gray-500 text-sm">
          {Math.round(width)} × {Math.round(height)} px (drag corner to resize)
        </div>
      )}
    </div>
  );
};

export default ResizableContainer;
