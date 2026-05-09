/**
 * Render
 * ----------------------------------------------------------------
 * Renders the race cards into a single mount node.
 *
 * Optimizations applied:
 *   1. requestAnimationFrame coalescing — multiple state mutations
 *      within a frame produce one DOM update.
 *   2. Memoization on (state, lang) — skips render if the inputs
 *      haven't changed.
 *   3. Single innerHTML write per render — fewer reflows than
 *      per-card DOM diffing for this UI size (4 cards).
 *   4. Template strings built without concatenation in hot loops;
 *      array-join only at the boundary.
 *
 * Why innerHTML over DOM diffing here:
 *   - 4 cards × ~15 leaf nodes each = ~60 nodes
 *   - Render frequency is bounded by user input (~10/s peak)
 *   - innerHTML is one parse + one paint; a manual diff would be
 *     slower in practice and would add ~kB of code
 */

import { computeRaces } from '../core/compute.js';
import { t } from '../i18n/i18n.js';
import { fmtTime, fmtSwimDist, fmtRunDist } from './format.js';

let mountNode = null;
let pendingFrame = 0;
let lastRenderKey = '';

/**
 * Initialize renderer with mount point. Call once at startup.
 */
export function initRender(node) {
  mountNode = node;
}

/**
 * Build a stable cache key from the inputs that affect render output.
 * Cheap to compute (string concat) — cheaper than re-rendering.
 */
function cacheKey(state) {
  const s = state;
  return `${s.lang}|${s.swim.min}:${s.swim.sec}/${s.swim.unit}|${s.bike.speed}/${s.bike.unit}|${s.run.min}:${s.run.sec}/${s.run.unit}|${s.t1}|${s.t2}`;
}

/**
 * Build a single race card's HTML. Kept as inlined function for
 * hot-path performance (no per-call closure allocation in v8).
 */
function buildRaceHTML(r) {
  const swimDist = fmtSwimDist(r.swim_m);
  const bikeDist = `${r.bike_km} km`;
  const runDist  = fmtRunDist(r.run_km);
  const name = t(`race.${r.id}.name`);
  const sub  = t(r.subKey);
  const transitionLabel = t('race.transition');

  return `<article class="race" data-tier="${r.tier}">
    <header class="race__head">
      <div>
        <div class="race__name">${name}</div>
        <div class="race__spec">${sub} · ${swimDist} / ${bikeDist} / ${runDist}</div>
      </div>
      <div class="race__total">
        <div class="race__total-label">${t('race.finish')}</div>
        <div class="race__total-value">${fmtTime(r.total, true)}</div>
      </div>
    </header>
    <div class="splits">
      <div class="split">
        <div class="split__leg split__leg--swim">${t('leg.swim')}</div>
        <div class="split__time">${fmtTime(r.swim)}</div>
        <div class="split__pace">${r.swimPaceStr}</div>
      </div>
      <div class="split">
        <div class="split__leg split__leg--t1">T1</div>
        <div class="split__time">${fmtTime(r.t1)}</div>
        <div class="split__pace">${transitionLabel}</div>
      </div>
      <div class="split">
        <div class="split__leg split__leg--bike">${t('leg.bike')}</div>
        <div class="split__time">${fmtTime(r.bike)}</div>
        <div class="split__pace">${r.bikeSpeedStr}</div>
      </div>
      <div class="split">
        <div class="split__leg split__leg--t2">T2</div>
        <div class="split__time">${fmtTime(r.t2)}</div>
        <div class="split__pace">${transitionLabel}</div>
      </div>
      <div class="split">
        <div class="split__leg split__leg--run">${t('leg.run')}</div>
        <div class="split__time">${fmtTime(r.run)}</div>
        <div class="split__pace">${r.runPaceStr}</div>
      </div>
    </div>
  </article>`;
}

/**
 * Synchronous render — called inside the rAF callback.
 */
function renderNow(state) {
  if (!mountNode) return;
  const key = cacheKey(state);
  if (key === lastRenderKey) return;
  lastRenderKey = key;

  const races = computeRaces(state);
  // Build once, write once
  const parts = new Array(races.length);
  for (let i = 0; i < races.length; i++) {
    parts[i] = buildRaceHTML(races[i]);
  }
  mountNode.innerHTML = parts.join('');
}

/**
 * Schedule a render on the next frame. Multiple calls within one frame
 * collapse into a single DOM update. This is the public render API.
 */
export function scheduleRender(state) {
  if (pendingFrame) return;
  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = 0;
    renderNow(state);
  });
}

/**
 * Force an immediate render — used at startup or when the user changes
 * language and we need the new strings to land in the same tick.
 */
export function renderImmediate(state) {
  if (pendingFrame) {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
  }
  // Bust the cache so language changes always re-render
  lastRenderKey = '';
  renderNow(state);
}
