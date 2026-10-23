import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "http://localhost:4321",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en-GB", tr: "tr-TR" } },
      filter: (page) => !page.endsWith("/404/"),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  server: { port: 4321 },
});
