/**
 * Converter tests. Run with:  node --experimental-strip-types scripts/test-converters.ts
 *
 * No test framework, so this runs with a bare Node install and does not depend
 * on the npm registry being reachable.
 */
import assert from 'node:assert/strict';
import { preetiToUnicode } from '../src/lib/preeti-to-unicode.ts';
import { unicodeToPreeti } from '../src/lib/unicode-to-preeti.ts';
import { romanToUnicode } from '../src/lib/roman-to-unicode.ts';

let passed = 0;
let failed = 0;

/**
 * Mirrors the theme logic in SiteHeader.astro.
 * @param stored  — the value of localStorage.theme (null if none)
 * @param prefersDark — whether the OS prefers dark mode
 */
function getTheme(stored: string | null, prefersDark: boolean): 'light' | 'dark' {
  return (stored ?? (prefersDark ? 'dark' : 'light')) as 'light' | 'dark';
}

function check(label: string, actual: unknown, expected: unknown) {
  try {
    assert.equal(actual, expected);
    passed += 1;
  } catch {
    failed += 1;
    console.log(`FAIL  ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      actual:   ${JSON.stringify(actual)}`);
  }
}

console.log('\n— Preeti → Unicode —');
check('bare consonant', preetiToUnicode('s'), 'क');
check('aa matra', preetiToUnicode('sf'), 'का');
check('i-matra reorders', preetiToUnicode('ls'), 'कि');
check('ii matra', preetiToUnicode('sL'), 'की');
check('composite o matra', preetiToUnicode('sf]'), 'को');
check('independent aa', preetiToUnicode('cf'), 'आ');
check('independent o', preetiToUnicode('cf]'), 'ओ');
check('namaste', preetiToUnicode('gd:t]'), 'नमस्ते');
check('nepal', preetiToUnicode('g]kfn'), 'नेपाल');
check('composite na', preetiToUnicode('0f'), 'ण');
check('composite pha', preetiToUnicode('km'), 'फ');
check('ksha', preetiToUnicode('If'), 'क्ष');
check('conjunct kka', preetiToUnicode('Ss'), 'क्क');
check('danda', preetiToUnicode('.'), '।');
check('double danda', preetiToUnicode('..'), '॥');
check('digits', preetiToUnicode('!@#'), '१२३');
// Reph is typed after the syllable it sits above, so `{` trails the cluster.
check('reph karma', preetiToUnicode('sd{'), 'कर्म');
check('reph varsha', preetiToUnicode('jif{'), 'वर्ष');
// Rakar `|` is the ्र stroke drawn under the preceding consonant.
check('rakar pra', preetiToUnicode('k|'), 'प्र');
check('rakar kra', preetiToUnicode('s|'), 'क्र');
check('rakar with i-matra', preetiToUnicode('ls|'), 'क्रि');
// रु / रू have dedicated ligature keys.
check('ra-u ligature', preetiToUnicode('?'), 'रु');
check('ra-uu ligature', preetiToUnicode('¿'), 'रू');
check('reph with rakar', preetiToUnicode('u|{'), 'र्ग्र');
// Dedicated conjunct keys from the legacy layout.
check('dental conjuncts', preetiToUnicode('2§Ý¶•'), 'द्दट्टट्ठठ्ठड्ड');
check('nasal conjuncts', preetiToUnicode('ÍÎË‹°'), 'ङ्कङ्खङ्गङ्घ°');
check('dwa family', preetiToUnicode('åß¢'), 'द्वद्मद्घ');
check('tta conjunct', preetiToUnicode('Q'), 'त्त');
check('half forms on dedicated keys', preetiToUnicode('AQ'), 'ब्त्त');
check('la and nna half', preetiToUnicode('N0'), 'ल्ण्');
check('new half forms', preetiToUnicode('~£‰ˆ'), 'ञ्घ्झ्फ्');
check('full jha key', preetiToUnicode('´'), 'झ');
check('jna half key', preetiToUnicode('¡'), 'ज्ञ्');
check('avagraha', preetiToUnicode('˜'), 'ऽ');
check('hrr ligature', preetiToUnicode('Å'), 'हृ');
check('eyelash ra', preetiToUnicode('¥'), 'र्‍');
check('kra overlay', preetiToUnicode('qm'), 'क्र');
check('kta overlay', preetiToUnicode('Qm'), 'क्त');
check('tta font trick', preetiToUnicode('6['), 'ट्ट');
check('explicit virama', preetiToUnicode('a\\b'), 'ब्द');
// Half forms composed from full form + `\` must not break the i-matra.
check('i-matra over explicit virama', preetiToUnicode('lb\\w'), 'द्धि');
check('i-matra over dedicated half', preetiToUnicode('lNk'), 'ल्पि');
check('i-matra over conjunct key', preetiToUnicode('l4'), 'द्धि');
// Alt-code dash bytes in legacy documents.
check('en dash byte', preetiToUnicode('–'), '-');
check('em dash byte', preetiToUnicode('—'), '—');
// Reph comes after the aakar in real Preeti documents.
check('reph after aakar', preetiToUnicode('ubf{'), 'गर्दा');
check('reph after ii matra', preetiToUnicode('stL{'), 'कर्ती');
// ! and × live on the Û and × bytes in the font.
check('exclamation byte', preetiToUnicode('Û'), '!');
check('multiply byte', preetiToUnicode('×'), '×');
// The question mark is the two-byte `:<` in the font.
check('question mark byte', preetiToUnicode('<'), '?');
check('ru byte still ru', preetiToUnicode('?'), 'रु');
// Decimal points live on the `=` byte; brackets/colon/etc. on their pairs.
check('decimal dot byte', preetiToUnicode('='), '.');
check('colon byte', preetiToUnicode('M'), 'ः');
check('closing bracket byte', preetiToUnicode('_'), ')');
check('semicolon byte', preetiToUnicode('Ù'), ';');
check('degree byte', preetiToUnicode('°'), '°');
check('percent byte', preetiToUnicode('Ü'), '%');
// Quote glyph bytes: Ú renders the apostrophe, æ the double quote.
check('single quote byte', preetiToUnicode('Ú'), "'");
check('double quote byte', preetiToUnicode('æ'), '"');
check('closing quote byte', preetiToUnicode('Æ'), '"');
check('opening single quote byte', preetiToUnicode('…'), "'");
check('right single quote byte', preetiToUnicode('Ú'), "'");
// A danda attaches to the word in Unicode; the font-space before it goes.
check('danda space stripped', preetiToUnicode('u/] .'), 'गरे।');
check('double danda space stripped', preetiToUnicode('g]kfn ..'), 'नेपाल॥');
check('inner spaces kept', preetiToUnicode('g n .'), 'न ल।');
check('exclamation space stripped', preetiToUnicode('s:tf] Û'), 'कस्तो!');
// Unmapped characters survive; Latin letters are themselves Preeti codepoints,
// so they legitimately convert rather than passing through. (`~` used to be
// the sample here, but it is the ञ् key in the real layout.)
check('space and unmapped', preetiToUnicode('s € s'), 'क € क');

