/**
 * Format helpers
 * ----------------------------------------------------------------
 * Pure functions for display-time formatting. Hot path — kept lean.
 */

/** Pad single digit with leading zero (faster than padStart for n<100). */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/**
 * Seconds → 'h:mm:ss' or 'mm:ss'.
 * @param {number} sec
 * @param {boolean} alwaysHours  force h:mm:ss even when h===0
 */
export function fmtTime(sec, alwaysHours = false) {
  if (!isFinite(sec) || sec <= 0) return '—';
  const r = Math.round(sec);
  const h = (r / 3600) | 0;
  const m = ((r % 3600) / 60) | 0;
  const s = r % 60;
  if (h > 0 || alwaysHours) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${pad2(s)}`;
}

/**
 * Format swim distance for race spec — '750 m' or '1.9 km'.
 */
export function fmtSwimDist(m) {
  return m >= 1000
    ? (m / 1000).toFixed(m % 1000 ? 1 : 0) + ' km'
    : m + ' m';
}

/**
 * Format run distance — integer kms or 2-decimal for half/full marathon.
 */
export function fmtRunDist(km) {
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(2)} km`;
}
