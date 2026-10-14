/**
 * Kantipur → Unicode character map.
 *
 * Kantipur is a legacy 8-bit Nepali font like Preeti, with almost the same
 * typing layout — but "almost" is not "identical". This table is the Preeti
 * table with the Kantipur differences applied, so the two fonts are never
 * conflated:
 *
 *   - Overrides (same byte, different letter): F, X, ‹, ›, Î, °, Æ, Ú, æ, …
 *   - Removed (Preeti-only bytes, unmapped in Kantipur): Å, Ö, Ù, Û, Ü, Ý, ˆ
 *   - Added (Kantipur-only bytes): ¨, ¬, soft hyphen, ®, ¯, µ, º, Â, È, Ï,
 *     Ô, ø, Œ, œ, “, †, ™, Ø
 *   - Everything else is byte-for-byte identical to Preeti.
 *
 * Sources: the Kantipur-vs-Preeti char-map diff in nep-ttf2utf
 * (github.com/imxitiz/nep-ttf2utf, Apache-2.0, rules/kantipur.yaml vs
 * rules/preeti.yaml), cross-checked against the codepoint coverage of
 * kantipur.ttf vs preeti.ttf. The multi-character sequences below are the
 * Preeti sequences unchanged: the shared nep-ttf2utf post-rules
 * (rules/defaults.yaml) apply the same i-matra, reph and `m`-overlay
 * behaviour to both fonts, and the Kantipur keyboard layout types the same
 * sequences (cf, O{, pm, km, em, qm, Qm, 6[, f], f}, ..).
 *
 * Deliberately NOT copied from this site's Preeti map: the Preeti-side
 * normalisations (straight quotes for Æ/Ú/æ/…, degree sign for °) are
 * Preeti-specific decisions and do not apply to Kantipur.
 *
 * This file is ADDITIVE: the Preeti converter logic is untouched.
 */
