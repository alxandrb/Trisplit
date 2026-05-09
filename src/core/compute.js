/**
 * Compute
 * ----------------------------------------------------------------
 * Pure functions only. Given identical state, always produce the
 * same output — enabling reliable memoization upstream.
 */

import { RACES, YARD_TO_M, MILE_TO_KM } from './constants.js';

/**
 * Swim pace (mm:ss + unit) → seconds per meter.
 * @returns {number} sec/m, or 0 if invalid
 */
export function swimSecPerMeter(swim) {
  const totalSec = (swim.min || 0) * 60 + (swim.sec || 0);
  if (totalSec <= 0) return 0;
  const meters = swim.unit === '100y' ? 100 * YARD_TO_M : 100;
  return totalSec / meters;
}

/**
 * Bike speed (value + unit) → seconds per km.
 * @returns {number} sec/km, or 0 if invalid
 */
export function bikeSecPerKm(bike) {
  let speed = bike.speed || 0;
  if (speed <= 0) return 0;
  if (bike.unit === 'mph') speed = speed * MILE_TO_KM;
  return 3600 / speed;
}

/**
 * Run pace (mm:ss + unit) → seconds per km.
 * @returns {number} sec/km, or 0 if invalid
 */
export function runSecPerKm(run) {
  const totalSec = (run.min || 0) * 60 + (run.sec || 0);
  if (totalSec <= 0) return 0;
  return run.unit === 'mi' ? totalSec / MILE_TO_KM : totalSec;
}

/**
 * Compute all race projections for the given input state.
 * Returns a stable shape consumed directly by the renderer.
 *
 * @param {Object} state
 * @returns {Array<RaceResult>}
 */
export function computeRaces(state) {
  const swimPM = swimSecPerMeter(state.swim);
  const bikePK = bikeSecPerKm(state.bike);
  const runPK  = runSecPerKm(state.run);
  const t1Sec  = (state.t1 || 0) * 60;
  const t2Sec  = (state.t2 || 0) * 60;

  // Pre-compute display strings once per render
  const swimPaceStr = formatSwimPace(swimPM, state.swim.unit);
  const bikeSpeedStr = formatBikeSpeed(bikePK, state.bike.unit);
  const runPaceStr = formatRunPace(runPK, state.run.unit);

  // Map over races — returns new array, but RACES entries are frozen
  const out = new Array(RACES.length);
  for (let i = 0; i < RACES.length; i++) {
    const r = RACES[i];
    const swim = swimPM * r.swim_m;
    const bike = bikePK * r.bike_km;
    const run  = runPK  * r.run_km;
    out[i] = {
      id: r.id,
      tier: r.tier,
      subKey: r.subKey,
      swim_m: r.swim_m,
      bike_km: r.bike_km,
      run_km: r.run_km,
      swim,
      bike,
      run,
      t1: t1Sec,
      t2: t2Sec,
      total: swim + t1Sec + bike + t2Sec + run,
      swimPaceStr,
      bikeSpeedStr,
      runPaceStr,
    };
  }
  return out;
}

/**
 * Display helpers (lifted here because they consume domain knowledge,
 * not just generic time formatting which lives in ui/format.js).
 */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function formatPaceMS(sec) {
  if (!isFinite(sec) || sec <= 0) return '—';
  const r = Math.round(sec);
  return `${Math.floor(r / 60)}:${pad2(r % 60)}`;
}

function formatSwimPace(secPerMeter, unit) {
  if (!secPerMeter) return '—';
  const per100 = unit === '100y'
    ? secPerMeter * (100 * YARD_TO_M)
    : secPerMeter * 100;
  const label = unit === '100y' ? '/100y' : '/100m';
  return `${formatPaceMS(per100)} ${label}`;
}

function formatBikeSpeed(secPerKm, unit) {
  if (!secPerKm) return '—';
  const kmh = 3600 / secPerKm;
  if (unit === 'mph') return `${(kmh / MILE_TO_KM).toFixed(1)} mph`;
  return `${kmh.toFixed(1)} km/h`;
}

function formatRunPace(secPerKm, unit) {
  if (!secPerKm) return '—';
  if (unit === 'mi') return `${formatPaceMS(secPerKm * MILE_TO_KM)} /mi`;
  return `${formatPaceMS(secPerKm)} /km`;
}
