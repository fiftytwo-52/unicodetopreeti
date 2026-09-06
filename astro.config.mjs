import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Update this to your own domain before deploying — the sitemap and
  // canonical URLs are built from it.
  site: 'https://nepalitexttools.example',
  integrations: [sitemap()],
  build: {
    // Emit /about.html instead of /about/index.html so the output works on
    // static hosts without directory-index rewriting.
    format: 'file',
  },
});
