// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

import inoxToolsRuntimeLogger from '@inox-tools/runtime-logger';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), inoxToolsRuntimeLogger()],
  output: 'server',

  adapter: node({
    mode: 'standalone'
  })
});