export const KANTIPUR_TO_UNICODE: Record<string, string> = {
  "0": "ण्",
  "2": "द्द",
  "3": "घ",
  "4": "द्ध",
  "5": "छ",
  "6": "ट",
  "7": "ठ",
  "8": "ड",
  "9": "ढ",
  "c": "अ",
  "O": "इ",
  "p": "उ",
  "C": "ऋ",
  "P": "ए",
  "s": "क",
  "v": "ख",
  "u": "ग",
  "ª": "ङ",
  "r": "च",
  "h": "ज",
  "´": "झ",
  "`": "ञ",
  "©": "र",
  "b": "द",
  "w": "ध",
  "g": "न",
  "t": "त",
  "y": "थ",
  "k": "प",
  "m": "फ",
  "a": "ब",
  "e": "भ",
  "d": "म",
  "o": "य",
  "/": "र",
  "n": "ल",
  "j": "व",
  "z": "श",
  ";": "स",
  "x": "ह",
  "q": "त्र",
  "S": "क्",
  "V": "ख्",
  "U": "ग्",
  "R": "च्",
  "H": "ज्",
  "T": "त्",
  "Y": "थ्",
  "W": "ध्",
  "G": "न्",
  "K": "प्",
  "A": "ब्",
  "E": "भ्",
  "D": "म्",
  "J": "व्",
  "Z": "श्",
  "X": "हृ",  // Kantipur X = hrr ligature; Preeti X = half ha.
  "N": "ल्",
  ":": "स्",
  "I": "क्ष्",
  "i": "ष्",
  "‰": "झ्",
  "¤": "झ्",
  "£": "घ्",
  "¡": "ज्ञ्",
  "~": "ञ्",
  ">": "श्र",
  "B": "द्य",
  "›": "ऽ",  // Kantipur › = avagraha; Preeti › = द्र.
  "„": "ध्र",
  "Ì": "न्न",
  "ç": "ॐ",
  "Q": "त्त",
  "ß": "द्म",
  "å": "द्व",
  "¢": "द्घ",
  "§": "ट्ट",
  "¶": "ठ्ठ",
  "•": "ड्ड",
  "Í": "ङ्क",
  "Î": "फ्",  // Kantipur Î = half pha; Preeti Î = ङ्ख.
  "Ë": "ङ्ग",
  "‹": "ङ्ग",  // Kantipur ‹ = ङ्ग; Preeti ‹ = ङ्घ. Kantipur has no dedicated ङ्घ byte.
  "°": "ङ्ढ",  // Kantipur ° = ङ्ढ per the Kantipur table. NOTE: this site maps the PREETI ° byte to a degree sign by a deliberate, tested Preeti-side decision; that Preeti decision is NOT carried over to Kantipur.
  "f": "ा",
  "l": "ि",
  "L": "ी",
  "'": "ु",
  "\"": "ू",
  "[": "ृ",
  "]": "े",
  "}": "ै",
  "+": "ं",
  "M": "ः",
  "F": "ा",  // Kantipur F = aa-matra; Preeti F = chandrabindu. Kantipur has two bytes for aa-matra (f and F).
  "\\": "्",
  "‛": "ॉ",
  "‘": "ॅ",
  "|": "्र",
  "«": "्र",
  "?": "रु",
  "¿": "रू",
  "¥": "र्‍",
  "˜": "ऽ",
  ")": "०",
  "!": "१",
  "@": "२",
  "#": "३",
  "$": "४",
  "%": "५",
  "^": "६",
  "&": "७",
  "*": "८",
  "(": "९",
  ".": "।",
  "–": "-",
  "—": "—",
  "Ú": "’",  // Kantipur Ú = right single quote (U+2019). Preeti normalises to a straight quote; not carried over.
  "æ": "“",  // Kantipur æ = left double quote (U+201C). Preeti normalises to a straight quote; not carried over.
  "Æ": "”",  // Kantipur Æ = right double quote (U+201D). Preeti maps it to a straight quote by a Preeti-side normalisation not carried over here, so the chain keeps quote direction.
  "…": "‘",  // Kantipur … = left single quote (U+2018). Preeti normalises to a straight quote; not carried over.
  "÷": "/",
  "×": "×",
  "Ò": "¨",
  "±": "+",
  "<": "?",
  "_": ")",
  "=": ".",
  "-": "(",
  "¨": "ङ्ग",  // Kantipur-only byte; Preeti has no ¨ glyph.
  "¬": "…",  // Kantipur-only byte. NOTE: Preeti has no ellipsis glyph, so the Kantipur→Preeti chain passes an ellipsis through unchanged rather than rendering it as an ellipsis.
  "\u00AD": "(",  // Soft hyphen (U+00AD) — invisible, so written as an escape. Draws ( in Kantipur; unmapped in Preeti.
  "®": "र",  // Kantipur-only byte; Preeti has no ® glyph.
  "¯": "¯",  // Kantipur-only byte; identity (draws a macron).
  "µ": "र",  // Kantipur-only byte; Preeti has no µ glyph.
  "º": "फ्",  // Kantipur-only byte; one of three Kantipur half-pha bytes (Î, º, Ï).
  "Â": "र",  // Kantipur-only byte; Preeti has no Â glyph.
  "È": "ष",  // Kantipur-only byte; Preeti has no È glyph.
  "Ï": "फ्",  // Kantipur-only byte; one of three Kantipur half-pha bytes (Î, º, Ï).
  "Ô": "क्ष",  // Kantipur-only byte; Preeti has no Ô glyph.
  "ø": "य्",  // Kantipur-only byte; Preeti has no ø glyph.
  "Œ": "त्त्",  // Kantipur-only byte; Preeti has no Œ glyph.
  "œ": "त्र्",  // Kantipur-only byte; Preeti has no œ glyph.
  "“": "ँ",  // Kantipur-only byte; Kantipur chandrabindu (Preeti chandrabindu is F).
  "†": "!",  // Kantipur-only byte; Kantipur exclamation (Preeti exclamation is Û).
  "™": "र",  // Kantipur-only byte; Preeti has no ™ glyph.
  "Ø": "्य",  // In both YAML tables; absent from this site's Preeti map. Half ya.
};

/**
 * Multi-character sequences, identical to the Preeti sequences: the typing
 * layout is shared between the two fonts (see the header above).
 */
export const KANTIPUR_SEQUENCES: Record<string, string> = {
  "1": "ज्ञ",
  "cf": "आ",
  "O{": "ई",
  "pm": "ऊ",
  "C[": "ॠ",
  "P]": "ऐ",
  "cf]": "ओ",
  "cf}": "औ",
  "cf+": "आं",
  "0f": "ण",
  "km": "फ",
  "em": "झ",
  "If": "क्ष",
  "if": "ष",
  "Zf": "श",
  "qm": "क्र",
  "Qm": "क्त",
  "6[": "ट्ट",
  "f]": "ो",
  "f}": "ौ",
  "..": "॥",
};

/** Reph — र् preceding another consonant. Typed after the consonant it rides. */
export const KANTIPUR_REPH = '{';

/** Devanagari consonants, for finding matra/reph targets. Same set as Preeti. */
export const KANTIPUR_CONSONANT_RE = /[क-हक़-य़]/u;
