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