console.log('\n— Unicode → Preeti —');
check('bare consonant', unicodeToPreeti('क'), 's');
check('aa matra', unicodeToPreeti('का'), 'sf');
check('i-matra moves left', unicodeToPreeti('कि'), 'ls');
check('ii matra', unicodeToPreeti('की'), 'sL');
check('composite o matra', unicodeToPreeti('को'), 'sf]');
check('independent aa', unicodeToPreeti('आ'), 'cf');
check('independent o', unicodeToPreeti('ओ'), 'cf]');
check('namaste', unicodeToPreeti('नमस्ते'), 'gd:t]');
check('nepal', unicodeToPreeti('नेपाल'), 'g]kfn');
check('nna', unicodeToPreeti('ण'), '0f');
check('pha', unicodeToPreeti('फ'), 'km');
check('ksha', unicodeToPreeti('क्ष'), 'If');
check('conjunct kka', unicodeToPreeti('क्क'), 'Ss');
check('conjunct with matra', unicodeToPreeti('क्का'), 'Ssf');
check('reph karma', unicodeToPreeti('कर्म'), 'sd{');
check('reph varsha', unicodeToPreeti('वर्ष'), 'jif{');
check('reph with matra', unicodeToPreeti('कार्य'), 'sfo{');
check('anusvara', unicodeToPreeti('अं'), 'c+');
check('nukta', unicodeToPreeti('ट़'), '6«');
check('nukta in word', unicodeToPreeti('राष\u093Cट्रिय'), '/fif«l6«o');
check('danda', unicodeToPreeti('।'), '.');
check('digits', unicodeToPreeti('१२३'), '!@#');
check('i-matra on conjunct', unicodeToPreeti('स्ति'), 'l:t');
// Rakar: a cluster-final र becomes the `|` stroke on the full consonant,
// not a dropped or half-form र.
check('rakar pra', unicodeToPreeti('प्र'), 'k|');
check('rakar kra', unicodeToPreeti('क्र'), 's|');
check('rakar khra', unicodeToPreeti('ख्र'), 'v|');
check('rakar gra', unicodeToPreeti('ग्र'), 'u|');
check('rakar with i-matra', unicodeToPreeti('क्रि'), 'ls|');
check('rakar with o-matra', unicodeToPreeti('क्रो'), 's|f]');
check('rakar in word', unicodeToPreeti('प्रस्तुत'), "k|:t't");
// Retroflex rakar: ट्र, ठ्र, ड्र, ढ्र use the « stroke instead of |.
check('retroflex rakar tra', unicodeToPreeti('ट्र'), '6«');
check('retroflex rakar dra', unicodeToPreeti('ड्र'), '8«');
check('retroflex rakar in word', unicodeToPreeti('राष्ट्रिय'), '/fli6«o');
check('retroflex rakar truck', unicodeToPreeti('ट्रक'), '6«s');
// रु / रू use their dedicated ligature keys, not `/` plus a matra.
check('ra-u ligature', unicodeToPreeti('रु'), '?');
check('ra-uu ligature', unicodeToPreeti('रू'), '¿');
check('ra-uu in word', unicodeToPreeti('भरूवा'), 'e¿jf');
check('reph with rakar', unicodeToPreeti('र्ग्र'), 'u|{');
// Dedicated conjunct keys from the legacy layout.
check('dental conjuncts', unicodeToPreeti('द्दद्धद्मद्वद्घ'), '24ßå¢');
check('retroflex conjuncts', unicodeToPreeti('ट्टट्ठठ्ठड्ड'), '§Ý¶•');
check('nasal conjuncts', unicodeToPreeti('ङ्कङ्खङ्गङ्घङ्ढ'), 'ª\\sª\\vª\\uª\\3ª\\9');
check('tta conjunct', unicodeToPreeti('त्त'), 'Q');
check('jna half', unicodeToPreeti('ज्ञ्'), '¡');
// ब्र has no dedicated key: it is the rakar stroke on full ब.
check('bra via rakar', unicodeToPreeti('ब्र'), 'a|');
check('nna half', unicodeToPreeti('कुण्ड'), "s'08");
check('la half', unicodeToPreeti('कल्प'), 'sNk');
check('hrr ligature', unicodeToPreeti('हृदय'), 'Åbo');
check('eyelash ra', unicodeToPreeti('र्‍'), '¥');
check('avagraha', unicodeToPreeti('ऽ'), '˜');
check('shakti', unicodeToPreeti('शक्ति'), 'zlSt');
check('buddhi', unicodeToPreeti('बुद्धि'), "a'l4");
check('dvandva', unicodeToPreeti('द्वन्द्व'), 'åGå');
check('shabda', unicodeToPreeti('शब्द'), 'zAb');
check('padma', unicodeToPreeti('पद्म'), 'kß');
check('sanga', unicodeToPreeti('सङ्ग'), ';ª\\u');
// The Preeti font has no plain-hyphen glyph: a dash is the en dash (Alt+0150).
check('dash to en dash', unicodeToPreeti('-'), '–');
check('em dash stays em dash', unicodeToPreeti('—'), '—');
check('underscore to dotted-blank byte', unicodeToPreeti('_'), '=');
check('multiple underscores to dotted blanks', unicodeToPreeti('_____'), '=====');
check(
  'underscores inside a sentence',
  unicodeToPreeti('राम ____ गयो।'),
  '/fd ==== uof] .',
);
check('tabs to single space', unicodeToPreeti('नेपाल\tसरकार'), 'g]kfn ;/sf/');
// Aakar comes before the reph: गर्दा is `ubf{`, not `ub{f`.
check('reph after aakar', unicodeToPreeti('गर्दा'), 'ubf{');
check('karta reph order', unicodeToPreeti('कर्ता'), 'stf{');
check('reph after sign', unicodeToPreeti('कर्मं'), 'sd+{');
// Quotes map to their Alt-code glyph bytes (plain `'`/`"` bytes draw matras).
check('single quote opens', unicodeToPreeti("'"), '…');
check('double quote', unicodeToPreeti('"'), 'æ');
check('curly quotes', unicodeToPreeti('“”'), 'æÆ');
check('right single quote', unicodeToPreeti('’'), 'Ú');
// A straight double quote alternates: odd occurrences open (æ), even close (Æ).
check('double quotes alternate', unicodeToPreeti('"नेपाल"'), 'æg]kfnÆ');
check('alternation continues', unicodeToPreeti('"क" "ख"'), 'æsÆ ævÆ');
check('curly double quotes stay directional', unicodeToPreeti('“क”'), 'æsÆ');
// A straight single quote alternates too: odd opens (…), even closes (Ú).
check('single quotes alternate', unicodeToPreeti("'नेपाल'"), '…g]kfnÚ');
check('single alternation continues', unicodeToPreeti("'क' 'ख'"), '…sÚ …vÚ');
check('curly single quotes stay directional', unicodeToPreeti('‘क’'), '…sÚ');
// ! and × use their own glyph keys, not the digit/multiply keys in the font.
// The exclamation glyph gets a space before it (nothing precedes a lone `!`
// at the start of the text, so that case has no space).
check('exclamation at start', unicodeToPreeti('!'), 'Û');
check('exclamation in word', unicodeToPreeti('कस्तो!'), 's:tf] Û');
check('multiply sign', unicodeToPreeti('×'), '×');
// The `?` key draws the रु ligature in the font, so a question mark is `<`.
check('question mark', unicodeToPreeti('?'), '<');
check('question mark in word', unicodeToPreeti('कस्तो?'), 's:tf] <');
// Dots in Unicode are replaced with `=` which draws `.` in Preeti font.
// ASCII digits become their Devanagari digit bytes, so 4.5 is `$=%`.
check('decimal point in number', unicodeToPreeti('4.5'), '$=%');
check('ascii digits', unicodeToPreeti('2024'), '@)@$');
check('devanagari decimal', unicodeToPreeti('४.५'), '$=%');
check('full stop replaced with equal', unicodeToPreeti('राम.'), '/fd=');
check('dots in numbers like १. २. ३.', unicodeToPreeti('१. २. ३.'), '!= @= #=');
// Brackets, semicolon and colon use their own glyph bytes.
check('opening bracket', unicodeToPreeti('('), '-');
check('closing bracket', unicodeToPreeti(')'), '_');
check('curly brackets to small brackets', unicodeToPreeti('{नेपाल}'), '-g]kfn_');
check('square brackets to small brackets', unicodeToPreeti('[नेपाल]'), '-g]kfn_');
check('equals sign to Odieresis', unicodeToPreeti('५ = ५'), '% Ö %');
check('semicolon', unicodeToPreeti(';'), 'Ù');
// The colon shares the M byte with the visarga (same two-dot font glyph).
check('colon', unicodeToPreeti(':'), 'M');
check('visarga still M', unicodeToPreeti('ः'), 'M');
// Full sentence: colon→M, brackets→- and _, halanta→g\, quotes alternate.
check('sentence with colon', unicodeToPreeti("चुनौतीहरू पनि छन् (जस्तै: 'गोपनीयता' र \"तथ्याङ्क सुरक्षा\"),"), "r'gf}tLx¿ klg 5g\\ -h:t}M …uf]kgLotfÚ / ætYofª\\s ;'/IffÆ_,");
// Degree symbol and literal hash stay untouched.
check('degree stays', unicodeToPreeti('°'), '°');
check('hash stays', unicodeToPreeti('#'), '#');
check('tin digit', unicodeToPreeti('३'), '#');
// The % byte is the ५ digit in the font, so a percent sign is Ü.
check('percent sign', unicodeToPreeti('%'), 'Ü');
check('percent with digit', unicodeToPreeti('५०%'), '%)Ü');
// A standalone halanta consonant is the full letter plus the halanta key.
check('halanta na', unicodeToPreeti('न्'), 'g\\');
check('halanta ka', unicodeToPreeti('क्'), 's\\');
// The danda glyph touches the preceding character, so it gets its own space.
check('danda gets its own space', unicodeToPreeti('गरे।'), 'u/] .');
check('double danda space', unicodeToPreeti('नेपाल॥'), 'g]kfn ..');
check('danda after existing space', unicodeToPreeti('गरे ।'), 'u/] .');
check('danda at start', unicodeToPreeti('।नेपाल'), '.g]kfn');

