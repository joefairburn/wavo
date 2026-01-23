// Site configuration - single source of truth for shared values
import packageJson from "../../../package.json";

export const siteConfig = {
  name: "Wavo",
  version: packageJson.version,
  description: "A small library for drawing waveforms in React",
  github: "https://github.com/joefairburn/wavo",
  npm: "https://www.npmjs.com/package/wavo",
} as const;
