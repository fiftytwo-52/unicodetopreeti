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

function check(label: string, actual: string, expected: string) {
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
check('em dash byte', preetiToUnicode('—'), '-');
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
check('em dash to en dash', unicodeToPreeti('—'), '–');
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
check('question mark in word', unicodeToPreeti('कस्तो?'), 's:tf]<');
// A dot between two digits is a decimal point → `=`; other dots stay dots.
// ASCII digits become their Devanagari digit bytes, so 4.5 is `$=%`.
check('decimal point in number', unicodeToPreeti('4.5'), '$=%');
check('ascii digits', unicodeToPreeti('2024'), '@)@$');
check('devanagari decimal', unicodeToPreeti('४.५'), '$=%');
check('full stop not between digits', unicodeToPreeti('राम.'), '/fd.');
// Brackets, semicolon and colon use their own glyph bytes.
check('opening bracket', unicodeToPreeti('('), '-');
check('closing bracket', unicodeToPreeti(')'), '_');
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
// Aspirates are spelled with a trailing h; the inherent vowel needs no letter.
check('kha aspirated', romanToUnicode('kha'), 'ख');
check('khaa long vowel', romanToUnicode('khaa'), 'खा');
check('conjunct virama', romanToUnicode('namaskar'), 'नमस्कार');
check('anusvara star', romanToUnicode('ka*'), 'कं');
check('sentence', romanToUnicode('ma timilai maya garchhu'), 'म तिमीलाई माया गर्छु');
check('digits', romanToUnicode('123'), '१२३');
check('whitespace preserved', romanToUnicode('ma  ra'), 'म  र');
check('newline preserved', romanToUnicode('ma\nra'), 'म\nर');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