console.log('\n— Round trip: Unicode → Preeti → Unicode —');
for (const word of [
  'नमस्ते',
  'नेपाल',
  'काठमाडौं',
  'कि',
  'को',
  'क्षेत्र',
  'हामी',
  'तिमीलाई',
  'माया',
  'घर',
  'पानी',
  'धन्यवाद',
  'आज',
  'ओठ',
  'सञ्चै',
  'कर्म',
  'वर्ष',
  'कार्य',
  'निर्माण',
  'सर्वप्रथम',
  'विद्यालय',
  'राष्ट्र',
  'गर्छु',
  'तिम्रो',
  'ज्ञान',
  'क्षेत्रफल',
  'श्रीमान्',
  'प्र',
  'क्रि',
  'प्रस्तुत',
  'रु',
  'रू',
  'गरू',
  'भरूवा',
  'विद्यार्थी',
  'स्वर्ण',
  'बुद्धि',
  'द्वारा',
  'हृदय',
  'शक्ति',
  'कुण्ड',
  'कल्पना',
  'द्वन्द्व',
  'प्रत्येक',
  'शब्द',
  'पद्म',
  'सङ्ग',
  'गर्दा',
  'हर्दा',
  'कर्ता',
  'निर्देश',
  'सर्वे',
  "'नेपाल'",
  'नेपाल।',
  'काठमाडौं॥',
  '"नेपाल"',
  '५×३!',
  'कस्तो?',
  'कस्तो!',
  '४.५',
  '(काठमाडौं)',
  'नेपालः राम',
  'न्',
  '५०%',
  '५ = ५',
  '१.२',
]) {
  check(`round trip ${word}`, preetiToUnicode(unicodeToPreeti(word)), word);
}

