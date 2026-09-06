import { REPH } from './preeti-map.ts';

/**
 * Unicode → Preeti.
 *
 * Not a straight inversion of the Preeti table. Unicode stores text in logical
 * order (consonant, then matra) while Preeti stores it in visual order, so the
 * conversion works syllable by syllable:
 *
 *   1. Split the text into orthographic syllables (a consonant cluster plus
 *      its matras and signs).
 *   2. Pull र् out of cluster-initial position and re-emit it as reph `{`
 *      after the cluster.
 *   3. Emit a cluster-final र as the rakar stroke `|` (क्र is `s|`), and रु /
 *      रू as their dedicated ligature keys `?` / `¿`.
 *   4. Emit the i-matra `l` before the cluster instead of after it.
 *
 * Everything else maps character for character.
 */

/** Full consonant forms. */
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
  फ: 'ˆ',
  ब: 'A',
  भ: 'E',
  म: 'D',
  य: 'o\\',
  र: '/\\',
  ल: 'N',
  व: 'J',
  श: 'Z',
  ष: 'i',
  स: ':',
  ह: 'X',
};

/**
 * Conjuncts with a dedicated key, checked before their component parts.
 *
 * These win over the generic half-form and rakar rules: त्र, श्र, द्र, ध्र,
 * द्व, त्त and friends are single keys in the layout, so they must not be
 * spelled half-form + component. ब्र has no dedicated key — it is typed with
 * the rakar stroke (`a|`), like क्र and ग्र.
 */
const LIGATURES: Record<string, string> = {
  'क्ष': 'If',
  'क्ष्': 'I',
  'ज्ञ': '1',
  'ज्ञ्': '¡',
  'त्र': 'q',
  'त्त': 'Q',
  'श्र': '>',
  'द्य': 'B',
  'द्र': '›',
  'ध्र': '„',
  'द्द': '2',
  'द्ध': '4',
  'द्म': 'ß',
  'द्व': 'å',
  'द्घ': '¢',
  'ट्ट': '§',
  'ट्ठ': 'Ý',
  'ठ्ठ': '¶',
  'ड्ड': '•',
  'ङ्क': 'Í',
  'ङ्ख': 'Î',
  'ङ्ग': 'Ë',
  'ङ्घ': '‹',
  'ङ्ढ': '°',
  'न्न': 'Ì',
  'ॐ': 'ç',
};

/**
 * Sequences that are drawn as a single ligature glyph with a dedicated key.
 * Spelling them from their parts produces the wrong shape: रु is `?`, not `/`
 * plus the matra.
 */
const RA_LIGATURES: Record<string, string> = {
  'रु': '?',
  'रू': '¿',
  'हृ': 'Å',
  'र्\u200D': '¥',
};

/** Rakar: ्र drawn as a stroke under the cluster, typed after it. */
const RAKAR = '|';

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
  'ँ': 'F',
};

const DIGITS: Record<string, string> = {
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
  'ऽ': '˜',
  // The Preeti font draws the plain `-` byte as `(`, so a dash must be typed
  // as the en dash (Alt+0150) — the only dash glyph the layout has.
  '-': '–',
  '—': '–',
  // Quote glyphs live on Alt-code bytes too: the plain `'` and `"` bytes
  // render as the ु and ू matras in the font, so quotes must use Ú/æ/Æ/….
  // The straight `'` and `"` are handled separately in the loop — each
  // alternates between its opening and closing glyphs.
  '’': 'Ú',
  '“': 'æ',
  '”': 'Æ',
  '‘': '…',
  // The `!` and `×` keys draw the digit १ and the multiply sign in the font,
  // so the punctuation must be typed on their Alt-code bytes Û and ×.
  '!': 'Û',
  '×': '×',
  // The `?` key draws the रु ligature in the font, so a question mark is
  // typed as the two-byte sequence `:<` (colon for the स् stroke, then the
  // `?` glyph on the `<` key).
  '?': ':<',
};

const LIGATURE_KEYS = Object.keys(LIGATURES).sort((a, b) => b.length - a.length);
const RA_LIGATURE_KEYS = Object.keys(RA_LIGATURES);

const VIRAMA = '्';
const isConsonant = (char: string) => char !== undefined && char in CONSONANTS;
const isMatra = (char: string) => char !== undefined && char in MATRAS;
const isSign = (char: string) => char !== undefined && char in SIGNS;

export function unicodeToPreeti(input: string): string {
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
        reph = REPH;
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
        rakar = RAKAR;
        parts.pop();
        // The rakar glyph carries the virama, so what remains keeps its full
        // form: क्र is `s|`, not `S|`.
      }

      // Every part but the last is a half form.
      let cluster = parts
        .map((part, position) => {
          const isLast = position === parts.length - 1;
          if (isLast && !trailingVirama) {
            return LIGATURES[part] ?? CONSONANTS[part];
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
      // that is the order real Preeti documents use (गर्दा is `ubf{`, and the
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

    // --- Standalone matras, signs, digits, punctuation ------------------
    const direct =
      MATRAS[char] ?? SIGNS[char] ?? DIGITS[char] ?? PUNCTUATION[char];
    if (direct !== undefined) {
      // The danda glyph touches the preceding character in the font, so it
      // always gets a space of its own: गरे। is `u/] .`, not `u/].`.
      if (direct.startsWith('.') && output.length > 0 && !/\s$/.test(output)) {
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
