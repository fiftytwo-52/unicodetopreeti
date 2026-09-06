/**
 * Preeti font encoding tables.
 *
 * Preeti is a legacy 8-bit Nepali font: it maps Devanagari glyphs onto ASCII
 * codepoints, so the bytes spell nonsense unless the Preeti font is applied.
 * Converting is therefore a transliteration between two encodings of the same
 * script, not a translation.
 *
 * Two facts about the keyboard layout drive most of the logic:
 *
 * 1. Shifted keys generally produce the HALF form of a consonant (क् rather
 *    than क). `S` is क्, `s` is क. Conjuncts are typed as half-form followed
 *    by full form, so क्क is `Ss`.
 * 2. Some glyphs are typed in visual order rather than logical order. The
 *    i-matra (ि) precedes its consonant on the keyboard, matching where it is
 *    drawn, so कि is `ls`.
 */

/** Single Preeti codepoints and their Unicode equivalents. */
export const PREETI_TO_UNICODE: Record<string, string> = {
  // Independent vowels
  c: 'अ',
  O: 'इ',
  p: 'उ',
  C: 'ऋ',
  P: 'ए',

  // Consonants, unshifted (full forms carrying the inherent vowel अ)
  s: 'क',
  v: 'ख',
  u: 'ग',
  '3': 'घ',
  'ª': 'ङ',
  r: 'च',
  '5': 'छ',
  h: 'ज',
  '´': 'झ',
  '`': 'ञ',
  '©': 'र',
  '6': 'ट',
  '7': 'ठ',
  '8': 'ड',
  '9': 'ढ',
  b: 'द',
  w: 'ध',
  g: 'न',
  t: 'त',
  y: 'थ',
  k: 'प',
  m: 'फ',
  a: 'ब',
  e: 'भ',
  d: 'म',
  o: 'य',
  '/': 'र',
  n: 'ल',
  j: 'व',
  z: 'श',
  ';': 'स',
  x: 'ह',
  q: 'त्र',

  // Consonants, shifted (half forms — consonant + virama)
  S: 'क्',
  V: 'ख्',
  U: 'ग्',
  R: 'च्',
  H: 'ज्',
  T: 'त्',
  Y: 'थ्',
  W: 'ध्',
  G: 'न्',
  K: 'प्',
  A: 'ब्',
  E: 'भ्',
  D: 'म्',
  J: 'व्',
  Z: 'श्',
  X: 'ह्',
  N: 'ल्',
  ':': 'स्',
  I: 'क्ष्',
  i: 'ष्',
  '‰': 'झ्',
  '¤': 'झ्',
  '£': 'घ्',
  'ˆ': 'फ्',
  '¡': 'ज्ञ्',
  '~': 'ञ्',
  '>': 'श्र',
  B: 'द्य',

  // Pre-composed conjuncts with their own keys.
  '›': 'द्र',
  '„': 'ध्र',
  'Ì': 'न्न',
  'ç': 'ॐ',
  Q: 'त्त',
  '2': 'द्द',
  '4': 'द्ध',
  'ß': 'द्म',
  'å': 'द्व',
  '¢': 'द्घ',
  '§': 'ट्ट',
  'Ý': 'ट्ठ',
  '¶': 'ठ्ठ',
  '•': 'ड्ड',
  'Í': 'ङ्क',
  'Î': 'ङ्ख',
  'Ë': 'ङ्ग',
  '‹': 'ङ्घ',
  '°': '°',

  // Matras and signs
  f: 'ा',
  l: 'ि',
  L: 'ी',
  "'": 'ु',
  '"': 'ू',
  '[': 'ृ',
  ']': 'े',
  '}': 'ै',
  '+': 'ं',
  M: 'ः',
  F: 'ँ',
  '\\': '्',
  '‛': 'ॉ',
  '‘': 'ॅ',

  // Rakar — ्र drawn as a stroke on the preceding consonant, so क्र is `s|`
  // rather than half-form + र. `«` is the same glyph on another key.
  '|': '्र',
  '«': '्र',

  // र with u/uu matras have their own keys; `/'` would draw the wrong glyph.
  '?': 'रु',
  '¿': 'रू',

  // More single-glyph compositions with dedicated keys.
  'Å': 'हृ',
  '¥': 'र्‍',
  '˜': 'ऽ',

  // Digits
  ')': '०',
  '!': '१',
  '@': '२',
  '#': '३',
  '$': '४',
  '%': '५',
  '^': '६',
  '&': '७',
  '*': '८',
  '(': '९',

  // Unshifted number row carries conjuncts and half forms.
  '0': 'ण्',

  // Punctuation
  '.': '।',
  // Dash bytes typed with Alt-codes in legacy documents become the plain
  // hyphen in Unicode (the font's `-` key itself draws `(`).
  '–': '-',
  '—': '-',
  // Quote glyph bytes. Ú renders the closing quote; æ/Æ are the opening and
  // closing double quotes, … the opening single quote. The font's plain
  // `'`/`"` keys draw the ु/ू matras instead.
  'Ú': "'",
  'æ': '"',
  'Æ': '"',
  '…': "'",
  // Glyphs that live on the symbol keys of the legacy layout.
  '÷': '/',
  '×': '×',
  'Û': '!',
  'Ö': '=',
  'Ò': '¨',
  'Ù': ';',
  'Ü': '%',
  '±': '+',
  '<': '?',
  '_': ')',
  '=': '.',
  '-': '(',
};

/**
 * Multi-character Preeti sequences that must be matched before single
 * characters, because the pieces mean something different on their own.
 * `cf` is आ, but `c` alone is अ and `f` alone is ा.
 */
export const PREETI_SEQUENCES: Record<string, string> = {
  // Vowels built from more than one key
  cf: 'आ',
  'O{': 'ई',
  pm: 'ऊ',
  'C[': 'ॠ',
  'P]': 'ऐ',
  'cf]': 'ओ',
  'cf}': 'औ',
  'cf+': 'आं',

  // Composite consonants
  '0f': 'ण',
  km: 'फ',
  em: 'झ',
  If: 'क्ष',
  '1': 'ज्ञ',
  'if': 'ष',
  'Zf': 'श',

  // Overlay-`m` compositions (`m` is a modifier key on the layout).
  qm: 'क्र',
  Qm: 'क्त',

  // The layout draws `6[` (ट + ृ) as the ट्ट glyph.
  '6[': 'ट्ट',

  // Composite matras
  'f]': 'ो',
  'f}': 'ौ',

  // Punctuation
  '..': '॥',
  // The colon shares the `M` byte with the visarga — both draw the same
  // two-dot glyph in the font, so `M` alone reads back as ः.
};

/** Reph — र् preceding another consonant. Typed after the consonant it rides. */
export const REPH = '{';

/** Devanagari consonant range, plus conjuncts spelled as multi-char strings. */
export const CONSONANT_RE = /[क-हक़-य़]/u;

/** Matras that follow their consonant in both encodings. */
export const MATRAS = 'ा ी ु ू ृ े ै ो ौ ं ः ँ ्'.split(' ');
