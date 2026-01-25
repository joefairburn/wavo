import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    benchmark: {
      include: ["src/**/*.bench.{ts,tsx}"],
      outputJson: "./benchmark-results.json",
    },
  },
});
