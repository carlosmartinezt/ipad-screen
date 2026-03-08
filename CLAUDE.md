# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A morning dashboard PWA designed to run on an iPad. Shows a clock, school departure countdown, motivational messages, weather, and calendar events. Built for a kid's school morning routine.

## Commands

- `npm run dev` — Start Vite dev server on 0.0.0.0 (frontend only, proxies `/api` to port 3055)
- `npm run server` — Start Express backend on port 3055 (serves API + built frontend)
- `npm run build` — Build frontend to `dist/`
- `npm start` — Build then start server (production)

For development, run both `npm run dev` and `npm run server` in parallel.

There are no tests or linting configured.

## Architecture

**Frontend:** React 19 + Vite 7, no TypeScript, no state management library. Plain `.jsx` files.

**Backend:** Express 5 (ESM) on port 3055 with three API routes:
- `/api/config` — Serves `server/config.json` (strips `calendars` array for security)
- `/api/weather` — Proxies Open-Meteo API with 15-min cache (hardcoded NYC coordinates)
- `/api/calendar` — Fetches iCal feeds from config, parses with `ical.js`, returns today's events (5-min cache)

**Data flow:** Components poll APIs via `usePolling(url, intervalMs)` hook. `useTime()` re-renders every second for live clock/countdown. No WebSocket, no SSR.

**Configuration:** `server/config.json` holds all runtime config: school schedule, countdown thresholds, calendar URLs, friend arrival windows, motivational messages, days off. This file is read from disk on each request (not cached by the config route).

**Timezone handling:** All time logic uses `America/New_York` timezone via `toLocaleDateString`/`toLocaleTimeString` with `timeZone` option. The `parseTime()` helper in Countdown.jsx converts "HH:MM" strings to timezone-aware Date objects.

**Production:** Built frontend served as static files by Express. PWA manifest at `public/manifest.json`. Systemd service config exists in `docs/plans/`.

## Workflow

- When changes are ready, always merge them into `master` (not `main`) so they deploy. Don't leave work only on feature branches.
- After merging, create a PR if possible, or merge locally and push `master` directly.
