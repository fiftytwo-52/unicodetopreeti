/**
 * Roman Nepali → Unicode Devanagari (phonetic typing).
 *
 * People write Nepali in Latin letters inconsistently: "chhu", "chu" and "cchu"
 * all mean छु. The engine reads each word left to right, always preferring the
 * longest matching token, and builds syllables the way Devanagari works — a
 * consonant carries an inherent अ unless a vowel sign replaces it, and two
 * adjacent consonants are joined with a virama.
 *
 * Whole-word overrides come first, because common words have spellings that
 * letter-by-letter rules would get wrong.
 */

/** Words whose conventional spelling defeats letter-by-letter rules. */
const WORD_OVERRIDES: Record<string, string> = {
  namaste: 'नमस्ते',
  namaskar: 'नमस्कार',
  nepal: 'नेपाल',
  nepali: 'नेपाली',
  kathmandu: 'काठमाडौं',
  ma: 'म',
  timi: 'तिमी',
  timilai: 'तिमीलाई',
  timro: 'तिम्रो',
  mero: 'मेरो',
  hamro: 'हाम्रो',
  haami: 'हामी',
  hami: 'हामी',
  ghar: 'घर',
  maya: 'माया',
  garchhu: 'गर्छु',
  chha: 'छ',
  chhu: 'छु',
  ho: 'हो',
  hoina: 'होइन',
  ani: 'अनि',
  ra: 'र',
  tapai: 'तपाईं',
  tapaai: 'तपाईं',
  dhanyabad: 'धन्यवाद',
  swagat: 'स्वागत',
  kasto: 'कस्तो',
  sanchai: 'सञ्चै',
  nyano: 'न्यानो',
  khana: 'खाना',
  pani: 'पानी',
  om: 'ॐ',
  aum: 'ॐ',
};

/**
 * Consonants. Aspirated forms are spelled with a following `h`, so they must be
 * matched before their unaspirated base — otherwise "kha" reads as क + हा.
 * Retroflex consonants use capitals, the convention in every Nepali phonetic
 * keyboard.
 */
const CONSONANTS: Record<string, string> = {
  // Velars
  kh: 'ख',
  k: 'क',
  gh: 'घ',
  g: 'ग',
  ng: 'ङ',

  // Palatals
  chh: 'छ',
  ch: 'च',
  c: 'च',
  jh: 'झ',
  j: 'ज',
  ny: 'ञ',

  // Retroflex (capitals)
  Th: 'ठ',
  T: 'ट',
  Dh: 'ढ',
  D: 'ड',
  N: 'ण',
  Sh: 'ष',
  S: 'ष',

  // Dentals
  th: 'थ',
  t: 'त',
  dh: 'ध',
  d: 'द',
  n: 'न',

  // Labials
  ph: 'फ',
  f: 'फ',
  p: 'प',
  bh: 'भ',
  b: 'ब',
  m: 'म',

  // Semivowels, sibilants, aspirate
  y: 'य',
  r: 'र',
  l: 'ल',
  w: 'व',
  v: 'व',
  sh: 'श',
  s: 'स',
  h: 'ह',

  // Conjuncts with conventional spellings
  ksha: 'क्ष',
  ksh: 'क्ष',
  gya: 'ज्ञ',
  gy: 'ज्ञ',
  tra: 'त्र',
  tr: 'त्र',
  shra: 'श्र',
};

/** Vowels as [independent form, matra]. Long forms precede short ones. */
const VOWELS: Record<string, [string, string]> = {
  aa: ['आ', 'ा'],
  a: ['अ', ''],
  ee: ['ई', 'ी'],
  ii: ['ई', 'ी'],
  i: ['इ', 'ि'],
  oo: ['ऊ', 'ू'],
  uu: ['ऊ', 'ू'],
  u: ['उ', 'ु'],
  rree: ['ॠ', 'ॄ'],
  rri: ['ऋ', 'ृ'],
  ai: ['ऐ', 'ै'],
  au: ['औ', 'ौ'],
  e: ['ए', 'े'],
  o: ['ओ', 'ो'],
};

const DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

// Longest-first ordering, computed once.
const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

/**
 * Match a token case-sensitively when it contains a capital (retroflex
 * consonants rely on case) and case-insensitively otherwise, so ordinary
 * sentence capitalisation still converts.
 */
function matches(source: string, index: number, token: string): boolean {
  const slice = source.slice(index, index + token.length);
  if (/[A-Z]/.test(token)) return slice === token;
  return slice.toLowerCase() === token.toLowerCase();
}

/** Convert a single word. */
export function romanWordToUnicode(word: string): string {
  if (!word) return '';

  const override = WORD_OVERRIDES[word.toLowerCase()];
  if (override) return override;

  let output = '';
  let index = 0;
  // True when the previous token was a consonant still carrying its inherent
  // अ — the next vowel becomes a matra, the next consonant needs a virama.
  let pendingConsonant = false;

  while (index < word.length) {
    const char = word[index];

    // Chandrabindu: attaches to the vowel just written.
    if (char === '~') {
      output += 'ँ';
      index += 1;
      continue;
    }

    // Anusvara.
    if (char === '*' || char === 'M') {
      output += 'ं';
      index += 1;
      pendingConsonant = false;
      continue;
    }

    // Explicit virama, for forcing a half form.
    if (char === '_' || char === '\\') {
      output += '्';
      index += 1;
      pendingConsonant = false;
      continue;
    }

    // Visarga.
    if (char === ':') {
      output += 'ः';
      index += 1;
      pendingConsonant = false;
      continue;
    }

    // Danda and double danda.
    if (char === '|') {
      const double = word[index + 1] === '|';
      output += double ? '॥' : '।';
      index += double ? 2 : 1;
      pendingConsonant = false;
      continue;
    }

    if (DIGITS[char]) {
      output += DIGITS[char];
      index += 1;
      pendingConsonant = false;
      continue;
    }

    // Vowels are checked before consonants so "ai" is not read as अ + इ.
    const vowel = VOWEL_KEYS.find((key) => matches(word, index, key));
    if (vowel) {
      const [independent, matra] = VOWELS[vowel];
      output += pendingConsonant ? matra : independent;
      index += vowel.length;
      pendingConsonant = false;
      continue;
    }

    const consonant = CONSONANT_KEYS.find((key) => matches(word, index, key));
    if (consonant) {
      // Two consonants in a row form a conjunct.
      if (pendingConsonant) output += '्';
      output += CONSONANTS[consonant];
      index += consonant.length;
      // Multi-letter tokens ending in `a` already include their vowel.
      pendingConsonant = !consonant.endsWith('a');
      continue;
    }

    output += char;
    index += 1;
    pendingConsonant = false;
  }

  return output;
}

/**
 * Convert Roman Nepali text, preserving whitespace and line breaks so the
 * output lines up with what the user typed.
 */
export function romanToUnicode(input: string): string {
  return input
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : romanWordToUnicode(part)))
    .join('');
}
