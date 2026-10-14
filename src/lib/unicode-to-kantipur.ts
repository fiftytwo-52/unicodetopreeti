import { KANTIPUR_REPH } from './kantipur-map.ts';

/**
 * Unicode → Kantipur.
 *
 * Mirrors the Unicode → Preeti encoder syllable by syllable — Kantipur
 * shares Preeti's typing layout and visual-order quirks (i-matra typed
 * before its cluster, reph typed after the cluster, rakar as a stroke) —
 * but the byte assignments differ where the two fonts differ. The tables
 * below are the Kantipur assignments, verified against the nep-ttf2utf
 * Kantipur char-map (github.com/imxitiz/nep-ttf2utf, Apache-2.0,
 * rules/kantipur.yaml) and cross-checked against this site's
 * kantipur-to-unicode decoder so every emitted byte round-trips.
 *
 * Where Kantipur differs from Preeti:
 *   - Half forms: फ् is Î (Preeti ˆ is unmapped in Kantipur), य् is the
 *     dedicated ø byte (Preeti o\), ह् is x\ (Preeti X is the हृ ligature).
 *   - Ligatures: ङ्क Í, ङ्ग Ë, ङ्ढ °, त्त् Œ and त्र् œ have dedicated
 *     Kantipur bytes; द्र has none (Kantipur › is the avagraha ऽ) and ट्ठ
 *     has none (Preeti Ý is unmapped), so both fall back to half + full.
 *   - हृ is X (Preeti Å is unmapped in Kantipur).
 *   - Chandrabindu ँ is “ (Preeti F is the aa-matra in Kantipur).
 *   - Avagraha ऽ is › (Preeti ˜ also decodes to ऽ in Kantipur).
 *   - Exclamation ! is † (Preeti Û is unmapped in Kantipur).
 *   - No Kantipur glyph exists for %, =, ;, : or the degree sign ° — those
 *     pass through unchanged. Note the ° byte itself draws ङ्ढ in the
 *     Kantipur font, so a literal ° in the output would render as ङ्ढ.
 *   - No nukta byte exists in Kantipur, so ़ passes through unchanged.
 *
 * Everything else is byte-for-byte identical to Preeti.
 */

/** Full consonant forms. Identical to Preeti. */
const CONSONANTS: Record<string, string> = {
  क: 's',
  ख: 'v',
  ग: 'u',
  घ: '3',
  ङ: 'ª',
  च: 'r',
  छ: '5',
  ज: 'h',
  झ: 'em',
  ञ: '`',
  ट: '6',
  ठ: '7',
  ड: '8',
  ढ: '9',
  ण: '0f',
  त: 't',
  थ: 'y',
  द: 'b',
  ध: 'w',
  न: 'g',
  प: 'k',
  फ: 'km',
  ब: 'a',
  भ: 'e',
  म: 'd',
  य: 'o',
  र: '/',
  ल: 'n',
  व: 'j',
  श: 'z',
  ष: 'if',
  स: ';',
  ह: 'x',
};

/**
 * Half forms (consonant + virama). Where the layout has no dedicated shifted
 * key, fall back to the full form plus an explicit virama `\`.
 */
const HALF_FORMS: Record<string, string> = {
  क: 'S',
  ख: 'V',
  ग: 'U',
  घ: '£',
  ङ: 'ª\\',
  च: 'R',
  छ: '5\\',
  ज: 'H',
  झ: '‰',
  ञ: '~',
  ट: '6\\',
  ठ: '7\\',
  ड: '8\\',
  ढ: '9\\',
  ण: '0',
  त: 'T',
  थ: 'Y',
  द: 'b\\',
  ध: 'W',
  न: 'G',
  प: 'K',
  फ: 'Î',
  ब: 'A',
  भ: 'E',
  म: 'D',
  य: 'ø',
  र: '/\\',
  ल: 'N',
  व: 'J',
  श: 'Z',
  ष: 'i',
  स: ':',
  ह: 'x\\',
};

/**
 * Conjuncts with a dedicated key, checked before their component parts.
 * द्र and ट्ठ have no dedicated Kantipur key — they are spelled half-form +
 * component (b| and 6\7), unlike Preeti.
 */
