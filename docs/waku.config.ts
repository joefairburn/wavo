import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'waku/config';
import mdx from 'fumadocs-mdx/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as MdxConfig from './source.config.js';

const mdxPlugin = await mdx(MdxConfig);

export default defineConfig({
  vite: {
    environments: {
      rsc: {
        optimizeDeps: { include: ['hono/tiny'] },
        build: { rollupOptions: { platform: 'neutral' } as never },
      },
      ssr: {
        optimizeDeps: { include: ['waku > rsc-html-stream/server'] },
        build: { rollupOptions: { platform: 'neutral' } as never },
      },
    },
    plugins: [
      tailwindcss(),
      mdxPlugin,
      tsconfigPaths(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        inspectorPort: false,
      }),
    ],
  },
});
