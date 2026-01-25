import { act, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { WaveformProvider } from "../contexts/waveform-context";
import { Path, type PathHandle } from "./path";

/**
 * Test wrapper that provides WaveformContext with mocked SVG dimensions
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

describe("Path imperative API", () => {
  it("exposes setDataPoints method via ref", async () => {
    const pathRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Path ref={pathRef} type="bar" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(pathRef.current).not.toBeNull();
    });

    expect(pathRef.current?.setDataPoints).toBeTypeOf("function");
  });

  it("exposes getSegmentCount method via ref", async () => {
    const pathRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Path ref={pathRef} type="bar" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(pathRef.current).not.toBeNull();
    });

    expect(pathRef.current?.getSegmentCount).toBeTypeOf("function");
  });

  it("setDataPoints can be called without errors", async () => {
    const pathRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Path ref={pathRef} type="bar" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(pathRef.current).not.toBeNull();
    });

    // setDataPoints should be callable without throwing
    // Note: In jsdom, clientWidth isn't computed, so segmentCount may be 0
    // and the actual DOM update may not occur. This is expected behavior
    // in the unit test environment - full rendering is tested via E2E.
    expect(() => {
      act(() => {
        pathRef.current?.setDataPoints([0.1, 0.2, 0.3, 0.4, 0.5]);
      });
    }).not.toThrow();
  });

  it("getSegmentCount returns a number", async () => {
    const pathRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Path ref={pathRef} type="bar" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(pathRef.current).not.toBeNull();
    });

    // getSegmentCount should return a number (may be 0 in jsdom due to no layout)
    const segmentCount = pathRef.current?.getSegmentCount();
    expect(segmentCount).toBeTypeOf("number");
  });

  it("works with line type", async () => {
    const pathRef = createRef<PathHandle>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Path ref={pathRef} type="line" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(pathRef.current).not.toBeNull();
    });

    // Verify the API works for line type as well
    expect(pathRef.current?.setDataPoints).toBeTypeOf("function");
    expect(pathRef.current?.getSegmentCount).toBeTypeOf("function");

    expect(() => {
      act(() => {
        pathRef.current?.setDataPoints([0.9, 0.8, 0.7, 0.6, 0.5]);
      });
    }).not.toThrow();
  });
});
