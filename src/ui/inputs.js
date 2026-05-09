/**
 * Inputs binding
 * ----------------------------------------------------------------
 * Wires the numeric input fields to the store. Uses event delegation
 * (one listener at the form root) instead of one listener per field —
 * cheaper memory, and adapts automatically if fields are added later.
 */

/**
 * Map of input id → { path, slice, key }.
 * Frozen for v8 to specialize the lookup.
 */
const INPUT_MAP = Object.freeze({
  'swim-min':   { slice: 'swim', key: 'min' },
  'swim-sec':   { slice: 'swim', key: 'sec' },
  'bike-speed': { slice: 'bike', key: 'speed' },
  'run-min':    { slice: 'run',  key: 'min' },
  'run-sec':    { slice: 'run',  key: 'sec' },
  't1':         { slice: 't1' },
  't2':         { slice: 't2' },
});

/**
 * Hydrate input field values from current state.
 */
export function hydrateInputs(state) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  set('swim-min',   state.swim.min);
  set('swim-sec',   state.swim.sec);
  set('bike-speed', state.bike.speed);
  set('run-min',    state.run.min);
  set('run-sec',    state.run.sec);
  set('t1',         state.t1);
  set('t2',         state.t2);
}

/**
 * Attach a single delegated `input` listener to the panel root.
 * @param {HTMLElement} root  the inputs panel
 * @param {Object} store      state store
 */
export function bindInputs(root, store) {
  root.addEventListener('input', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const map = INPUT_MAP[target.id];
    if (!map) return;

    const raw = parseFloat(target.value);
    const val = Number.isNaN(raw) ? 0 : raw;

    if (map.key) {
      store.set(`${map.slice}.${map.key}`, val);
    } else {
      store.set(map.slice, val);
    }
  }, { passive: true });
}
