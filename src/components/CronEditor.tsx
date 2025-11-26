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
    if (!u.searchParams.get('lang')) u.searchParams.set('lang', i18n.language === 'en' ? 'en' : 'zh-CN');
    if (!u.searchParams.get('theme')) u.searchParams.set('theme', 'light');
    return u.toString();
  }, [expr, tz, dialect]);

  const data = useMemo<CronData>(() => {
    const clean = normalizeExpr(expr);
    if (!clean) {
      return { clean, human: '', warnDomDowOr: false, error: t('emptyExpression') };
    }

    const warnDomDowOr = shouldWarnDomDowOr(clean);

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
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      {/* Main Input Section */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <label className="label">{t('cronExpression')}</label>
          <input
            className="input mono"
            value={expr}
            onChange={(e) => {
              const v = e.target.value;
              setExpr(v);
              syncUrl(v, tz, dialect);
            }}
            placeholder="*/5 * * * *"
            style={{ fontSize: 16 }}
          />
        </div>

        <div className="row">
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">{t('timezone')}</label>
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

          <div style={{ width: 140 }}>
            <label className="label">{t('dialect')}</label>
            <select
              className="input"
              value={dialect}
              onChange={(e) => {
                const v = e.target.value as CronDialect;
                setDialect(v);
                syncUrl(expr, tz, v);
              }}
            >
              <option value="crontab5">5 fields</option>
              <option value="crontab6">6 fields</option>
            </select>
          </div>

          <div style={{ width: 100 }}>
            <label className="label">{t('next')}</label>
            <input
              className="input"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={50}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge mono">{parts.length} {t('fields')}</span>
          <span className="badge">{t('fieldHint')}</span>
          {data.warnDomDowOr && (
            <span className="badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              DOM/DOW OR
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={copyShare}>
              {copied ? '✓ ' + t('copied') : t('copy') + ' ' + t('shareUrl')}
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {data.human && (
        <div className="card">
          <div className="label">{t('description')}</div>
          <div className="description-text">{data.human}</div>
          {data.warnDomDowOr && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              ℹ️ {t('domDowWarn')}
            </div>
          )}
        </div>
      )}

      {/* Error Section */}
      {'error' in data && (
        <div className="card error">
          <div className="label">{t('validationError')}</div>
          <div style={{ color: 'var(--danger)', fontWeight: 500 }}>{data.error}</div>
        </div>
      )}

      {/* Next Runs Section */}
      {'nextRuns' in data && data.nextRuns.length > 0 && (
        <div className="card">
          <div className="label">{t('nextRuns')} ({tz})</div>
          <ol style={{ margin: '12px 0 0 20px' }}>
            {data.nextRuns.map((d, i) => (
              <li key={i} style={{ padding: '4px 0' }}>
                {d.toLocaleString(undefined, { timeZone: tz })}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
