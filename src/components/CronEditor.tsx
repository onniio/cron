import React, { useMemo, useState } from 'react';
import { domDowOrWarning, getNextRuns, normalizeExpr, toHuman, type CronDialect } from '../lib/cron';

function defaultTz() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Singapore';
}

function setQuery(params: Record<string, string>) {
  const u = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  window.history.replaceState({}, '', u.toString());
}

function getQuery(name: string) {
  return new URL(window.location.href).searchParams.get(name) || '';
}

export default function CronEditor() {
  const [expr, setExpr] = useState(getQuery('expr') || '*/5 * * * *');
  const [tz, setTz] = useState(getQuery('tz') || defaultTz());
  const [dialect, setDialect] = useState<CronDialect>((getQuery('dialect') as CronDialect) || 'crontab5');
  const [count, setCount] = useState(10);

  const shareUrl = useMemo(() => {
    const u = new URL(window.location.href);
    u.pathname = '/';
    u.searchParams.set('expr', expr);
    u.searchParams.set('tz', tz);
    u.searchParams.set('dialect', dialect);
    return u.toString();
  }, [expr, tz, dialect]);

  const data = useMemo(() => {
    const clean = normalizeExpr(expr);
    if (!clean) return { clean, error: 'Empty expression.' } as const;

    let human = '';
    try { human = toHuman(clean); } catch { human = ''; }

    try {
      const nextRuns = getNextRuns(clean, tz, count, dialect);
      return { clean, human, nextRuns, warning: domDowOrWarning(clean) } as const;
    } catch (e: any) {
      return { clean, human, error: e?.message || String(e), warning: domDowOrWarning(clean) } as const;
    }
  }, [expr, tz, count, dialect]);

  const parts = useMemo(() => normalizeExpr(expr).split(' ').filter(Boolean), [expr]);

  function syncUrl(nextExpr: string, nextTz: string, nextDialect: CronDialect) {
    setQuery({ expr: nextExpr, tz: nextTz, dialect: nextDialect });
  }

  async function copyShare() {
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
  }

  return (
    <div className="card">
      <div className="row">
        <div style={{ flex: '1 1 520px' }}>
          <div className="label">Cron Expression</div>
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
            <span className="badge mono">fields: {parts.length}</span>
            <span className="badge">minute hour dom month dow</span>
            {data.warning ? <span className="badge" title={data.warning}>DOM/DOW OR semantics</span> : null}
          </div>
        </div>

        <div style={{ width: 220 }}>
          <div className="label">Timezone</div>
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
          <div className="label">Next</div>
          <input className="input" type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} min={1} max={50} />
        </div>

        <div style={{ width: 170 }}>
          <div className="label">Dialect</div>
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
          <small>*6 fields is validated, but parsing rules may differ by runtime.</small>
        </div>
      </div>

      <hr />

      <div className="row" style={{ alignItems: 'center' }}>
        <div style={{ flex: '1 1 520px' }}>
          <div className="label">Normalized</div>
          <div className="mono">{data.clean}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="kbd">Shareable URL</span>
          <button className="btn" onClick={copyShare} title="Copy to clipboard">Copy</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="label">Description</div>
        <div>{data.human ? data.human : <span style={{ opacity: 0.6 }}>—</span>}</div>
      </div>

      {'error' in data ? (
        <div className="card error" style={{ marginTop: 12 }}>
          <div className="label">Validation Error</div>
          <div>{data.error}</div>
          {data.warning ? <div className="footer">{data.warning}</div> : null}
        </div>
      ) : null}

      {'nextRuns' in data ? (
        <div style={{ marginTop: 12 }}>
          <div className="label">Next Runs ({tz})</div>
          <ol>
            {data.nextRuns.map((d, i) => (
              <li key={i}>{d.toLocaleString(undefined, { timeZone: tz })}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="footer">
        Tip: If you plan to support Quartz/Spring, add a “dialect” switch and separate validators/parsers per syntax.
      </div>
    </div>
  );
}
