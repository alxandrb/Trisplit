/**
 * Toggles
 * ----------------------------------------------------------------
 * Generic toggle binding for unit/lang/theme button groups.
 *
 * Each toggle group is a container with `[data-toggle]` set to a key
 * (e.g. "lang", "theme", "swim-unit"). Buttons inside carry a
 * `[data-value]` attribute. Clicking a button:
 *   - sets aria-pressed accordingly
 *   - dispatches the change to the supplied handler
 *
 * One delegated listener at document level handles all toggles —
 * no per-button handlers, no listener leaks.
 */

const HANDLERS = new Map();

/**
 * Register a handler for a given toggle key.
 * @param {string} key            value of [data-toggle]
 * @param {(value: string) => void} fn
 */
export function onToggle(key, fn) {
  HANDLERS.set(key, fn);
}

/**
 * Programmatically set the active button in a toggle group.
 * @param {string} key
 * @param {string} value
 */
export function setToggleActive(key, value) {
  const group = document.querySelector(`[data-toggle="${key}"]`);
  if (!group) return;
  const buttons = group.querySelectorAll('button[data-value]');
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    btn.setAttribute('aria-pressed', btn.dataset.value === value ? 'true' : 'false');
  }
}

/**
 * Initialize global delegated click listener.
 * Call once at startup.
 */
export function initToggles() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-toggle] button[data-value]');
    if (!btn) return;
    const group = btn.closest('[data-toggle]');
    const key = group.dataset.toggle;
    const value = btn.dataset.value;

    setToggleActive(key, value);

    const handler = HANDLERS.get(key);
    if (handler) handler(value);
  });
}
