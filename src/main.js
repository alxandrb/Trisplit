/**
 * trisplit — main entrypoint
 * ----------------------------------------------------------------
 * Composes the modules. Holds no business logic of its own; all
 * compute, format, and i18n decisions live in their respective
 * modules.
 */

import { createStore } from './core/state.js';
import { applyI18n, t } from './i18n/i18n.js';
import { initRender, scheduleRender, renderImmediate } from './ui/render.js';
import { bindInputs, hydrateInputs } from './ui/inputs.js';
import { initToggles, onToggle, setToggleActive } from './ui/toggles.js';
import { applyTheme } from './ui/theme.js';

/**
 * Update the unit-dependent input hint text based on current state.
 */
function refreshDynamicHints(state) {
  const swimHint = document.getElementById('swim-hint');
  if (swimHint) {
    swimHint.textContent = state.swim.unit === '100y'
      ? t('hint.swim.y')
      : t('hint.swim.m');
  }
  const runHint = document.getElementById('run-hint');
  if (runHint) {
    runHint.textContent = state.run.unit === 'mi'
      ? t('hint.run.mi')
      : t('hint.run.km');
  }
}

function boot() {
  const store = createStore();
  const initial = store.get();

  // ── Theme ─────────────────────────────────────
  applyTheme(initial.theme);
  setToggleActive('theme', initial.theme);

  // ── Language ──────────────────────────────────
  applyI18n(initial.lang);
  setToggleActive('lang', initial.lang);
  refreshDynamicHints(initial);

  // ── Unit toggles ──────────────────────────────
  setToggleActive('swim-unit', initial.swim.unit);
  setToggleActive('bike-unit', initial.bike.unit);
  setToggleActive('run-unit',  initial.run.unit);

  // ── Mount renderer ────────────────────────────
  initRender(document.getElementById('races'));

  // ── Inputs ────────────────────────────────────
  hydrateInputs(initial);
  bindInputs(document.getElementById('inputs-panel'), store);

  // ── Toggles ───────────────────────────────────
  initToggles();

  onToggle('lang', (value) => {
    store.set('lang', value);
    applyI18n(value);
    refreshDynamicHints(store.get());
    renderImmediate(store.get()); // immediate so strings update without lag
  });

  onToggle('theme', (value) => {
    store.set('theme', value);
    applyTheme(value);
  });

  onToggle('swim-unit', (value) => {
    store.set('swim.unit', value);
    refreshDynamicHints(store.get());
  });

  onToggle('bike-unit', (value) => {
    store.set('bike.unit', value);
  });

  onToggle('run-unit', (value) => {
    store.set('run.unit', value);
    refreshDynamicHints(store.get());
  });

  // ── Reactive render ───────────────────────────
  store.subscribe((state) => {
    scheduleRender(state);
  });

  // First paint
  renderImmediate(initial);
}

// Run at DOMContentLoaded — the script is loaded with `defer` so this
// fires synchronously after parsing without blocking it.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
