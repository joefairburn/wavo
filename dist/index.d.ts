import * as React from 'react';
import React__default from 'react';

interface WaveformProps {
    dataPoints: number[];
    completionPercentage?: number;
    lazyLoad?: boolean;
    animationSpeed?: number;
    progress?: number;
    onClick?: (percentage: number) => void;
    onDrag?: (percentage: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    className?: string;
    shouldAnimate?: boolean;
    onKeyDown?: (event: React__default.KeyboardEvent<SVGSVGElement>) => void;
    unstyled?: boolean;
    children: React__default.ReactNode;
}

interface BarsProps {
    width?: number;
    gap?: number;
    progress?: number;
    radius?: number;
}
declare function Bars({ width, gap, radius }: BarsProps): React__default.JSX.Element;

declare const _default: {
    Container: React.ForwardRefExoticComponent<WaveformProps & React.RefAttributes<SVGSVGElement>>;
    Bars: typeof Bars;
    Progress: ({ progress, color }: {
        progress: number;
        color: string;
    }) => React.JSX.Element;
};

export { _default as default };
