/**
 * State store
 * ----------------------------------------------------------------
 * Minimal observable store. Tracks state, notifies subscribers on
 * change, and persists to localStorage with debouncing.
 *
 * Design notes:
 * - Subscribers are invoked synchronously and receive the new state.
 * - `set()` accepts a partial object or a path/value pair; it always
 *   produces a new top-level object (immutable updates) so consumers
 *   can rely on referential equality for memoization.
 * - Persistence is debounced (60ms) to coalesce rapid keystrokes.
 */

import { STORAGE_KEYS, DEFAULTS } from './constants.js';

/** Safe storage wrapper — gracefully no-op when unavailable (private mode, SSR, etc.) */
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* swallow */ }
  },
};

/**
 * Deep-clone a plain object (small payloads only — domain data, not arbitrary).
 * Faster and safer than JSON round-trip for small known-shape objects.
 */
function cloneState(s) {
  return {
    swim: { ...s.swim },
    bike: { ...s.bike },
    run:  { ...s.run },
    t1: s.t1,
    t2: s.t2,
    lang: s.lang,
    theme: s.theme,
  };
}

/** Hydrate state from localStorage merged with defaults; resilient to malformed data. */
function hydrate() {
  const base = cloneState(DEFAULTS);
  const raw = storage.get(STORAGE_KEYS.STATE);
  if (!raw) {
    // First visit: detect language and theme from environment
    const nav = (navigator.language || 'en').toLowerCase();
    base.lang = nav.startsWith('fr') ? 'fr' : 'en';
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      base.theme = 'light';
    }
    return base;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      swim: { ...base.swim, ...(parsed.swim || {}) },
      bike: { ...base.bike, ...(parsed.bike || {}) },
      run:  { ...base.run,  ...(parsed.run  || {}) },
      t1: typeof parsed.t1 === 'number' ? parsed.t1 : base.t1,
      t2: typeof parsed.t2 === 'number' ? parsed.t2 : base.t2,
      lang: parsed.lang === 'fr' ? 'fr' : 'en',
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return base;
  }
}

/** Create a new store instance — exported as singleton via main.js */
export function createStore() {
  let state = hydrate();
  const subscribers = new Set();

  /** Persist (debounced via rAF + timer) */
  let persistTimer = 0;
  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
      persistTimer = 0;
      storage.set(STORAGE_KEYS.STATE, JSON.stringify(state));
    }, 60);
  }

  function notify() {
    subscribers.forEach((fn) => fn(state));
  }

  return {
    /** @returns current state (treat as readonly) */
    get() { return state; },

    /**
     * Replace top-level slice. Accepts:
     *   set({ t1: 2 })                  // patch top-level
     *   set('swim', { min: 1, sec: 30 }) // replace slice
     *   set('swim.min', 1)              // dotted path mutation
     */
    set(arg1, arg2) {
      const next = cloneState(state);

      if (typeof arg1 === 'string') {
        const parts = arg1.split('.');
        if (parts.length === 1) {
          // Top-level key: 'swim', 'bike', 'run', 't1', 't2', 'lang', 'theme'
          if (typeof arg2 === 'object' && arg2 !== null && next[arg1]) {
            next[arg1] = { ...next[arg1], ...arg2 };
          } else {
            next[arg1] = arg2;
          }
        } else if (parts.length === 2) {
          // Dotted path: 'swim.min', 'bike.unit', etc.
          const [a, b] = parts;
          if (next[a] && typeof next[a] === 'object') {
            next[a] = { ...next[a], [b]: arg2 };
          }
        }
      } else if (typeof arg1 === 'object' && arg1 !== null) {
        // Top-level patch
        Object.assign(next, arg1);
      }

      state = next;
      notify();
      schedulePersist();
    },

    /**
     * Subscribe to state changes.
     * @param {(state) => void} fn
     * @returns {() => void} unsubscribe
     */
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}
