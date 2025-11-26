import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CronEditor from './components/CronEditor';
import Examples from './pages/Examples';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="container">
            <div className="nav">
              <a className="kbd" href="/">Cron Guru Clone</a>
              <Link to="/examples">Examples</Link>
            </div>

            <h1 style={{ fontSize: 30, margin: '10px 0 6px' }}>Cron expression interpreter</h1>
            <p style={{ marginTop: 0, color: 'var(--muted)' }}>
              Validate cron schedules, translate them into plain language, and preview the next run times.
            </p>

            <CronEditor />

            <div className="footer">
              This is a minimal skeleton. Next steps: field-level UI, dialect support, presets, slugs, i18n.
            </div>
          </main>
        }
      />
      <Route path="/examples" element={<Examples />} />
    </Routes>
  );
}
