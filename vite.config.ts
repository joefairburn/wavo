import tsdownConfig from './tsdown.config.js';

import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {"options":{"typeAware":true,"typeCheck":true}},
  pack: tsdownConfig,
});
