
* [ ] You are an expert full‑stack developer. Build a **client‑side web app** (HTML + CSS + vanilla JavaScript, no backend required) that provides three Nepali text conversion tools in one page:

1. **Unicode → Preeti**
2. **Preeti → Unicode**
3. **Roman Nepali → Unicode (phonetic typing)**

The app should be simple, fast, and work entirely in the browser.

---

## General Requirements

- Single HTML file (or minimal set of files) with:
  - Clean, responsive UI (mobile‑friendly).
  - Three tabs or sections:
    - “Unicode → Preeti”
    - “Preeti → Unicode”
    - “Roman → Nepali (Unicode)”
  - Each section has:
    - A large input `<textarea>`.
    - A large output `<textarea>` (read‑only or editable).
    - A “Convert” button (and optionally “Clear”, “Copy” buttons).
    - Real‑time conversion as the user types is a plus.
- All logic must be **pure JavaScript** running in the browser.
- No external API calls for conversion; everything must be local using the provided mapping tables.
- Use Unicode Devanagari for Nepali text internally.
- Provide clear labels and placeholder text so users know what to do in each section.

---

## Feature 1: Unicode → Preeti

### Behavior

- User pastes or types **Unicode Nepali** (Devanagari) in the input box.
- On button click (or on input change), convert to **Preeti font encoding**.
- Output should be the Preeti string that, when displayed with the Preeti font, looks identical to the input Unicode text.

### Mapping

Use the **Unicode → Preeti** mapping derived from the standard Preeti font encoding. This is an inversion of the Preeti→Unicode map from:

- Source: `preeti.json` (Preeti Encoding to Unicode Mapping)
  https://gist.github.com/9dd669190cd8379c4c2e09956e40316a

Implementation notes:

- Load the full mapping as a JavaScript object: `const unicodeToPreetiMap = { ... }`.
- For each character in the input:
  - If it exists in `unicodeToPreetiMap`, replace it with the mapped Preeti character/sequence.
  - If not found, keep it as‑is.
- You may optionally implement simple “post‑rules” (reordering, conjunct handling) if needed, but a direct character‑by‑character mapping using the provided table is acceptable for a first version.

Include the **full mapping table** directly in the code (do not fetch from the internet at runtime). Use the JSON structure from:

- `output/unicode_to_preeti_map.json` (132 entries) as your reference for the mapping object.

---

## Feature 2: Preeti → Unicode

### Behavior

- User pastes or types **Preeti‑encoded** text (as used in old Nepali documents) in the input box.
- On button click (or on input change), convert to **Unicode Devanagari**.
- Output should be readable Nepali in Unicode that works on modern systems.

### Mapping

Use the original **Preeti → Unicode** mapping from:

- `preeti.json` (Preeti Encoding to Unicode Mapping)
  https://gist.github.com/9dd669190cd8379c4c2e09956e40316a

Implementation notes:

- Load the mapping as a JavaScript object: `const preetiToUnicodeMap = { ... }` exactly as in that gist’s `"char-map"`.
- For each character (or small sequence) in the input:
  - If it exists in `preetiToUnicodeMap`, replace it with the mapped Unicode character.
  - If not found, keep it as‑is.
- As with Feature 1, you can start with a straightforward character‑by‑character mapping.

Again, embed the full mapping directly in the code; do not rely on external requests.

---

## Feature 3: Roman Nepali → Unicode (Phonetic Typing)

Implement this feature **strictly based on the behavior and examples described on**:

- https://neptools.com/roman-nepali-to-unicode

Do **not** invent additional Roman→Nepali rules beyond what that page explicitly describes. Use only the patterns, examples, and features mentioned there.

### Behavior (as described on the site)

- The tool “turns English letters into proper Nepali script instantly.”
- Example given:
  - Input: `"mero ghar"` → Output: `मेरो घर`
  - Input: `"namaste"` → Output: `नमस्ते`
- Conversion happens **as you hit space or enter** (real‑time conversion).
- It supports **unlimited text length**.
- It is **mobile‑friendly** and works in any browser without installs.
- Output is **Unicode Nepali**, ready to copy‑paste into WhatsApp, Word, websites, etc.

### Explicitly stated special mappings / patterns

From the page’s “Key Features” and other sections, implement at least these specific behaviors:

- **Conjuncts / tricky sounds** (explicit examples):
  - `"chha"` → `छ`
  - `"ksha"` → `क्ष`
  - `"gya"` → `ज्ञ`
