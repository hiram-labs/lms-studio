// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

import inoxToolsRuntimeLogger from "@inox-tools/runtime-logger";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), inoxToolsRuntimeLogger(), mdx()],
  output: "server",

  adapter: node({
    mode: "standalone",
  }),
});