console.log('\n— Roman → Unicode —');
check('mero ghar', romanToUnicode('mero ghar'), 'मेरो घर');
check('namaste', romanToUnicode('namaste'), 'नमस्ते');
check('haami', romanToUnicode('haami'), 'हामी');
check('chha', romanToUnicode('chha'), 'छ');
check('ksha', romanToUnicode('ksha'), 'क्ष');
check('gya', romanToUnicode('gya'), 'ज्ञ');
check('rri', romanToUnicode('rri'), 'ऋ');
check('rree', romanToUnicode('rree'), 'ॠ');
check('om', romanToUnicode('om'), 'ॐ');

console.log('\n— Kantipur → Unicode —');
import { kantipurToUnicode } from '../src/lib/kantipur-to-unicode.ts';

const kantipurToPreeti = (text: string) => unicodeToPreeti(kantipurToUnicode(text));

// Shared bytes behave identically to Preeti.
check('kantipur bare consonant', kantipurToUnicode('s'), 'क');
check('kantipur aa matra', kantipurToUnicode('sf'), 'का');
check('kantipur i-matra reorders', kantipurToUnicode('ls'), 'कि');
check('kantipur namaste', kantipurToUnicode('gd:t]'), 'नमस्ते');
check('kantipur nepal', kantipurToUnicode('g]kfn'), 'नेपाल');
check('kantipur composite na', kantipurToUnicode('0f'), 'ण');
check('kantipur composite pha', kantipurToUnicode('km'), 'फ');
check('kantipur ksha', kantipurToUnicode('If'), 'क्ष');
check('kantipur conjunct kka', kantipurToUnicode('Ss'), 'क्क');
check('kantipur danda', kantipurToUnicode('.'), '।');
check('kantipur double danda', kantipurToUnicode('..'), '॥');
check('kantipur digits', kantipurToUnicode('!@#'), '१२३');
check('kantipur reph karma', kantipurToUnicode('sd{'), 'कर्म');
check('kantipur rakar pra', kantipurToUnicode('k|'), 'प्र');
check('kantipur rakar with i-matra', kantipurToUnicode('ls|'), 'क्रि');
check('kantipur ra-u ligature', kantipurToUnicode('?'), 'रु');
check('kantipur independent aa', kantipurToUnicode('cf'), 'आ');
check('kantipur independent o', kantipurToUnicode('cf]'), 'ओ');
check('kantipur tta font trick', kantipurToUnicode('6['), 'ट्ट');
check('kantipur tta conjunct', kantipurToUnicode('Q'), 'त्त');
check('kantipur kra overlay', kantipurToUnicode('qm'), 'क्र');
check('kantipur kta overlay', kantipurToUnicode('Qm'), 'क्त');
check('kantipur jna key', kantipurToUnicode('1'), 'ज्ञ');
check('kantipur half ya key', kantipurToUnicode('Ø'), '्य');
check('kantipur explicit virama', kantipurToUnicode('a\\b'), 'ब्द');
check('kantipur danda space stripped', kantipurToUnicode('u/] .'), 'गरे।');
check('kantipur exclamation space stripped', kantipurToUnicode('s:tf] †'), 'कस्तो!');
check('kantipur question space stripped', kantipurToUnicode('s:tf] <'), 'कस्तो?');

