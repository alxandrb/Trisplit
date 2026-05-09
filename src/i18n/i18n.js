/**
 * i18n
 * ----------------------------------------------------------------
 * Tiny translation layer. Resolves keys against the active dictionary
 * and applies them to any element marked with [data-i18n].
 */

import { STRINGS } from './strings.js';

/** Pre-cached lookups — bound at applyTranslations time. */
let activeDict = STRINGS.en;
let activeLang = 'en';

/** Resolve a key to its localized string (falls back to the key itself). */
export function t(key) {
  return activeDict[key] || key;
}

/** Currently active language code ('en' | 'fr') */
export function currentLang() {
  return activeLang;
}

/**
 * Switch language and update all DOM nodes carrying [data-i18n].
 * One pass over the document — cheap even with many nodes.
 *
 * @param {'en'|'fr'} lang
 * @param {Object} dynamicHints  optional callback hooks for unit-dependent text
 */
export function applyI18n(lang, dynamicHints) {
  activeLang = lang === 'fr' ? 'fr' : 'en';
  activeDict = STRINGS[activeLang];

  // Update <html lang> for accessibility & font hinting
  document.documentElement.lang = activeLang;

  // Walk all i18n-flagged nodes — single live NodeList iteration
  const nodes = document.querySelectorAll('[data-i18n]');
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    el.textContent = t(el.dataset.i18n);
  }

  // Unit-dependent hints handled by caller (knows current units)
  if (dynamicHints) dynamicHints(t);
}
