import sanity from "@sanity/astro";
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
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