// Every byte where Kantipur differs from Preeti (Kantipur value first).
check('kantipur F is aa-matra, not chandrabindu', kantipurToUnicode('F'), 'ा');
check('kantipur F in word', kantipurToUnicode('sF'), 'का');
check('kantipur chandrabindu is “', kantipurToUnicode('s“'), 'कँ');
// Canonical order is matra then chandrabindu (क + ा + ँ), as in Preeti.
check('kantipur kaa-chandrabindu', kantipurToUnicode('sf“'), 'काँ');
check('kantipur kahaan', kantipurToUnicode('sxf“'), 'कहाँ');
// The decoder preserves typed order, like the Preeti decoder: chandrabindu
// typed before the matra stays before it in the Unicode output.
check('kantipur typed chandrabindu first', kantipurToUnicode('s“f'), 'कँा');
check('kantipur X is hrr, not half ha', kantipurToUnicode('X'), 'हृ');
check('kantipur hridaya', kantipurToUnicode('Xbo'), 'हृदय');
check('kantipur ‹ is nnga, not nngha', kantipurToUnicode('‹'), 'ङ्ग');
check('kantipur Ë is also nnga', kantipurToUnicode('Ë'), 'ङ्ग');
check('kantipur › is avagraha, not dra', kantipurToUnicode('›'), 'ऽ');
check('kantipur ˜ is also avagraha', kantipurToUnicode('˜'), 'ऽ');
check('kantipur Î is half pha, not nkha', kantipurToUnicode('Î'), 'फ्');
check('kantipur º is half pha', kantipurToUnicode('º'), 'फ्');
check('kantipur Ï is half pha', kantipurToUnicode('Ï'), 'फ्');
check('kantipur ° is nngdha, not degree', kantipurToUnicode('°'), 'ङ्ढ');
check('kantipur ¨ is nnga', kantipurToUnicode('¨'), 'ङ्ग');
check('kantipur Œ is ttt', kantipurToUnicode('Œ'), 'त्त्');
check('kantipur œ is ttr', kantipurToUnicode('œ'), 'त्र्');
check('kantipur Ô is ksha', kantipurToUnicode('Ô'), 'क्ष');
check('kantipur È is ssa', kantipurToUnicode('È'), 'ष');
check('kantipur ø is half ya', kantipurToUnicode('ø'), 'य्');
check('kantipur ® is ra', kantipurToUnicode('®'), 'र');
check('kantipur µ is ra', kantipurToUnicode('µ'), 'र');
check('kantipur Â is ra', kantipurToUnicode('Â'), 'र');
check('kantipur ™ is ra', kantipurToUnicode('™'), 'र');
check('kantipur † is exclamation', kantipurToUnicode('†'), '!');
check('kantipur ¬ is ellipsis', kantipurToUnicode('¬'), '…');
check('kantipur soft hyphen is open bracket', kantipurToUnicode('­'), '(');
check('kantipur macron is macron', kantipurToUnicode('¯'), '¯');
// Curly quotes are kept curly in Kantipur (Preeti normalises them straight).
check('kantipur left double quote', kantipurToUnicode('æ'), '“');
check('kantipur right double quote', kantipurToUnicode('Æ'), '”');
check('kantipur right single quote', kantipurToUnicode('Ú'), '’');
check('kantipur left single quote', kantipurToUnicode('…'), '‘');
// Preeti-only bytes are not Kantipur bytes: they pass through untouched.
check(
  'kantipur preeti-only bytes pass through',
  kantipurToUnicode('ÅÖÙÛÜÝˆ'),
  'ÅÖÙÛÜÝˆ',
);
check('kantipur multiply byte passes through', kantipurToUnicode('×'), '×');