const LIGATURES: Record<string, string> = {
  'क्ष': 'If',
  'क्ष्': 'I',
  'ज्ञ': '1',
  'ज्ञ्': '¡',
  'त्र': 'q',
  'त्र्': 'œ',
  'त्त': 'Q',
  'त्त्': 'Œ',
  'श्र': '>',
  'द्य': 'B',
  'ध्र': '„',
  'द्द': '2',
  'द्ध': '4',
  'द्म': 'ß',
  'द्व': 'å',
  'द्घ': '¢',
  'ट्ट': '§',
  'ठ्ठ': '¶',
  'ड्ड': '•',
  'न्न': 'Ì',
  'ॐ': 'ç',
  'ङ्क': 'Í',
  'ङ्ग': 'Ë',
  'ङ्ढ': '°',
};

/**
 * Sequences that are drawn as a single ligature glyph with a dedicated key.
 * Spelling them from their parts produces the wrong shape: रु is `?`, not `/`
 * plus the matra; हृ is `X`, not `x` plus anything.
 */
const RA_LIGATURES: Record<string, string> = {
  'रु': '?',
  'रू': '¿',
  'हृ': 'X',
  'र्\u200D': '¥',
};

/** Rakar: ्र drawn as a stroke under the cluster, typed after it. */
const RAKAR = '|';

/** Retroflex rakar: for ट्र, ठ्र, ड्र, ढ्र the stroke is drawn as «. */
const RETROFLEX_RAKAR = '«';

/** Retroflex consonants that use the « rakar stroke. */
const RETROFLEX_CONSONANTS = new Set(['ट', 'ठ', 'ड', 'ढ']);

const INDEPENDENT_VOWELS: Record<string, string> = {
  अ: 'c',
  आ: 'cf',
  इ: 'O',
  ई: 'O{',
  उ: 'p',
  ऊ: 'pm',
  ऋ: 'C',
  ॠ: 'C[',
  ए: 'P',
  ऐ: 'P]',
  ओ: 'cf]',
  औ: 'cf}',
};

const MATRAS: Record<string, string> = {
  'ा': 'f',
  'ि': 'l',
  'ी': 'L',
  'ु': "'",
  'ू': '"',
  'ृ': '[',
  'े': ']',
  'ै': '}',
  'ो': 'f]',
  'ौ': 'f}',
  'ॉ': '‛',
  'ॅ': '‘',
};

/** Signs that trail the syllable in both encodings. */
const SIGNS: Record<string, string> = {
  'ं': '+',
  'ः': 'M',
  'ँ': '“',
};

const DIGITS: Record<string, string> = {
  // ASCII digits become the Devanagari digit bytes the font provides: `$`
  // is ४, `%` is ५, etc. The bare ASCII digit bytes draw unrelated conjuncts
  // in the font (`4` is द्ध, `5` is छ).
  '0': ')',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '०': ')',
  '१': '!',
  '२': '@',
  '३': '#',
  '४': '$',
  '५': '%',
  '६': '^',
  '७': '&',
  '८': '*',
  '९': '(',
};

const PUNCTUATION: Record<string, string> = {
  '।': '.',
  '॥': '..',
  'ऽ': '›',
  // The Kantipur font draws the plain `-` byte as `(`, so a dash must be typed
  // as the en dash (Alt+0150). The em dash (U+2014, char code 2014) is drawn
  // by its dedicated glyph in the font.
  '-': '–',
  '—': '—',
  // Underscores become `=` so the Kantipur font draws them as a dotted blank
  // (..........) for fill-in-the-blank questions instead of a solid line —
  // the `=` byte draws the dot glyph in the font.
  '_': '=',
  // Quote glyphs live on Alt-code bytes too: the plain `'` and `"` bytes
  // render as the ु and ू matras in the font, so quotes must use Ú/æ/Æ/….
  // The straight `'` and `"` are handled separately in the loop — each
  // alternates between its opening and closing glyphs.
  '’': 'Ú',
  '“': 'æ',
  '”': 'Æ',
  '‘': '…',
  // The `!` key draws the digit १ in the font, so the exclamation is typed
  // on the † byte. The `?` key draws the रु ligature, so a question mark is
  // typed on the `<` key. There is no Kantipur glyph for the percent sign,
  // equals sign, semicolon, colon or degree sign, so those pass through.
  '!': '†',
  '×': '×',
  '?': '<',
  // Brackets: Kantipur only supports small brackets `(` and `)`. In the font,
  // `(` is typed on the `-` key and `)` on the `_` key. Curly `{}` and square
  // `[]` brackets are normalized to small brackets `()` so they don't produce
  // accidental matras or reph in Kantipur.
  '(': '-',
  ')': '_',
  '{': '-',
  '}': '_',
  '[': '-',
  ']': '_',
};

