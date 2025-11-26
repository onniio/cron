import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const examples = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every hour (minute 0)', expr: '0 * * * *' },
  { label: 'Every day at 02:30', expr: '30 2 * * *' },
  { label: 'Weekdays at 09:00', expr: '0 9 * * 1-5' },
  { label: 'Every Monday at 09:00', expr: '0 9 * * 1' },
  { label: '1st day of month at 00:00', expr: '0 0 1 * *' },
];

export default function Examples() {
  const nav = useNavigate();

  function load(expr: string) {
    const u = new URL(window.location.href);
    u.pathname = '/';
    u.searchParams.set('expr', expr);
    nav(u.pathname + u.search);
  }

  return (
    <main className="container">
      <div className="nav">
        <Link className="kbd" to="/">← Back</Link>
        <span className="badge">Examples</span>
      </div>

      <h1 style={{ fontSize: 28, margin: '10px 0 6px' }}>Examples</h1>
      <p style={{ marginTop: 0, color: 'var(--muted)' }}>Click an example to load it into the main editor.</p>

      <div className="card">
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {examples.map((e) => (
            <li key={e.expr} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => load(e.expr)}>
                <span>{e.label}</span>
                <span className="mono" style={{ color: 'var(--muted)' }}>{e.expr}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer">
        Note: classic cron uses OR semantics between day-of-month and day-of-week when both are restricted.
      </div>
    </main>
  );
}
