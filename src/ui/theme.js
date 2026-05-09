/**
 * Theme
 * ----------------------------------------------------------------
 * Single source of truth for theme switching.
 * Applied via [data-theme] on <html> — CSS variables do the rest.
 */

export function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
}
