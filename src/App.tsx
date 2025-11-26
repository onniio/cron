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
            <div className="nav">
              <a className="kbd" href="/">{t('appName')}</a>
              <Link to="/examples">{t('examples')}</Link>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <button className="btn" onClick={toggleLang}>
                  {i18n.language === 'zh-CN' ? '🇨🇳 中文' : '🇬🇧 English'}
                </button>
                <button className="btn" onClick={toggleTheme}>
                  {getTheme() === 'dark' ? '🌙 ' + t('dark') : '☀️ ' + t('light')}
                </button>
              </div>
            </div>

            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>

            <CronEditor />

            <div className="footer">
              💡 {i18n.language === 'zh-CN' 
                ? '分享链接会携带 expr/tz/dialect/lang/theme，保证他人打开后视图一致。' 
                : 'Shareable URLs include expr/tz/dialect/lang/theme parameters for consistent viewing.'}
            </div>
          </main>
        }
      />
      <Route path="/examples" element={<Examples />} />
    </Routes>
  );
}
