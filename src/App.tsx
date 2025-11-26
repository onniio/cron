import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CronEditor from './components/CronEditor';
import Examples from './pages/Examples';

import i18n, { LangStorageKey } from './i18n';
import { getTheme, setTheme, type Theme } from './lib/prefs';

function setQueryParam(key: string, value: string) {
  const u = new URL(window.location.href);
  u.searchParams.set(key, value);
  window.history.replaceState({}, '', u.toString());
}

function getQueryParam(key: string): string {
  return new URL(window.location.href).searchParams.get(key) || '';
}

export default function App() {
  const { t } = useTranslation();

  // On initial load: if URL carries lang/theme, honor it (and persist).
  React.useEffect(() => {
    const lang = getQueryParam('lang');
    if (lang === 'zh-CN' || lang === 'en') {
      if (i18n.language !== lang) i18n.changeLanguage(lang);
      localStorage.setItem(LangStorageKey, lang);
    }

    const theme = getQueryParam('theme');
    if (theme === 'dark' || theme === 'light') {
      setTheme(theme as Theme);
    }
  }, []);

  function toggleLang() {
    const next = i18n.language === 'zh-CN' ? 'en' : 'zh-CN';
    i18n.changeLanguage(next);
    localStorage.setItem(LangStorageKey, next);
    setQueryParam('lang', next);
  }

  function toggleTheme() {
    const cur = getTheme();
    const next: Theme = cur === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setQueryParam('theme', next);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="container">
            {/* Top bar */}
            <div className="nav">
              <a className="kbd" href="/">{t('appName')}</a>
              <Link to="/examples">{t('examples')}</Link>

              {/* Right-side controls */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <button className="btn" onClick={toggleLang}>
                  {t('language')}: {i18n.language === 'zh-CN' ? t('zh') : t('en')}
                </button>

                <button className="btn" onClick={toggleTheme}>
                  {t('theme')}: {getTheme() === 'dark' ? t('dark') : t('light')}
                </button>
              </div>
            </div>

            <h1 style={{ fontSize: 30, margin: '10px 0 6px' }}>{t('title')}</h1>
            <p style={{ marginTop: 0, color: 'var(--muted)' }}>{t('subtitle')}</p>

            <CronEditor />

            <div className="footer">
              Tip: URL carries expr/tz/dialect/lang/theme so others can reproduce your view.
            </div>
          </main>
        }
      />
      <Route path="/examples" element={<Examples />} />
    </Routes>
  );
}
