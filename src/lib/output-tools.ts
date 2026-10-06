/**
 * One-click cleanup tools for the Preeti output pane.
 *
 * Pure functions over the output text, so they run both in the browser and
 * in the node test script. They operate on Preeti-encoded text, where:
 *
 * - `.` / `..` is the danda (। / ॥), `<` is `?`, `Û` is `!`
 * - `)!@#$%^&*(` are the digits ०–९
 * - `×` is the multiply sign, `Ö` is `=`, `–` is the dash/minus
 * - `=` is the dot glyph (from Unicode `.` or `_`)
 */

export type ToolName =
  | 'remove-tabs'
  | 'space-punctuation'
  | 'space-numbers'
  | 'space-math'
  | 'single-spaces';

/** Preeti bytes that draw the digits ०–९. */
const PREETI_DIGIT = '[)!@#$%^&*(]';

/**
 * Tabs become a single space, matching how the converter already normalises
 * tabs typed or pasted into the Unicode input.
 */
function removeTabs(text: string): string {
  return text.replace(/\t/g, ' ');
}

/**
 * The danda, question mark and exclamation glyphs touch the preceding
 * character in the Preeti font, so each gets a space of its own. Any run of
 * whitespace before them collapses to exactly one space.
 */
function spacePunctuation(text: string): string {
  return text.replace(/(\S)\s*(\.\.?|Û|<)/g, '$1 $2');
}

/**
 * A number followed directly by a letter gets a space (५वटा → ५ वटा), but
 * not when a symbol follows: 5. and 5) stay tight.
 */
function spaceNumbers(text: string): string {
  return text.replace(
    new RegExp(`(${PREETI_DIGIT})(?=[A-Za-z])`, 'g'),
    '$1 ',
  );
}

/**
 * Question-paper style math: 5×1=5 becomes 5 × 1 = 5. Only the unambiguous
 * operator bytes are spaced (×, Ö for =, – for minus). The `=` byte is the
 * dot glyph, so it is deliberately left alone.
 */
function spaceMath(text: string): string {
  return text.replace(
    new RegExp(`(${PREETI_DIGIT})\\s*([×Ö–])\\s*(?=${PREETI_DIGIT})`, 'g'),
    '$1 $2 ',
  );
}

/** Collapse runs of spaces/tabs to a single space; line breaks are kept. */
function singleSpaces(text: string): string {
  return text.replace(/[^\S\n]{2,}/g, ' ');
}

/**
 * The reverse of spacePunctuation: attach the danda, ? and ! directly to
 * the preceding word by removing the space before them. Used when the
 * "Space before । ?" mode is switched off.
 */
export function removeSpacePunctuation(text: string): string {
  return text.replace(/[ \t]+(\.\.?|Û|<)/g, '$1');
}

const TOOLS: Record<ToolName, (text: string) => string> = {
  'remove-tabs': removeTabs,
  'space-punctuation': spacePunctuation,
  'space-numbers': spaceNumbers,
  'space-math': spaceMath,
  'single-spaces': singleSpaces,
};

export function isToolName(value: string | undefined): value is ToolName {
  return value !== undefined && value in TOOLS;
}

/**
 * Applies a cleanup tool to the output text. Returns null for unknown tools.
 * Known tool names always produce a string.
 */
export function applyTool(name: ToolName, text: string): string;
export function applyTool(
  name: string | undefined,
  text: string,
): string | null;
export function applyTool(
  name: string | undefined,
  text: string,
): string | null {
  if (!isToolName(name)) return null;
  return TOOLS[name](text);
}
