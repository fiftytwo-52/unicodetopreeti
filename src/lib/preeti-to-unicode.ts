import {
  PREETI_TO_UNICODE,
  PREETI_SEQUENCES,
  REPH,
  CONSONANT_RE,
} from './preeti-map.ts';

// Longest-first so `cf]` wins over `cf`, and `..` over `.`.
const SEQUENCE_KEYS = Object.keys(PREETI_SEQUENCES).sort(
  (a, b) => b.length - a.length,
);

interface Token {
  /** Unicode text this token produced. */
  text: string;
  /** True when the token is a consonant that can host a matra or reph. */
  isConsonant: boolean;
}

/** Read one token at `index`, preferring the longest known sequence. */
function readToken(source: string, index: number): { token: Token; length: number } | null {
  const sequence = SEQUENCE_KEYS.find((key) => source.startsWith(key, index));
  if (sequence) {
    const text = PREETI_SEQUENCES[sequence];
    return {
      token: { text, isConsonant: CONSONANT_RE.test(text.at(-1) ?? '') },
      length: sequence.length,
    };
  }

  const single = PREETI_TO_UNICODE[source[index]];
  if (single !== undefined) {
    // A half form ends in virama; it still hosts a following matra via its
    // conjunct partner, but on its own it is not a matra target.
    const isConsonant = CONSONANT_RE.test(single.at(-1) ?? '');
    return { token: { text: single, isConsonant }, length: 1 };
  }

  return null;
}

/**
 * Convert Preeti-encoded text to Unicode Devanagari.
 *
 * Handles the two visual-order quirks of the layout: the i-matra `l` is typed
 * before its consonant cluster, and reph `{` is typed after the consonant it
 * sits above.
 */
export function preetiToUnicode(input: string): string {
  let output = '';
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    // i-matra: `l` precedes its cluster. Consume the whole cluster (including
    // any conjunct half forms) and place ि after it.
    if (char === 'l') {
      let cursor = index + 1;
      let cluster = '';
      let sawConsonant = false;

      while (cursor < input.length) {
        const read = readToken(input, cursor);
        if (!read) break;
        cluster += read.token.text;
        cursor += read.length;
        // Half forms without a dedicated key are typed as full form plus an
        // explicit virama (`b\` is द्), so a `\` byte continues the cluster.
        let endsInVirama = read.token.text.endsWith('्');
        while (input[cursor] === '\\') {
          cluster += '्';
          cursor += 1;
          endsInVirama = true;
        }
        if (endsInVirama) continue;
        if (read.token.isConsonant) sawConsonant = true;
        // The rakar stroke belongs to the cluster: `ls|` is क्रि, so the ि
        // goes after the whole cluster, not after its first consonant.
        if (PREETI_TO_UNICODE[input[cursor]] === '्र') {
          cluster += '्र';
          cursor += 1;
        }
        break;
      }

      if (sawConsonant) {
        output += cluster + 'ि';
        index = cursor;
        continue;
      }
      // Not followed by a consonant, so treat `l` as a bare matra.
      output += 'ि';
      index += 1;
      continue;
    }

    // Reph: `{` follows the consonant it rides, so र् moves before the cluster.
    if (char === REPH) {
      // Walk back over matras to find the start of the syllable.
      let start = output.length;
      while (start > 0 && !CONSONANT_RE.test(output[start - 1])) start -= 1;
      if (start > 0) start -= 1;
      // Include a preceding half form so क्क{ becomes र्क्क.
      while (start > 0 && output[start - 1] === '्') {
        start -= 2;
        if (start < 0) start = 0;
      }
      output = output.slice(0, start) + 'र्' + output.slice(start);
      index += 1;
      continue;
    }

    const read = readToken(input, index);
    if (read) {
      // A danda, exclamation or question attaches to the preceding word in
      // Unicode. Preeti documents type a space before them for the font's sake
      // (`u/] .`, `s:tf] Û`, `s:tf] <`), so drop that space here — every other
      // space in the text is kept.
      if (
        (read.token.text === '।' || read.token.text === '॥' || read.token.text === '!' || read.token.text === '?') &&
        /\s$/.test(output)
      ) {
        output = output.replace(/\s+$/, '');
      }
      output += read.token.text;
      index += read.length;
      continue;
    }

    // Unknown byte (Latin letters, spaces, symbols) passes through untouched.
    output += char;
    index += 1;
  }

  return output;
}
