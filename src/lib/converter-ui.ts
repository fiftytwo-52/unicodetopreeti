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
import { applyTool } from './output-tools.ts';

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

  // --- Converter state survives the idle refresh ------------------------
  // The page reloads after 10 minutes without user activity, so the panes
  // are saved to localStorage on every change and restored on load. A
  // failed or unavailable storage never blocks the refresh itself.
  const STORAGE_KEY = `converter-state:${mode}`;

  function persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ input: input!.value, output: output!.value }),
      );
    } catch {
      // Private mode or disabled storage: the refresh still works.
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { input?: unknown; output?: unknown };
      if (typeof saved.input === 'string') input!.value = saved.input;
      if (typeof saved.output === 'string') output!.value = saved.output;
    } catch {
      // Corrupt state: start with empty panes.
    }
  }

  // --- Idle auto-refresh -------------------------------------------------
  // Reloads the page after 10 minutes without user activity. Any pointer,
  // key, scroll, touch or input event restarts the countdown.
  const IDLE_LIMIT_MS = 10 * 60 * 1000;
  let idleTimer: number | undefined;

  function resetIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => window.location.reload(), IDLE_LIMIT_MS);
  }

  for (const event of [
    'pointerdown',
    'keydown',
    'input',
    'scroll',
    'touchstart',
    'click',
  ]) {
    window.addEventListener(event, resetIdleTimer, { passive: true });
  }
  resetIdleTimer();

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
    persistState();
    syncing = false;
  }

  input.addEventListener('input', () => {
    if (mode === 'unicode-to-preeti' && /[\t{}[\]]/.test(input.value)) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value
        .replace(/\t/g, ' ')
        .replace(/[{[]/g, '(')
        .replace(/[}\]]/g, ')');
      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }
    }
    convert(input, output, forward);
  });

  if (reverse) {
    output.addEventListener('input', () => convert(output, input, reverse));
  } else {
    // Output stays editable for touch-ups, but nothing flows back.
    output.addEventListener('input', () => {
      updateCount();
      persistState();
    });
  }

  // One-click cleanup tools below the Preeti pane. They rewrite the output
  // only — the Unicode source pane is left untouched as the source of truth.
  root.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = applyTool(button.dataset.tool, output!.value);
      if (result === null) return;
      if (result === output!.value) {
        announce('Nothing to change.');
        return;
      }
      output!.value = result;
      updateCount();
      persistState();
      announce(`${button.textContent?.trim() ?? 'Tool'} applied.`);
    });
  });

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
      persistState();
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

  restoreState();
  updateCount();
}

document.querySelectorAll<HTMLElement>('.converter').forEach(setUp);
