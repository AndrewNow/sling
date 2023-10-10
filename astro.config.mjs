import sanity from "@sanity/astro";
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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