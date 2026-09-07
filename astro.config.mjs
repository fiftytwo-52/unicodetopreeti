import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The sitemap and canonical URLs are built from this domain.
  site: 'https://unicodetopreeti.xyz',
  integrations: [
    sitemap({
      // /unicode-to-preeti is 301-redirected to / (see public/_redirects),
      // so it must not appear in the sitemap.
      filter: (page) => !page.endsWith('/unicode-to-preeti'),
    }),
  ],
  build: {
    // Emit /about.html instead of /about/index.html so the output works on
    // static hosts without directory-index rewriting.
    format: 'file',
  },
});
