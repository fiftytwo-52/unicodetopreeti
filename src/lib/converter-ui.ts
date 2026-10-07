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
import {
  applyTool,
  isToolName,
  removeSpaceMath,
  removeSpacePunctuation,
} from './output-tools.ts';
import type { ToolName } from './output-tools.ts';

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

  // Cleanup modes. Every button is an on/off switch: while a mode is on,
  // its transform runs over the output after every conversion. The output
  // is always re-derived as applyModes(forward(input)), so switching a
  // mode off returns the exact un-moded text — no snapshots needed.
  // "Space before । ?" and "Space math" are on by default; the rest are
  // opt-in. Space math is on by default because spaced math (2 × 5 = 10)
  // is the normal question-paper style; switching it off compacts the
  // operators (2×5=10).
  const modes: Record<ToolName, boolean> = {
    'remove-tabs': false,
    'space-punctuation': true,
    'space-math': true,
    'single-spaces': false,
  };
  const TOOL_ORDER: ToolName[] = [
    'remove-tabs',
    'space-punctuation',
    'space-math',
    'single-spaces',
  ];

  // Modes whose "off" state applies a reverse transform instead of doing
  // nothing: the converter's default output already has the spaced form,
  // so off strips it back out.
  const OFF_TRANSFORMS: Partial<Record<ToolName, (text: string) => string>> =
    {
      'space-punctuation': removeSpacePunctuation,
      'space-math': removeSpaceMath,
    };

  function applyModes(text: string): string {
    let result = text;
    for (const name of TOOL_ORDER) {
      if (modes[name]) {
        result = applyTool(name, result) ?? result;
      } else {
        const off = OFF_TRANSFORMS[name];
        if (off) result = off(result);
      }
    }
    return result;
  }

  function persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          input: input!.value,
          output: output!.value,
          modes,
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
        modes?: unknown;
        spacePunct?: unknown;
      };
      if (typeof saved.input === 'string') input!.value = saved.input;
      if (typeof saved.output === 'string') output!.value = saved.output;
      if (saved.modes && typeof saved.modes === 'object') {
        const stored = saved.modes as Record<string, unknown>;
        for (const name of TOOL_ORDER) {
          if (typeof stored[name] === 'boolean') modes[name] = stored[name];
        }
      } else if (typeof saved.spacePunct === 'boolean') {
        // State written by the previous version, which only had the one mode.
        modes['space-punctuation'] = saved.spacePunct;
      }
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

  const toolButtons =
    root.querySelectorAll<HTMLButtonElement>('[data-tool]');

  function syncToolButton(button: HTMLButtonElement, name: ToolName) {
    button.setAttribute('aria-pressed', String(modes[name]));
  }

  // Forward conversion runs the enabled cleanup modes over the result.
  function forwardText(text: string): string {
    return applyModes(forward(text));
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

  // Cleanup tools: each button is an on/off switch. Switching on
  // snapshots both panes, re-derives the output through the enabled modes,
  // and syncs the Unicode pane via the reverse conversion. Switching off
  // restores the snapshot exactly when nothing changed since, otherwise
  // re-derives from the current input.
  type Snapshot = { in0: string; out0: string; in1: string; out1: string };
  const snapshots = new Map<ToolName, Snapshot>();

  toolButtons.forEach((button) => {
    const name = button.dataset.tool;
    if (!isToolName(name)) return;
    syncToolButton(button, name);
    button.addEventListener('click', () => {
      const label = button.textContent?.trim() ?? 'Tool';
      if (modes[name]) {
        // Switching off.
        modes[name] = false;
        const snap = snapshots.get(name);
        if (
          snap &&
          output!.value === snap.out1 &&
          input!.value === snap.in1
        ) {
          output!.value = snap.out0;
          input!.value = snap.in0;
        } else {
          const out = forwardText(input!.value);
          output!.value = out;
          if (reverse) input!.value = reverse(out);
        }
        snapshots.delete(name);
      } else {
        // Switching on.
        const in0 = input!.value;
        const out0 = output!.value;
        modes[name] = true;
        const out1 = forwardText(in0);
        output!.value = out1;
        const in1 = reverse ? reverse(out1) : in0;
        if (reverse) input!.value = in1;
        snapshots.set(name, { in0, out0, in1, out1 });
      }
      syncToolButton(button, name);
      updateCount();
      persistState();
      announce(`${label} ${modes[name] ? 'on' : 'off'}.`);
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
      convert(input, output, forwardText);
      announce('Example loaded.');
    });

  restoreState();
  toolButtons.forEach((button) => {
    const name = button.dataset.tool;
    if (isToolName(name)) syncToolButton(button, name);
  });
  updateCount();
}

document.querySelectorAll<HTMLElement>('.converter').forEach(setUp);
