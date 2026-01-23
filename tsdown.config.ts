import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  target: "es2018",
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  jsx: "react-jsx",
  external: ["react", "react-dom"],
  outDir: "dist",
  fixedExtension: true,
});