- **Special symbols**:
  - `"rri"` → `ऋ`
  - `"rree"` → `ॠ`
  - `"*"` → `ं` (anusvara / अनुस्वार)
  - `"om"` → `ॐ`
- **Aspirated sounds**:
  - Use **double letters for aspirated sounds**, e.g. `"kha"` for `ख`. (The site says: “Use double letters for aspirated sounds, like 'kha' for ख.”)
- **Context‑aware phonetic matching**:
  - The site states: “We use advanced phonetic matching based on common Roman Nepali patterns.”
  - Example: `"haami"` always becomes `हामी`, not something random.
- The tool is designed for **common Roman Nepali patterns** and everyday text, with about **98% accuracy on everyday text** (per the site’s claim). You should aim to replicate that behavior using the patterns they describe, not by inventing new ones.

### Usage flow (as described)

The site’s step‑by‑step guide:

1. User types words using English letters, e.g. `"ma timilai maya garchhu"`.
2. User presses **spacebar after each word or phrase**.
3. Nepali appears in the output box.
4. User can edit, then “Select All” and “Copy”, and paste into apps.

Your implementation should match this flow:

- Input: Roman Nepali text typed with English letters.
- Trigger conversion on **space or Enter** (and optionally on each keystroke with a small debounce).
- Output: Unicode Devanagari Nepali.

### Implementation constraints for Roman→Unicode

- Do **not** add your own exhaustive vowel/consonant tables unless they are directly implied by the examples and descriptions on the site.
- Base your logic on:
  - The explicit examples:
    - `"mero ghar"` → `मेरो घर`
    - `"namaste"` → `नमस्ते`
    - `"ma timilai maya garchhu"` → (implied similar behavior)
  - The explicitly listed special cases: `"chha"`, `"ksha"`, `"gya"`, `"rri"`, `"rree"`, `"*"`, `"om"`, `"kha"` for `ख`.
  - The statement that it uses “advanced phonetic matching based on common Roman Nepali patterns” and achieves ~98% accuracy on everyday text.
- If you need a base mapping to make the examples work (e.g., to convert `"mero"` to `मेरो`), derive it **only as necessary to satisfy the examples and described behavior**, and keep it consistent with the idea of “common Roman Nepali patterns” as described on the site. Do not expand beyond that into a full custom scheme.

Embed any mapping or rules you implement directly in the JavaScript code; no external calls.

---

## UI / UX Details

- Title: something like **“Nepali Text Tools: Unicode ↔ Preeti & Roman → Nepali”**.
- Three clearly labeled sections or tabs.
- Each section:
  - Input textarea with placeholder:
    - “Enter Unicode Nepali text here…”
    - “Enter Preeti text here…”
    - “Type Roman Nepali here (e.g., ‘mero ghar’)…”
  - Output textarea (read‑only or editable).
  - Buttons: “Convert”, “Clear”, “Copy”.
- Add a small note under the Roman→Nepali section summarizing the site’s description:
  - Real‑time conversion on space/enter.
  - Handles `"chha"`, `"ksha"`, `"gya"`, `"rri"`, `"rree"`, `"*"`, `"om"`.
  - Uses phonetic matching for common Roman Nepali patterns.
  - Output is Unicode Nepali, copy‑paste ready.
- Mention that the Preeti output requires the **Preeti font installed** and selected in the target application to render correctly.

---

## Code Structure

- `index.html`:
  - HTML structure with three sections/tabs.
  - Inline or linked CSS for basic styling.
  - Inline or linked JS with:
    - `unicodeToPreetiMap`
    - `preetiToUnicodeMap`
    - Roman→Unicode logic based **only** on the patterns and examples from https://neptools.com/roman-nepali-to-unicode.
    - Conversion functions:
      - `unicodeToPreeti(text)`
      - `preetiToUnicode(text)`
      - `romanToUnicode(text)`
    - Event listeners for buttons and (optionally) real‑time conversion on input.

Keep the code clean, commented, and easy to extend.

---

## Deliverable

Produce:

1. A complete `index.html` file (with embedded CSS and JS) that implements all three tools as described.
2. Ensure the mapping tables (`unicodeToPreetiMap`, `preetiToUnicodeMap`) are fully included in the code, based on:
   - Preeti↔Unicode: https://gist.github.com/9dd669190cd8379c4c2e09956e40316a
3. Implement Roman→Unicode **only using the behavior, examples, and explicit patterns described on**:
   - https://neptools.com/roman-nepali-to-unicode

No external dependencies or network calls are required for conversion.
