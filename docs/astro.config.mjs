// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
      styleOverrides: {
        borderRadius: "0",
        borderColor: "rgba(255, 255, 255, 0.1)",
        codeBackground: "#161616",
        frames: {
          frameBoxShadowCssValue: "none",
          editorTabBarBackground: "#222",
          editorActiveTabBackground: "#1a1a1a",
          editorActiveTabIndicatorBottomColor: "#f96706",
          terminalTitlebarBackground: "#222",
          terminalBackground: "#161616",
          tooltipSuccessBackground: "#f96706",
          tooltipSuccessForeground: "#fff",
        },
      },
    }),
    mdx(),
    react({ experimentalReactChildren: true }),
  ],
  vite: {
    resolve: {
      alias: {
        "@docs": "/src",
      },
    },
  },
});
