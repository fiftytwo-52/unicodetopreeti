/**
 * Post-build step: collapse the @astrojs/sitemap output
 * (sitemap-index.xml + sitemap-0.xml, -1.xml, ...) into a single
 * dist/sitemap.xml, which is the URL submitted to Google Search Console.
 *
 * Runs automatically after `astro build` (see the "build" script in
 * package.json).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const chunks = readdirSync(dist)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .sort();

if (chunks.length === 0) {
    console.warn('No sitemap-*.xml chunks found; did the sitemap integration run?');
    process.exit(0);
}

// Every chunk is a complete <urlset>…</urlset> document; pull the <url> entries
// out of each and merge them into one document.
const urls = chunks
    .map((file) =>
        readFileSync(join(dist, file), 'utf8').match(/<url>[\s\S]*?<\/url>/g) ?? []
    )
    .flat();

const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join('') +
    '</urlset>';

writeFileSync(join(dist, 'sitemap.xml'), sitemap);

for (const file of [...chunks, 'sitemap-index.xml']) {
    const p = join(dist, file);
    if (existsSync(p)) unlinkSync(p);
}

console.log(`sitemap.xml written with ${urls.length} URL${urls.length === 1 ? '' : 's'}`);
