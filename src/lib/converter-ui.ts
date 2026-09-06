/**
 * Client behaviour for the converter component.
 *
 * This lives in a .ts module rather than inline in Converter.astro because
 * Astro hands `<script>` bodies to esbuild as plain JavaScript — type
 * annotations written there fail the build.
 */
import { preetiToUnicode } from './preeti-to-unicode.ts';
import { unicodeToPreeti } from './unicode-to-preeti.ts';
import { romanToUnicode } from './roman-to-unicode.ts';

type Mode = 'unicode-to-preeti' | 'roman-to-unicode';

type Conversion = {
  forward: (text: string) => string;
  reverse?: (text: string) => string;
};

/**
 * Each mode defines the forward conversion and, where one exists, the reverse
 * so edits in the output pane flow back. Roman has no reverse: converting
 * Devanagari back to Latin is lossy and would fight the user's typing.
 */
const conversions: Record<Mode, Conversion> = {
  'unicode-to-preeti': {
    forward: unicodeToPreeti,
    reverse: preetiToUnicode,
  },
  'roman-to-unicode': {
    forward: romanToUnicode,
  },
};

function isMode(value: string | undefined): value is Mode {
  return value !== undefined && value in conversions;
}

function setUp(root: HTMLElement) {
  const mode = root.dataset.mode;
  if (!isMode(mode)) return;

  const input = root.querySelector<HTMLTextAreaElement>('[data-role="input"]');
  const output = root.querySelector<HTMLTextAreaElement>('[data-role="output"]');
  const count = root.querySelector<HTMLElement>('[data-role="count"]');
  const status = root.querySelector<HTMLElement>('[data-role="status"]');
  if (!input || !output || !count || !status) return;

  const { forward, reverse } = conversions[mode];

  // Guards against the two-way sync echoing back and forth.
  let syncing = false;
  let statusTimer: number | undefined;

  function announce(message: string) {
    status!.textContent = message;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      status!.textContent = '';
    }, 2400);
  }

  function updateCount() {
    const length = output!.value.length;
    count!.textContent = `${length} ${length === 1 ? 'character' : 'characters'}`;
  }

  function convert(
    from: HTMLTextAreaElement,
    to: HTMLTextAreaElement,
    fn: (text: string) => string,
  ) {
    if (syncing) return;
    syncing = true;
    to.value = fn(from.value);
    updateCount();
    syncing = false;
  }

  input.addEventListener('input', () => convert(input, output, forward));

  if (reverse) {
    output.addEventListener('input', () => convert(output, input, reverse));
  } else {
    // Output stays editable for touch-ups, but nothing flows back.
    output.addEventListener('input', updateCount);
  }

  root
    .querySelector<HTMLButtonElement>('[data-action="copy"]')
    ?.addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      if (!output.value) {
        announce('Nothing to copy yet.');
        return;
      }
      try {
        await navigator.clipboard.writeText(output.value);
        const original = button.textContent;
        button.textContent = 'Copied';
        announce('Result copied to clipboard.');
        window.setTimeout(() => {
          button.textContent = original;
        }, 1400);
      } catch {
        // Clipboard access is denied in some browsers over plain HTTP.
        output.select();
        announce('Press Ctrl+C to copy the selected text.');
      }
    });

  root
    .querySelector<HTMLButtonElement>('[data-action="clear"]')
    ?.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      updateCount();
      input.focus();
      announce('Cleared.');
    });

  root
    .querySelector<HTMLButtonElement>('[data-action="example"]')
    ?.addEventListener('click', () => {
      input.value = root.dataset.sample ?? '';
      convert(input, output, forward);
      announce('Example loaded.');
    });

  updateCount();
}

document.querySelectorAll<HTMLElement>('.converter').forEach(setUp);
