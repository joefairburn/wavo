#!/usr/bin/env node
import { readFileSync } from "node:fs";

const results = JSON.parse(readFileSync("./benchmark-results.json", "utf8"));

console.log("\n╭─────────────────────────────────────────────────────────────╮");
console.log("│                    BENCHMARK RESULTS                        │");
console.log("╰─────────────────────────────────────────────────────────────╯\n");

// Collect benchmarks by file for cross-group comparisons
const benchmarksByFile = new Map();

for (const file of results.files) {
  const fileName = file.filepath.split("/").pop();
  benchmarksByFile.set(fileName, file.groups);

  for (const group of file.groups) {
    const groupName = group.fullName.split(" > ").pop();
    console.log(`▸ ${groupName}`);
    console.log("  ┌────────────────────────────────────────┬───────────────┬──────────┐");
    console.log("  │ Name                                   │ ops/sec       │ mean     │");
    console.log("  ├────────────────────────────────────────┼───────────────┼──────────┤");

    for (const bench of group.benchmarks) {
      const name = bench.name.padEnd(38).slice(0, 38);
      const hz = bench.hz.toLocaleString("en-US", { maximumFractionDigits: 0 }).padStart(13);
      const mean = `${bench.mean.toFixed(3)}ms`.padStart(8);
      console.log(`  │ ${name} │ ${hz} │ ${mean} │`);
    }

    console.log("  └────────────────────────────────────────┴───────────────┴──────────┘");

    // Show speedup within group (if 2 benchmarks with optimized/unoptimized pattern)
    if (group.benchmarks.length === 2) {
      const [first, second] = group.benchmarks;
      const speedup = second.hz / first.hz;
      if (speedup > 1) {
        console.log(`  ↳ ${second.name} is ${speedup.toFixed(1)}x faster than ${first.name}`);
      } else if (speedup < 1) {
        console.log(`  ↳ ${first.name} is ${(1 / speedup).toFixed(1)}x faster than ${second.name}`);
      }
    }
    console.log();
  }
}

// Cross-group comparison for Bars (prop update vs setDataPoints)
const barsGroups = benchmarksByFile.get("bars.bench.tsx");
if (barsGroups) {
  const propUpdate = barsGroups.find((g) => g.fullName.includes("prop update"));
  const setDataPoints = barsGroups.find((g) => g.fullName.includes("setDataPoints"));

  if (propUpdate && setDataPoints) {
    const propUnopt = propUpdate.benchmarks.find((b) => b.name === "unoptimized");
    const propOpt = propUpdate.benchmarks.find((b) => b.name === "optimized");
    const setUnopt = setDataPoints.benchmarks.find((b) => b.name === "unoptimized");
    const setOpt = setDataPoints.benchmarks.find((b) => b.name === "optimized");

    if (propUnopt && propOpt && setUnopt && setOpt) {
      const baseline = propUnopt.hz;

      // Create rows with speedup values, sorted slowest to fastest
      const rows = [
        { name: "unoptimized + props (baseline)", speedup: 1.0 },
        { name: "unoptimized + setDataPoints", speedup: setUnopt.hz / baseline },
        { name: "optimized + props", speedup: propOpt.hz / baseline },
        { name: "optimized + setDataPoints", speedup: setOpt.hz / baseline },
      ].sort((a, b) => a.speedup - b.speedup);

      console.log("╭─────────────────────────────────────────────────────────────╮");
      console.log("│          COMPARISON (vs unoptimized + props)                │");
      console.log("╰─────────────────────────────────────────────────────────────╯\n");

      console.log("  ┌────────────────────────────────────┬─────────────┐");
      console.log("  │ Method                             │ Speedup     │");
      console.log("  ├────────────────────────────────────┼─────────────┤");
      for (const row of rows) {
        const name = row.name.padEnd(34);
        const speedup = `${row.speedup.toFixed(1)}x`.padStart(11);
        console.log(`  │ ${name} │ ${speedup} │`);
      }
      console.log("  └────────────────────────────────────┴─────────────┘\n");
    }
  }
}
