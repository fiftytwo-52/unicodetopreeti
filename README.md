# Nepali Text Tools

Multipage Astro site with two client-side Nepali converters: Unicode to Preeti
and Roman Nepali to Unicode. No backend, no network calls —
the conversion tables ship with the page.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build into dist/
npm test         # converter tests, no framework needed
```

`npm test` runs on a bare Node 22 install (`--experimental-strip-types`), so it
works before dependencies are installed.

## Structure

```
src/lib/                     conversion logic, framework-free TypeScript
  preeti-map.ts              Preeti encoding tables
  preeti-to-unicode.ts       Preeti → Unicode
  unicode-to-preeti.ts       Unicode → Preeti
  roman-to-unicode.ts        phonetic Roman → Devanagari
src/components/Converter.astro   the two-pane tool, shared by all three pages
src/layouts/BaseLayout.astro     shell, meta tags, JSON-LD
src/pages/                   one file per route
scripts/test-converters.ts   240 assertions incl. 65 round-trips
```

Pages: `/`, `/unicode-to-preeti`, `/roman-to-unicode`,
`/how-to-use`, `/about`, `/contact`, `/advertise`, and a 404.

`src/lib/site.ts` holds the contact address used by the contact and advertise
pages — set it before deploying, alongside the domain.

## Before deploying

Set your real domain in `astro.config.mjs` (`site`) and in `public/robots.txt`.
Both the sitemap and the canonical URLs are built from it.

## Deploying to Cloudflare Pages

The site is a fully static build deployed to Cloudflare Pages as a separate
website. Astro writes flat `*.html` files to `dist/` ([`build.format: "file"`
](astro.config.mjs:9)), while the site links to pages without the extension
(`/about`, `/how-to-use`, ...).

Cloudflare Pages handles the extensionless links natively with its clean-URL
feature: `/about` serves `about.html`, and `/about.html` is 308-redirected back
to `/about`. The only extra routing rule needed lives in a
[`_redirects`](public/_redirects) file (Netlify-style, native to Pages, copied
into `dist/` from `public/` at build time):

- `/unicode-to-preeti` and `/unicode-to-preeti.html` → permanent 301 redirect
  to `/` (replaces the built meta-refresh stub in `dist/`)

Anything else unmatched falls back to the built-in `404.html` with a genuine
HTTP 404 status, so the styled error page is served automatically.

```bash
npm install
npm run build          # astro check + astro build into dist/
npm run deploy:pages   # astro build && wrangler pages deploy dist
# or just:
npm run deploy
```

First-time setup: run `npx wrangler login` and check `npx wrangler whoami`.
Create the project once with `npx wrangler pages project create
unicodetopreeti --production-branch=main`. The Pages project name and output
directory live in [`wrangler.pages.toml`](wrangler.pages.toml). The live URL is
reported by `wrangler pages deploy` (a `<project>.pages.dev` subdomain by
default).

## How the conversion works

Preeti is a legacy 8-bit font: it maps Devanagari glyphs onto ASCII codepoints,
so a Preeti file reads as nonsense English until the font is applied. Converting
is a transliteration between two encodings of one script.

The hard part is ordering. Unicode stores text logically (consonant, then vowel
sign); Preeti stores it visually, the way a typewriter draws it. Three cases
break character-by-character converters:

| Case | Unicode | Preeti | Why |
| --- | --- | --- | --- |
| i-matra | कि | `ls` | ि is drawn left of its consonant, so it is typed first |
| reph | कर्म | `sd{` | र् rides above a later consonant, so `{` trails the syllable |
| conjunct | क्क | `Ss` | half form (shifted key) + full form |

Both converters therefore work syllable by syllable. The round-trip tests cover
each case, including combinations like `स्ति` → `l:t` (i-matra on a conjunct).

The Roman converter reads each word left to right taking the longest matching
token, applies Devanagari syllable rules (inherent अ unless a vowel replaces it,
virama between adjacent consonants), and falls back to whole-word spellings for
words like तपाईं and काठमाडौं that general rules would miss.

## Limits

Preeti only. Kantipur, Sagarmatha and PCS Nepali use different mappings. Some
Preeti variants remap a few keys, so unusual sources may need spot fixes — both
panes are editable and re-convert as you type.
