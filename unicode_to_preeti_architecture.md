# Unicode to Preeti Converter: Architectural Blueprint

## Overview
This document outlines the architecture and implementation strategy for building a Nepali Unicode to Preeti font converter, cloning the core functionality of tools like the one hosted at `unicode.shresthasushil.com.np`.

**Goal:** Create a client-side JavaScript engine that converts logical Devanagari Unicode strings into visual ASCII strings mapped to the Preeti font layout.

## 1. Core Conversion Logic (The Engine)

The conversion process relies entirely on client-side JavaScript. Because Unicode is encoded logically (how it sounds) and Preeti is encoded visually (how it is drawn), the engine must manipulate string structure, not just swap individual characters.

The conversion must execute in a strict, non-negotiable sequence.

### Phase 1: Complex Conjuncts First
Unicode combines characters using the Halant (्). These multi-character combinations must be replaced *before* processing individual characters.

*   `क्ष` (क + ् + ष) → `If`
*   `त्र` (त + ् + र) → `q`
*   `ज्ञ` (ज + ् + ञ) → `¡`
*   `श्र` (श + ् + र) → `>`

### Phase 2: The "Chhoti Ee" (ि) Matra Reordering
In Unicode, `ि` is typed and stored *after* the consonant: `क + ि` = `कि`.
In Preeti, the ASCII character for `ि` is `l`, and it must be placed *before* the consonant: `ls`.

**Logic:** Utilize Regular Expressions to capture any consonant (or consonant cluster) immediately followed by `ि`, and swap their positions so the `ि` mapping appears first.
*Requirement:* The Regex must account for half-consonants attached to the main consonant (e.g., `क्वि`) to ensure `ि` is not misplaced mid-word.

### Phase 3: The Reph (र्) Positioning
In Unicode, Reph (upper R) is typed *before* the consonant it sits on: `र + ् + म = र्म`.
In Preeti, the Reph is drawn using `{` and must be placed *after* the entire consonant cluster and its matras.

**Logic:** Utilize Regular Expressions to capture `र्` and move it to the end of the subsequent consonant block.

### Phase 4: 1:1 Character Substitution
Standard array mapping for vowels, consonants, and post-consonant matras (e.g., `ा`, `ी`, `ु`, `ू`). This must only occur after Phases 1-3 are complete.

*   `अ` → `c`
*   `आ` → `cf`
*   `क` → `s`
*   `ख` → `v`

## 2. Implementation Blueprint (Code Structure)

### Data Structures (JS)
Map exact multi-character strings first, followed by standard characters.

```javascript
// Map exact multi-character strings first
const conjunctMap = {
    "क्ष": "If",
    "त्र": "q",
    "ज्ञ": "¡",
    "श्र": ">"
};

// Map standard characters
const charMap = {
    "अ": "c", "आ": "cf", "इ": "O", "ई": "O{",
    "क": "s", "ख": "v", "ग": "u", "घ": "3"
    // ... complete mapping required here
};
```

### The Conversion Function
The main JavaScript function orchestrates the sequenced replacement.

```javascript
function convertUnicodeToPreeti(unicodeStr) {
    let preetiStr = unicodeStr;

    // Step 1: Replace multi-character conjuncts
    for (let key in conjunctMap) {
        preetiStr = preetiStr.split(key).join(conjunctMap[key]);
    }

    // Step 2: Handle Reph (र्)
    // Regex required to find 'र्' and move it AFTER the next consonant block.
    preetiStr = applyRephRules(preetiStr);

    // Step 3: Handle Chhoti Ee (ि)
    // Regex required to find consonant clusters followed by 'ि' and move 'ि' BEFORE them.
    preetiStr = applyChhotiEeRules(preetiStr);

    // Step 4: Standard Character substitution
    let finalOutput = "";
    for (let i = 0; i < preetiStr.length; i++) {
        let char = preetiStr[i];
        finalOutput += charMap[char] || char; // Fallback to original if not found
    }

    return finalOutput;
}
```

### User Interface (HTML/DOM)
1.  **Input:** `<textarea id="unicodeInput">` for the source Unicode text.
2.  **Output:** `<textarea id="preetiOutput" readonly>` for the converted text.
    *   *Critical CSS:* Apply `font-family: 'Preeti', sans-serif;` to this element. Ensure the Preeti font file (`.ttf` or `.woff`) is hosted locally and loaded via `@font-face` so the ASCII output renders correctly as Nepali glyphs on all devices.
3.  **Event Listeners:** Bind an `input` or `keyup` event to the source textarea to trigger conversion on every keystroke.

## 3. Edge Cases & Validation Requirements

To ensure a robust clone, the conversion engine must handle the following edge cases:

*   **Mixed Languages:** If the input contains non-Devanagari text (e.g., "Hello नमस्ते"), the engine must ignore the English characters and only process the Devanagari Unicode range (`U+0900` to `U+097F`).
*   **Zero-Width Joiners (ZWJ):** Modern text often uses ZWJ (e.g., `U+200D`) and ZWNJ formatting characters. The engine must strip or explicitly handle these, otherwise the string manipulation loops will break.
*   **Punctuation Mapping:** Standardize Devanagari punctuation. For example, the Purna Viram `।` must map to `.` in Preeti.