const LIGATURE_KEYS = Object.keys(LIGATURES).sort((a, b) => b.length - a.length);
const RA_LIGATURE_KEYS = Object.keys(RA_LIGATURES);

const VIRAMA = '्';
const isConsonant = (char: string) => char !== undefined && char in CONSONANTS;
const isMatra = (char: string) => char !== undefined && char in MATRAS;
const isSign = (char: string) => char !== undefined && char in SIGNS;

export function unicodeToKantipur(input: string): string {
  let output = '';
  let index = 0;
  // Straight quotes are ambiguous, so each kind alternates: the 1st, 3rd, …
  // occurrence opens and the 2nd, 4th, … closes. Curly quotes carry their
  // own direction and skip these counters.
  let doubleQuoteCount = 0;
  let singleQuoteCount = 0;

  while (index < input.length) {
    const char = input[index];

    // --- Consonant cluster ---------------------------------------------
    if (isConsonant(char) || LIGATURE_KEYS.some((k) => input.startsWith(k, index))) {
      // र with the u/uu matras is drawn as a single ligature glyph with its
      // own key; `/` plus the matra produces the wrong shape.
      const raLigature = RA_LIGATURE_KEYS.find((key) => input.startsWith(key, index));
      if (raLigature) {
        output += RA_LIGATURES[raLigature];
        index += raLigature.length;
        continue;
      }

      // Collect the cluster: consonants joined by viramas.
      const parts: string[] = [];
      let cursor = index;

      while (cursor < input.length) {
        const ligature = LIGATURE_KEYS.find(
          (key) => input.startsWith(key, cursor) && !key.endsWith(VIRAMA),
        );
        if (ligature) {
          parts.push(ligature);
          cursor += ligature.length;
        } else if (isConsonant(input[cursor])) {
          parts.push(input[cursor]);
          cursor += 1;
        } else {
          break;
        }

        // A virama joins this consonant to the next one.
        if (input[cursor] === VIRAMA) {
          const next = cursor + 1;
          const continues =
            isConsonant(input[next]) ||
            LIGATURE_KEYS.some((k) => input.startsWith(k, next));
          if (continues) {
            cursor += 1;
            continue;
          }
        }
        break;
      }

      // Trailing virama with nothing after it: an explicit half form.
      const trailingVirama = input[cursor] === VIRAMA;
      if (trailingVirama) cursor += 1;

      // र् at the head of a cluster is reph, drawn above the cluster's end.
      let reph = '';
      if (parts.length > 1 && parts[0] === 'र') {
        reph = KANTIPUR_REPH;
        parts.shift();
      }

      // र as the *last* member of a cluster is rakar: a stroke drawn under the
      // consonant it follows, typed after it. The mirror image of reph.
      // Skipped when a dedicated ligature key already covers the pair.
      let rakar = '';
      if (
        parts.length > 1 &&
        parts.at(-1) === 'र' &&
        !trailingVirama &&
        !LIGATURES[parts.slice(-2).join(VIRAMA)]
      ) {
        // Retroflex consonants (ट, ठ, ड, ढ) use the « stroke for rakar.
        const lastConsonant = parts.at(-2);
        rakar = lastConsonant && RETROFLEX_CONSONANTS.has(lastConsonant)
          ? RETROFLEX_RAKAR
          : RAKAR;
        parts.pop();
        // The rakar glyph carries the virama, so what remains keeps its full
        // form: क्र is `s|`, not `S|`.
      }

      // Every part but the last is a half form.
      const cluster = parts
        .map((part, position) => {
          const isLast = position === parts.length - 1;
          if (isLast && !trailingVirama) {
            return LIGATURES[part] ?? CONSONANTS[part];
          }
          if (isLast && trailingVirama) {
            // A consonant with a trailing halanta is typed as the full letter
            // plus the halanta key: न् is `g\`, क् is `s\`. A conjunct closed
            // by halanta keeps its dedicated half key when it has one
            // (`ज्ञ्` is `¡`, `त्र्` is `œ`).
            const half = LIGATURES[part + VIRAMA];
            if (half !== undefined) return half;
            const dedicated = LIGATURES[part];
            if (dedicated !== undefined) {
              return part.endsWith(VIRAMA) ? dedicated : dedicated + '\\';
            }
            return CONSONANTS[part] + '\\';
          }
          // Dedicated half of a conjunct (`क्ष्` is `I`), else the conjunct
          // glyph closed with an explicit virama (`द्व` in द्वन्द्व is `å\`),
          // else the plain half form.
          const dedicated = LIGATURES[part];
          return (
            LIGATURES[part + VIRAMA] ??
            (dedicated !== undefined
              ? part.endsWith(VIRAMA)
                ? dedicated
                : dedicated + '\\'
              : undefined) ??
            HALF_FORMS[part] ??
            CONSONANTS[part] + '\\'
          );
        })
        .join('');

      // Collect matras and signs attached to this syllable.
      let matras = '';
      let signs = '';
      let hasIkar = false;

      while (cursor < input.length) {
        if (input[cursor] === 'ि') {
          hasIkar = true;
          cursor += 1;
        } else if (isMatra(input[cursor])) {
          matras += MATRAS[input[cursor]];
          cursor += 1;
        } else if (isSign(input[cursor])) {
          signs += SIGNS[input[cursor]];
          cursor += 1;
        } else {
          break;
        }
      }

      // i-matra is drawn to the left, so it is typed first. Rakar is part of
      // the cluster glyph, so it stays with the consonants. Matras and signs
      // come next, and the reph `{` is typed last — after the aakar — because
      // that is the order real Kantipur documents use (गर्दा is `ubf{`, and the
      // reverse converter walks back over the matras to place र्).
      output += (hasIkar ? 'l' : '') + cluster + rakar + matras + signs + reph;
      index = cursor;
      continue;
    }

    // --- Independent vowel ---------------------------------------------
    if (char in INDEPENDENT_VOWELS) {
      output += INDEPENDENT_VOWELS[char];
      index += 1;
      // A vowel can still take anusvara or chandrabindu.
      while (index < input.length && isSign(input[index])) {
        output += SIGNS[input[index]];
        index += 1;
      }
      continue;
    }

    // --- Ambiguous double quote ------------------------------------------
    // The straight `"` carries no direction of its own, so odd occurrences
    // open and even occurrences close.
    if (char === '"') {
      doubleQuoteCount += 1;
      output += doubleQuoteCount % 2 === 1 ? 'æ' : 'Æ';
      index += 1;
      continue;
    }

    // --- Ambiguous single quote ------------------------------------------
    // Same alternation as the double quote: odd occurrences open (…), even
    // occurrences close (Ú).
    if (char === "'") {
      singleQuoteCount += 1;
      output += singleQuoteCount % 2 === 1 ? '…' : 'Ú';
      index += 1;
      continue;
    }

    // --- Tabs -----------------------------------------------------------
    // Replace tabs with a single space if Unicode contains tabs.
    if (char === '\t') {
      output += ' ';
      index += 1;
      continue;
    }

    // --- Full stop / decimal point / dot --------------------------------
    // In Kantipur font, the dot glyph lives on the `=` key (the `.` key draws
    // the Devanagari danda `।`). Any dot in Unicode (e.g. १., २., decimals)
    // is replaced with `=`.
    if (char === '.') {
      output += '=';
      index += 1;
      continue;
    }

    // --- Standalone matras, signs, digits, punctuation ------------------
    const direct =
      MATRAS[char] ?? SIGNS[char] ?? DIGITS[char] ?? PUNCTUATION[char];
    if (direct !== undefined) {
      // The danda, exclamation and question glyphs touch the preceding
      // character in the font, so they always get a space of their own: गरे। is
      // `u/] .`, कस्तो! is `s:tf] †`, कस्तो? is `s:tf] <`.
      if (
        (direct.startsWith('.') || direct === '†' || direct === '<') &&
        output.length > 0 &&
        !/\s$/.test(output)
      ) {
        output += ' ';
      }
      output += direct;
      index += 1;
      continue;
    }

    if (char === VIRAMA) {
      output += '\\';
      index += 1;
      continue;
    }

    // Latin text, spaces and unmapped symbols pass through.
    output += char;
    index += 1;
  }

  return output;
}
