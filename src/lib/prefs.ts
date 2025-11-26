export const THEME_KEY = 'cron_theme';
export type Theme = 'dark' | 'light';

export function getQueryTheme(): Theme | null {
  try {
    const v = new URL(window.location.href).searchParams.get('theme');
    if (v === 'dark' || v === 'light') return v;
  } catch {}
  return null;
}

export function getTheme(): Theme {
  const v = localStorage.getItem(THEME_KEY);
  return v === 'light' ? 'light' : v === 'dark' ? 'dark' : 'light';
}

export function setTheme(t: Theme) {
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute('data-theme', t);
}

export function initTheme() {
  const q = getQueryTheme();
  if (q) setTheme(q);
  else setTheme(getTheme());
}