console.log('\n— Kantipur → Preeti (chained) —');
check('kantipur kahaan to preeti', kantipurToPreeti('sxf“'), 'sxfF');
check('kantipur kaa-chandrabindu to preeti', kantipurToPreeti('sf“'), 'sfF');
// Typed chandrabindu-first order is canonicalised by the Preeti step.
check('kantipur typed order canonicalised', kantipurToPreeti('s“f'), 'sfF');
check('kantipur hridaya to preeti', kantipurToPreeti('Xbo'), 'Åbo');
check('kantipur nnga to preeti', kantipurToPreeti('‹'), 'ª\\u');
check('kantipur ¨ nnga to preeti', kantipurToPreeti('¨'), 'ª\\u');
check('kantipur avagraha to preeti', kantipurToPreeti('›'), '˜');
check('kantipur half pha to preeti', kantipurToPreeti('Î'), 'km\\');
check('kantipur half pha mid-cluster to preeti', kantipurToPreeti('Îs'), 'ˆs');
check('kantipur nngdha to preeti', kantipurToPreeti('°'), 'ª\\9');
check('kantipur exclamation to preeti', kantipurToPreeti('†'), 'Û');
check('kantipur chandrabindu to preeti', kantipurToPreeti('“'), 'F');
check('kantipur aa-matra to preeti', kantipurToPreeti('F'), 'f');
check('kantipur hrr to preeti', kantipurToPreeti('X'), 'Å');
check('kantipur ttt to preeti', kantipurToPreeti('Œ'), 'Q\\');
check('kantipur ttr to preeti', kantipurToPreeti('œ'), 'q\\');
check('kantipur ksha to preeti', kantipurToPreeti('Ô'), 'If');
check('kantipur ssa to preeti', kantipurToPreeti('È'), 'if');
check('kantipur half ya to preeti', kantipurToPreeti('ø'), 'o\\');
check('kantipur ra bytes to preeti', kantipurToPreeti('µ®Â™'), '////');
// No Preeti ellipsis glyph exists, so the Kantipur ellipsis passes through.
check('kantipur ellipsis passes through', kantipurToPreeti('¬'), '…');
check('kantipur soft hyphen to preeti', kantipurToPreeti('­'), '-');
check('kantipur macron passes through', kantipurToPreeti('¯'), '¯');
check('kantipur quotes stay directional', kantipurToPreeti('æÆ'), 'æÆ');
check('kantipur single quotes stay directional', kantipurToPreeti('…Ú'), '…Ú');
check(
  'kantipur sample sentence to preeti',
  kantipurToPreeti('g]kfn ;f“Rr} Xbo'),
  'g]kfn ;fFRr} Åbo',
);

