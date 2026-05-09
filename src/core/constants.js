/**
 * Domain constants
 * ----------------------------------------------------------------
 * All values are frozen at module load. Treat as compile-time data.
 */

export const YARD_TO_M = 0.9144;
export const MILE_TO_KM = 1.609344;

/**
 * Official triathlon distance specs.
 * @typedef {Object} RaceSpec
 * @property {string} id        machine ID
 * @property {string} tier      visual tier (drives accent stripe)
 * @property {string} subKey    i18n key for subtitle
 * @property {number} swim_m    swim distance in meters
 * @property {number} bike_km   bike distance in km
 * @property {number} run_km    run distance in km
 */
export const RACES = Object.freeze([
  Object.freeze({ id: 'sprint',  tier: 'sprint',  subKey: 'race.sprint.sub',  swim_m: 750,  bike_km: 20,  run_km: 5 }),
  Object.freeze({ id: 'olympic', tier: 'olympic', subKey: 'race.olympic.sub', swim_m: 1500, bike_km: 40,  run_km: 10 }),
  Object.freeze({ id: 'seventy', tier: 'seventy', subKey: 'race.seventy.sub', swim_m: 1900, bike_km: 90,  run_km: 21.0975 }),
  Object.freeze({ id: 'ironman', tier: 'ironman', subKey: 'race.ironman.sub', swim_m: 3800, bike_km: 180, run_km: 42.195 }),
]);

/** localStorage namespacing avoids collisions with other apps on the same origin */
export const STORAGE_KEYS = Object.freeze({
  LANG: 'trisplit:lang',
  THEME: 'trisplit:theme',
  STATE: 'trisplit:state:v1',
});

/** Default state values */
export const DEFAULTS = Object.freeze({
  swim: Object.freeze({ min: 1, sec: 35, unit: '100m' }),
  bike: Object.freeze({ speed: 32, unit: 'kmh' }),
  run:  Object.freeze({ min: 4, sec: 45, unit: 'km' }),
  t1: 2,
  t2: 1.5,
  lang: 'en',
  theme: 'dark',
});
