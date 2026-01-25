import { render } from "@testing-library/react";
import { createRef } from "react";
import { bench, describe } from "vitest";
import { WaveformProvider } from "../contexts/waveform-context";
import { Bars, type BarsHandle } from "./bars";
import type { PathHandle } from "./path";

const testData = [0.5, 0.6, 0.7, 0.8, 0.9];

function TestWrapper({
  children,
  svgRef,
  dataPoints = testData,
}: {
  children: React.ReactNode;
  svgRef: React.RefObject<SVGSVGElement | null>;
  dataPoints?: number[];
}) {
  return (
    <div style={{ width: "200px", height: "100px" }}>
      <svg ref={svgRef} data-testid="waveform-svg">
        <WaveformProvider
          dataPoints={dataPoints}
          svgRef={svgRef}
          hasProgress={false}
          isStyled={true}
          transitionDuration={0}
          easing="linear"
          progress={0}
        >
          {children}
        </WaveformProvider>
      </svg>
    </div>
  );
}

describe("Bars initial render", () => {
  bench("unoptimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Bars optimized={false} />
      </TestWrapper>,
    );
  });

  bench("optimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Bars optimized={true} />
      </TestWrapper>,
    );
  });
});

describe("Bars prop update (100 re-renders)", () => {
  bench("unoptimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    const { rerender } = render(
      <TestWrapper svgRef={svgRef}>
        <Bars optimized={false} />
      </TestWrapper>,
    );

    for (let i = 0; i < 100; i++) {
      rerender(
        <TestWrapper svgRef={svgRef} dataPoints={[Math.random(), Math.random(), Math.random()]}>
          <Bars optimized={false} />
        </TestWrapper>,
      );
    }
  });

  bench("optimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    const { rerender } = render(
      <TestWrapper svgRef={svgRef}>
        <Bars optimized={true} />
      </TestWrapper>,
    );

    for (let i = 0; i < 100; i++) {
      rerender(
        <TestWrapper svgRef={svgRef} dataPoints={[Math.random(), Math.random(), Math.random()]}>
          <Bars optimized={true} />
        </TestWrapper>,
      );
    }
  });
});

describe("Bars setDataPoints (100 updates)", () => {
  bench("unoptimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    const barsRef = createRef<BarsHandle>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={false} />
      </TestWrapper>,
    );

    for (let i = 0; i < 100; i++) {
      barsRef.current?.setDataPoints([Math.random(), Math.random(), Math.random()]);
    }
  });

  bench("optimized", () => {
    const svgRef = createRef<SVGSVGElement>();
    const barsRef = createRef<PathHandle>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={true} />
      </TestWrapper>,
    );

    for (let i = 0; i < 100; i++) {
      barsRef.current?.setDataPoints([Math.random(), Math.random(), Math.random()]);
    }
  });
});
