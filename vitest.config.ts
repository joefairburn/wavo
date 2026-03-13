import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react()],
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
