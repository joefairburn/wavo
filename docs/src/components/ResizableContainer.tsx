import React, { useRef } from 'react';
import { useResizable } from '../hooks/useResizable';

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

  const { width, height, resizableProps, resizeHandleProps, wrapperClassName } = useResizable(containerRef, {
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
    <div className="flex flex-col items-center w-full">
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
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-70"
                >
                  <path d="M9 1v8H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            );
          })()}

          {children}
        </div>
      </div>

      {/* Dimensions display */}
      {showDimensions && (
        <div className="text-sm text-gray-500 mt-2">
          {Math.round(width)} × {Math.round(height)} px (drag corner to resize)
        </div>
      )}
    </div>
  );
};

export default ResizableContainer;