console.log('\n— Round trip: Kantipur → Unicode → Preeti → Unicode —');
for (const bytes of [
  'sxf“',
  'Xbo',
  'g]kfn',
  '‹',
  '°',
  'Œ',
  'œ',
  'Î',
  '¨',
  '†',
  'µ',
  'Ô',
  'È',
  'ø',
  '´08f',
  'sd{',
  'ls|',
  'g]kfnsf] ´08f',
]) {
  check(
    `round trip ${bytes}`,
    preetiToUnicode(kantipurToPreeti(bytes)),
    kantipurToUnicode(bytes),
  );
}

console.log('\n— Roman → Preeti (chained) —');
check(
  'mero ghar chains roman→unicode→preeti',
  unicodeToPreeti(romanToUnicode('mero ghar')),
  'd]/f] 3/',
);
// Aspirates are spelled with a trailing h; the inherent vowel needs no letter.
check('kha aspirated', romanToUnicode('kha'), 'ख');
check('khaa long vowel', romanToUnicode('khaa'), 'खा');
check('conjunct virama', romanToUnicode('namaskar'), 'नमस्कार');
check('anusvara star', romanToUnicode('ka*'), 'कं');
check('sentence', romanToUnicode('ma timilai maya garchhu'), 'म तिमीलाई माया गर्छु');
check('digits', romanToUnicode('123'), '१२३');
check('whitespace preserved', romanToUnicode('ma  ra'), 'म  र');
check('t dental', romanToUnicode('t'), 'त');
check('T retroflex', romanToUnicode('T'), 'ट');
check('tra conjunct', romanToUnicode('tra'), 'त्र');
check('Tra retroflex conjunct', romanToUnicode('Tra'), 'ट्र');
check('Traa', romanToUnicode('Traa'), 'ट्रा');
check('Tri', romanToUnicode('Tri'), 'ट्रि');
check('Tree', romanToUnicode('Tree'), 'ट्री');
check('Dra', romanToUnicode('Dra'), 'ड्र');
check('Draa', romanToUnicode('Draa'), 'ड्रा');
check('Dri', romanToUnicode('Dri'), 'ड्रि');
check('Dree', romanToUnicode('Dree'), 'ड्री');
check('Thra', romanToUnicode('Thra'), 'ठ्र');
check('Thraa', romanToUnicode('Thraa'), 'ठ्रा');
check('Thri', romanToUnicode('Thri'), 'ठ्रि');
check('Three', romanToUnicode('Three'), 'ठ्री');
check('newline preserved', romanToUnicode('ma\nra'), 'म\nर');

