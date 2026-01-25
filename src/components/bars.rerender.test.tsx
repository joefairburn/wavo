import { act, render } from "@testing-library/react";
import { Profiler, type ProfilerOnRenderCallback, createRef } from "react";
import { describe, expect, it } from "vitest";
import { WaveformProvider } from "../contexts/waveform-context";
import { Bars, type BarsHandle } from "./bars";
import type { PathHandle } from "./path";

const testData = [0.5, 0.6, 0.7, 0.8, 0.9];

function TestWrapper({
  children,
  svgRef,
}: {
  children: React.ReactNode;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  return (
    <div style={{ width: "200px", height: "100px" }}>
      <svg ref={svgRef} data-testid="waveform-svg">
        <WaveformProvider
          dataPoints={testData}
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

describe("Bars re-render prevention", () => {
  it("imperative setDataPoints should NOT trigger re-renders (unoptimized)", async () => {
    const svgRef = createRef<SVGSVGElement>();
    const barsRef = createRef<BarsHandle>();
    let renderCount = 0;

    const onRender: ProfilerOnRenderCallback = () => {
      renderCount++;
    };

    render(
      <TestWrapper svgRef={svgRef}>
        <Profiler id="bars" onRender={onRender}>
          <Bars ref={barsRef} optimized={false} />
        </Profiler>
      </TestWrapper>,
    );

    // Wait for initial render to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const initialRenderCount = renderCount;

    // Perform imperative updates - should NOT trigger re-renders
    act(() => {
      for (let i = 0; i < 10; i++) {
        barsRef.current?.setDataPoints([Math.random(), Math.random(), Math.random()]);
      }
    });

    const rendersAfterUpdates = renderCount - initialRenderCount;

    // Imperative updates should cause zero additional renders
    expect(rendersAfterUpdates).toBe(0);
  });

  it("imperative setDataPoints should NOT trigger re-renders (optimized)", async () => {
    const svgRef = createRef<SVGSVGElement>();
    const barsRef = createRef<PathHandle>();
    let renderCount = 0;

    const onRender: ProfilerOnRenderCallback = () => {
      renderCount++;
    };

    render(
      <TestWrapper svgRef={svgRef}>
        <Profiler id="bars" onRender={onRender}>
          <Bars ref={barsRef} optimized={true} />
        </Profiler>
      </TestWrapper>,
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const initialRenderCount = renderCount;

    act(() => {
      for (let i = 0; i < 10; i++) {
        barsRef.current?.setDataPoints([Math.random(), Math.random(), Math.random()]);
      }
    });

    const rendersAfterUpdates = renderCount - initialRenderCount;
    expect(rendersAfterUpdates).toBe(0);
  });
});
