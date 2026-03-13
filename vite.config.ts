import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react()],
  lint: { options: { typeAware: true, typeCheck: true } },
  pack: {
    entry: ["src/index.tsx"],
    format: ["esm", "cjs"],
    dts: true,
    target: "es2018",
    clean: true,
    sourcemap: true,
    treeshake: true,
    minify: true,
    jsx: "react-jsx",
    external: ["react", "react-dom"],
    outDir: "dist",
    fixedExtension: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    pool: "forks",
    execArgv: ["--expose-gc"],
    benchmark: {
      include: ["src/**/*.bench.{ts,tsx}"],
      outputJson: "./benchmark-results.json",
    },
  },
});
