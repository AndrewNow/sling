import sanity from "@sanity/astro";
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import glsl from 'vite-plugin-glsl';
// import glslify from 'vite-plugin-glslify'
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [
      glsl(),
      // glslify()
    ],
  },
  image: {
    domains: ["cdn.sanity.io", "astro.build, utfs.io"],
  },
  integrations: [
    sanity({
      projectId: "m2uqkqq4",
      dataset: "production",
      apiVersion: "2023-10-10",
      // Set useCdn to false if you're building statically.
      useCdn: false,
    }),
    tailwind(),
  ],
});