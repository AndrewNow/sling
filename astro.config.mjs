import sanity from "@sanity/astro";
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import glsl from 'vite-plugin-glsl';
// import glslify from 'vite-plugin-glslify'
// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [
      glsl(),
      // glslify()
    ],
  },
  integrations: [
    sanity({
      projectId: "m2uqkqq4",
      dataset: "production",
      apiVersion: "2023-10-10",
      // Set useCdn to false if you're building statically.
      useCdn: false,
    }),
  ],
});