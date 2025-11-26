# Cron Guru Clone (Vite + React)

A small, deployable cron expression viewer inspired by crontab.guru:
- Validate cron expressions
- Human-readable description
- Next N run times (with time zone)
- Examples route
- Shareable URL via `/?expr=...&tz=...#...` (querystring-based)

## Requirements
- Node.js 18+ (recommended 20+)

## Install & Run
```bash
npm i
npm run dev -- --host 0.0.0.0 --port 5173
```

## Build & Preview
```bash
npm run build
npm run preview
```

## Deployment
- Cloudflare Pages / Netlify / Vercel (static): build command `npm run build`, output `dist`.