// --- Output cleanup tools ------------------------------------------------
import { applyTool, removeSpaceMath, removeSpacePunctuation } from '../src/lib/output-tools.ts';

check('remove space before danda', removeSpacePunctuation('u/] .'), 'u/].');
check('remove space before double danda', removeSpacePunctuation('g]kfn ..'), 'g]kfn..');
check('remove space before question mark', removeSpacePunctuation('s:tf] <'), 's:tf]<');

check('tool: remove tabs', applyTool('remove-tabs', 's\tv'), 's v');
check('tool: space before danda', applyTool('space-punctuation', 'u/].'), 'u/] .');
check('tool: space before double danda', applyTool('space-punctuation', 'g]kfn..'), 'g]kfn ..');
check('tool: space before question mark', applyTool('space-punctuation', 's:tf]<'), 's:tf] <');
check(
  'tool: collapse whitespace before punctuation',
  applyTool('space-punctuation', 'u/]  .'),
  'u/] .',
);
check('tool: spaced math', applyTool('space-math', unicodeToPreeti('५×१=५')), '% × ! Ö %');
check('tool: math already spaced is stable', applyTool('space-math', '% × ! Ö %'), '% × ! Ö %');
check('tool: dot between digits not spaced', applyTool('space-math', '%=%'), '%=%');
check('remove space math: spaced becomes tight', removeSpaceMath('% × ! Ö %'), '%×!Ö%');
check('remove space math: minus between digits', removeSpaceMath('% – !'), '%–!');
check('remove space math: already tight is stable', removeSpaceMath('%×!Ö%'), '%×!Ö%');
check('remove space math: dot between digits untouched', removeSpaceMath('% = %'), '% = %');
check('remove space math: operator without digits untouched', removeSpaceMath('s × t'), 's × t');
check('tool: collapse multiple spaces', applyTool('single-spaces', 's  v   x'), 's v x');
check('tool: newlines preserved', applyTool('single-spaces', 's  \nv'), 's \nv');
check('tool: unknown tool returns null', applyTool('nope', 's'), null);

// --- Theme toggle behavior -----------------------------------------------
// Tests the logic that decides whether to apply dark mode.
check('theme defaults light', JSON.stringify(getTheme('light', false)), '"light"');
check('theme defaults dark', JSON.stringify(getTheme(null, true)), '"dark"');
check('theme stored overrides preference', JSON.stringify(getTheme('dark', false)), '"dark"');
check('theme light overrides dark preference', JSON.stringify(getTheme('light', true)), '"light"');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
