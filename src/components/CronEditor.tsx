import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

import { getNextRuns, normalizeExpr, shouldWarnDomDowOr, toHuman, type CronDialect } from '../lib/cron';

function defaultTz() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Singapore';
}

function getQuery(name: string) {
  return new URL(window.location.href).searchParams.get(name) || '';
}

function setQueryMerge(params: Record<string, string>) {
  const u = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  window.history.replaceState({}, '', u.toString());
}

type CronData =
  | { clean: string; human: string; warnDomDowOr: boolean; nextRuns: Date[] }
  | { clean: string; human: string; warnDomDowOr: boolean; error: string };

export default function CronEditor() {
  const { t } = useTranslation();

  const [expr, setExpr] = useState(getQuery('expr') || '*/5 * * * *');
  const [tz, setTz] = useState(getQuery('tz') || defaultTz());
  const [dialect, setDialect] = useState<CronDialect>((getQuery('dialect') as CronDialect) || 'crontab5');
  const [count, setCount] = useState(10);

  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const u = new URL(window.location.href);
    u.pathname = '/';
    u.searchParams.set('expr', expr);
    u.searchParams.set('tz', tz);
    u.searchParams.set('dialect', dialect);
    // lang/theme 已由 App 写入；这里仅保证存在时不丢
    if (!u.searchParams.get('lang')) u.searchParams.set('lang', i18n.language === 'en' ? 'en' : 'zh-CN');
    if (!u.searchParams.get('theme')) u.searchParams.set('theme', 'dark');
    return u.toString();
  }, [expr, tz, dialect]);

  const data = useMemo<CronData>(() => {
    const clean = normalizeExpr(expr);
    if (!clean) {
      return { clean, human: '', warnDomDowOr: false, error: t('emptyExpression') };
    }

    const warnDomDowOr = shouldWarnDomDowOr(clean);

    // cronstrue locale：zh_CN / en（best-effort）
    const locale = i18n.language === 'zh-CN' ? 'zh_CN' : 'en';
    let human = '';
    try {
      human = toHuman(clean, locale);
    } catch {
      human = '';
    }

    try {
      const nextRuns = getNextRuns(clean, tz, count, dialect);
      return { clean, human, warnDomDowOr, nextRuns };
    } catch (e: any) {
      return { clean, human, warnDomDowOr, error: e?.message || String(e) };
    }
  }, [expr, tz, count, dialect, t]);

  const parts = useMemo(() => normalizeExpr(expr).split(' ').filter(Boolean), [expr]);

  function syncUrl(nextExpr: string, nextTz: string, nextDialect: CronDialect) {
    setQueryMerge({ expr: nextExpr, tz: nextTz, dialect: nextDialect });
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="card">
      <div className="row">
        <div style={{ flex: '1 1 520px' }}>
          <div className="label">{t('cronExpression')}</div>
          <input
            className="input mono"
            value={expr}
            onChange={(e) => {
              const v = e.target.value;
              setExpr(v);
              syncUrl(v, tz, dialect);
            }}
            placeholder="*/5 * * * *"
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge mono">{t('fields')}: {parts.length}</span>
            <span className="badge">{t('fieldHint')}</span>
            {data.warnDomDowOr ? <span className="badge" title={t('domDowWarn')}>DOM/DOW OR</span> : null}
          </div>
        </div>

        <div style={{ width: 220 }}>
          <div className="label">{t('timezone')}</div>
          <input
            className="input"
            value={tz}
            onChange={(e) => {
              const v = e.target.value;
              setTz(v);
              syncUrl(expr, v, dialect);
            }}
            placeholder="Asia/Singapore"
          />
        </div>

        <div style={{ width: 120 }}>
          <div className="label">{t('next')}</div>
          <input
            className="input"
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={1}
            max={50}
          />
        </div>

        <div style={{ width: 170 }}>
          <div className="label">{t('dialect')}</div>
          <select
            className="input"
            value={dialect}
            onChange={(e) => {
              const v = e.target.value as CronDialect;
              setDialect(v);
              syncUrl(expr, tz, v);
            }}
          >
            <option value="crontab5">crontab (5 fields)</option>
            <option value="crontab6">crontab (6 fields)</option>
          </select>
          <small>* 6 fields is validated; runtime semantics may differ.</small>
        </div>
      </div>

      <hr />

      <div className="row" style={{ alignItems: 'center' }}>
        <div style={{ flex: '1 1 520px' }}>
          <div className="label">{t('normalized')}</div>
          <div className="mono">{data.clean}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="kbd">{t('shareUrl')}</span>
          <button className="btn" onClick={copyShare}>
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="label">{t('description')}</div>
        <div>{data.human ? data.human : <span style={{ opacity: 0.6 }}>—</span>}</div>
        {data.warnDomDowOr ? <div className="footer">{t('domDowWarn')}</div> : null}
      </div>

      {'error' in data ? (
        <div className="card error" style={{ marginTop: 12 }}>
          <div className="label">{t('validationError')}</div>
          <div>{data.error}</div>
        </div>
      ) : null}

      {'nextRuns' in data ? (
        <div style={{ marginTop: 12 }}>
          <div className="label">{t('nextRuns')} ({tz})</div>
          <ol>
            {data.nextRuns.map((d, i) => (
              <li key={i}>{d.toLocaleString(undefined, { timeZone: tz })}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
