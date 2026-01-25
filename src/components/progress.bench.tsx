import { render } from "@testing-library/react";
import { createRef } from "react";
import { bench, describe } from "vitest";
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

describe("Progress rendering", () => {
  bench("initial render", () => {
    const svgRef = createRef<SVGSVGElement>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Progress color="#f00" />
      </TestWrapper>,
    );
  });

  bench("imperative setProgress (60 updates = 1 second @ 60fps)", () => {
    const svgRef = createRef<SVGSVGElement>();
    const progressRef = createRef<ProgressHandle>();

    render(
      <TestWrapper svgRef={svgRef}>
        <Progress ref={progressRef} color="#f00" />
      </TestWrapper>,
    );

    for (let i = 0; i <= 60; i++) {
      progressRef.current?.setProgress(i / 60);
    }
  });

  bench("gradient render", () => {
    const svgRef = createRef<SVGSVGElement>();
    render(
      <TestWrapper svgRef={svgRef}>
        <Progress
          gradient={[
            { offset: "0%", color: "#f96706" },
            { offset: "50%", color: "#ff9a3c" },
            { offset: "100%", color: "#ffd93d" },
          ]}
        />
      </TestWrapper>,
    );
  });
});
