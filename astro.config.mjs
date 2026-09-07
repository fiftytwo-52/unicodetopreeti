import { defineConfig } from 'astro/config';

export default defineConfig({
  // The sitemap and canonical URLs are built from this domain.
  // The sitemap itself is a static file: public/sitemap.xml.
  site: 'https://unicodetopreeti.xyz',
  integrations: [],
  build: {
    // Emit /about.html instead of /about/index.html so the output works on
    // static hosts without directory-index rewriting.
    format: 'file',
  },
});
