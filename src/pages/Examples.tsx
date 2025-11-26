import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const examples = [
  { labelZh: '每分钟', labelEn: 'Every minute', expr: '* * * * *' },
  { labelZh: '每 5 分钟', labelEn: 'Every 5 minutes', expr: '*/5 * * * *' },
  { labelZh: '每小时（整点）', labelEn: 'Every hour (minute 0)', expr: '0 * * * *' },
  { labelZh: '每天 02:30', labelEn: 'Every day at 02:30', expr: '30 2 * * *' },
  { labelZh: '工作日 09:00', labelEn: 'Weekdays at 09:00', expr: '0 9 * * 1-5' },
  { labelZh: '每周一 09:00', labelEn: 'Every Monday at 09:00', expr: '0 9 * * 1' },
  { labelZh: '每月 1 号 00:00', labelEn: '1st day of month at 00:00', expr: '0 0 1 * *' }
];

export default function Examples() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  function load(expr: string) {
    const u = new URL(window.location.href);
    const params = u.searchParams;
    params.set('expr', expr);
    nav('/' + '?' + params.toString());
  }

  return (
    <main className="container">
      <div className="nav">
        <Link className="kbd" to="/">{t('back')}</Link>
        <span className="badge">{t('examples')}</span>
      </div>

      <h1 style={{ fontSize: 28, margin: '10px 0 6px' }}>{t('examples')}</h1>
      <p style={{ marginTop: 0, color: 'var(--muted)' }}>
        {i18n.language === 'zh-CN' ? '点击示例即可带入主页编辑器。' : 'Click an example to load it into the main editor.'}
      </p>

      <div className="card">
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {examples.map((e) => (
            <li key={e.expr} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => load(e.expr)}>
                <span>{i18n.language === 'zh-CN' ? e.labelZh : e.labelEn}</span>
                <span className="mono" style={{ color: 'var(--muted)' }}>{e.expr}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer">{t('domDowWarn')}</div>
    </main>
  );
}
