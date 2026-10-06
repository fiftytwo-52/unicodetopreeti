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
import { applyTool, removeSpacePunctuation } from './output-tools.ts';

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

  // "Space before । ?" is a persistent mode, on by default: the converter
  // adds the space automatically, and switching it off removes the spaces
  // and stops adding them to new text.
  let spacePunctOn = true;

  function persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          input: input!.value,
          output: output!.value,
          spacePunct: spacePunctOn,
        }),
      );
    } catch {
      // Private mode or disabled storage: the refresh still works.
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        input?: unknown;
        output?: unknown;
        spacePunct?: unknown;
      };
      if (typeof saved.input === 'string') input!.value = saved.input;
      if (typeof saved.output === 'string') output!.value = saved.output;
      if (typeof saved.spacePunct === 'boolean')
        spacePunctOn = saved.spacePunct;
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

  // Cleanup-tool toggle state. Each button remembers both panes before and
  // after its own change so a second click can undo it; any reconversion or
  // manual edit invalidates the snapshots via resetTools().
  const toolButtons =
    root.querySelectorAll<HTMLButtonElement>('[data-tool]');
  // The "Space before । ?" button is a persistent on/off mode rather than
  // a one-shot cleanup, so it keeps its own pressed state.
  const punctButton = root.querySelector<HTMLButtonElement>(
    '[data-tool="space-punctuation"]',
  );
  const toolState = new Map<
    string,
    { beforeInput: string; beforeOutput: string; afterOutput: string }
  >();

  function resetTools() {
    toolState.clear();
    toolButtons.forEach((button) => {
      if (button !== punctButton) button.setAttribute('aria-pressed', 'false');
    });
  }

  function syncPunctButton() {
    punctButton?.setAttribute('aria-pressed', String(spacePunctOn));
  }

  // Forward conversion honours the "Space before । ?" mode.
  function forwardText(text: string): string {
    if (mode === 'unicode-to-preeti') {
      return unicodeToPreeti(text, { spacePunctuation: spacePunctOn });
    }
    return forward(text);
  }

  function convert(
    from: HTMLTextAreaElement,
    to: HTMLTextAreaElement,
    fn: (text: string) => string,
  ) {
    if (syncing) return;
    syncing = true;
    to.value = fn(from.value);
    resetTools();
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
    convert(input, output, forwardText);
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

  // Cleanup tools below the Preeti pane. Each button toggles: the first
  // click snapshots the output and applies the tool, a second click
  // restores the snapshot — but only if nothing else changed the output
  // since. They rewrite the output only; the Unicode source pane is left
  // untouched as the source of truth.
  // The "Space before । ?" button is a persistent on/off mode rather than
  // a one-shot cleanup, so it gets dedicated wiring below.
  if (punctButton) {
    syncPunctButton();
    punctButton.addEventListener('click', () => {
      spacePunctOn = !spacePunctOn;
      const next = spacePunctOn
        ? applyTool('space-punctuation', output!.value)
        : removeSpacePunctuation(output!.value);
      if (next !== output!.value) {
        output!.value = next;
        if (reverse) input!.value = reverse(next);
        updateCount();
      }
      syncPunctButton();
      persistState();
      announce(
        spacePunctOn ? 'Space before । ? on.' : 'Space before । ? off.',
      );
    });
  }

  toolButtons.forEach((button) => {
    const name = button.dataset.tool;
    if (name === 'space-punctuation') return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const outputEl = output!;
      const inputEl = input!;
      const saved = name ? toolState.get(name) : undefined;
      // Toggle off: this tool's change is still exactly what's in the box,
      // so restore both panes to precisely what they were.
      if (saved && outputEl.value === saved.afterOutput) {
        outputEl.value = saved.beforeOutput;
        inputEl.value = saved.beforeInput;
        toolState.delete(name!);
        button.setAttribute('aria-pressed', 'false');
        updateCount();
        persistState();
        announce(`${button.textContent?.trim() ?? 'Tool'} undone.`);
        return;
      }
      const result = applyTool(name, outputEl.value);
      if (result === null) return;
      if (result === outputEl.value) {
        announce('Nothing to change.');
        return;
      }
      if (name) {
        toolState.set(name, {
          beforeInput: inputEl.value,
          beforeOutput: outputEl.value,
          afterOutput: result,
        });
      }
      outputEl.value = result;
      // Keep the Unicode pane in sync with the cleaned-up Preeti text.
      if (reverse) inputEl.value = reverse(result);
      button.setAttribute('aria-pressed', 'true');
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
      resetTools();
      updateCount();
      persistState();
      input.focus();
      announce('Cleared.');
    });

  root
    .querySelector<HTMLButtonElement>('[data-action="example"]')
    ?.addEventListener('click', () => {
      input.value = root.dataset.sample ?? '';
      convert(input, output, forwardText);
      announce('Example loaded.');
    });

  restoreState();
  syncPunctButton();
  updateCount();
}

document.querySelectorAll<HTMLElement>('.converter').forEach(setUp);
