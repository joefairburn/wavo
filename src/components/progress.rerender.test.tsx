import { act, render } from "@testing-library/react";
import { Profiler, type ProfilerOnRenderCallback, createRef } from "react";
import { describe, expect, it } from "vitest";
import { WaveformProvider } from "../contexts/waveform-context";
import { Progress, type ProgressHandle } from "./progress";

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
          dataPoints={[0.5]}
          svgRef={svgRef}
          hasProgress={true}
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

describe("Progress re-render prevention", () => {
  it("imperative setProgress should NOT trigger re-renders", async () => {
    const svgRef = createRef<SVGSVGElement>();
    const progressRef = createRef<ProgressHandle>();
    let renderCount = 0;

    const onRender: ProfilerOnRenderCallback = () => {
      renderCount++;
    };

    render(
      <TestWrapper svgRef={svgRef}>
        <Profiler id="progress" onRender={onRender}>
          <Progress ref={progressRef} color="#f00" />
        </Profiler>
      </TestWrapper>,
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const initialRenderCount = renderCount;

    // Simulate 60 progress updates (1 second at 60fps)
    act(() => {
      for (let i = 0; i <= 60; i++) {
        progressRef.current?.setProgress(i / 60);
      }
    });

    const rendersAfterUpdates = renderCount - initialRenderCount;

    // Imperative updates should cause zero additional renders
    expect(rendersAfterUpdates).toBe(0);
  });

  it("imperative setProgress with gradient should NOT trigger re-renders", async () => {
    const svgRef = createRef<SVGSVGElement>();
    const progressRef = createRef<ProgressHandle>();
    let renderCount = 0;

    const onRender: ProfilerOnRenderCallback = () => {
      renderCount++;
    };

    render(
      <TestWrapper svgRef={svgRef}>
        <Profiler id="progress" onRender={onRender}>
          <Progress
            ref={progressRef}
            gradient={[
              { offset: "0%", color: "#f96706" },
              { offset: "100%", color: "#ffd93d" },
            ]}
          />
        </Profiler>
      </TestWrapper>,
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const initialRenderCount = renderCount;

    act(() => {
      for (let i = 0; i <= 60; i++) {
        progressRef.current?.setProgress(i / 60);
      }
    });

    const rendersAfterUpdates = renderCount - initialRenderCount;
    expect(rendersAfterUpdates).toBe(0);
  });
});
