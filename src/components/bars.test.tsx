import { act, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { WaveformProvider } from "../contexts/waveform-context";
import { Bars, type BarsHandle } from "./bars";
import type { PathHandle } from "./path";

/**
 * Test wrapper that provides WaveformContext
 */
function TestWrapper({
  children,
  dataPoints = [0.5, 0.6, 0.7, 0.8, 0.9],
  svgRef,
}: {
  children: React.ReactNode;
  dataPoints?: number[];
  svgRef: React.RefObject<SVGSVGElement | null>;
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

describe("Bars imperative API (non-optimized)", () => {
  it("exposes setDataPoints method via ref", async () => {
    const barsRef = createRef<BarsHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={false} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
    });

    expect(barsRef.current?.setDataPoints).toBeTypeOf("function");
  });

  it("exposes getBarCount method via ref", async () => {
    const barsRef = createRef<BarsHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={false} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
    });

    expect(barsRef.current?.getBarCount).toBeTypeOf("function");
  });

  it("setDataPoints updates bar heights via DOM", async () => {
    const barsRef = createRef<BarsHandle>();
    const svgRef = createRef<SVGSVGElement>();

    const { container } = render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={false} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
      expect(barsRef.current?.getBarCount()).toBeGreaterThan(0);
    });

    // Get initial bar heights
    const bars = container.querySelectorAll("[data-wavo-bar]");
    expect(bars.length).toBeGreaterThan(0);

    const initialHeights = Array.from(bars).map((bar) => bar.getAttribute("height"));

    // Update with different data (all low values)
    act(() => {
      barsRef.current?.setDataPoints([0.1, 0.1, 0.1, 0.1, 0.1]);
    });

    // Heights should be updated
    const updatedHeights = Array.from(bars).map((bar) => bar.getAttribute("height"));

    // At least some heights should be different
    const heightsChanged = initialHeights.some((h, i) => h !== updatedHeights[i]);
    expect(heightsChanged).toBe(true);
  });

  it("getBarCount returns the current bar count", async () => {
    const barsRef = createRef<BarsHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={false} width={20} gap={5} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
      // With 200px width, 20px bar width + 5px gap = 25px per segment
      // 200 / 25 = 8 bars
      const barCount = barsRef.current?.getBarCount();
      expect(barCount).toBeGreaterThan(0);
      expect(barCount).toBe(8);
    });
  });
});

describe("Bars imperative API (optimized - delegates to Path)", () => {
  it("exposes setDataPoints method via ref when optimized", async () => {
    const barsRef = createRef<BarsHandle | PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={true} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
    });

    expect(barsRef.current?.setDataPoints).toBeTypeOf("function");
  });

  it("exposes getSegmentCount method via ref when optimized (PathHandle)", async () => {
    const barsRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Bars ref={barsRef} optimized={true} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(barsRef.current).not.toBeNull();
    });

    // When optimized, it delegates to Path which has getSegmentCount
    expect(barsRef.current?.getSegmentCount).toBeTypeOf("function");
  });
});
