# Morning Dashboard Design

## Overview

A web-based morning dashboard for an iPad (landscape, always-on) that helps Carlos, Jenny, and the kids (Raphael & Lorelai) get out the door on time for school. Hosted on `dev.carlosmartinezt.com`.

## Architecture

**Vite + React SPA** served by a lightweight Express backend.

```
~/ipad-screen/
├── server/
│   ├── index.js          # Express server
│   ├── routes/
│   │   ├── weather.js    # Proxies Open-Meteo, 15-min cache
│   │   ├── calendar.js   # Fetches & parses iCal feeds
│   │   └── config.js     # Serves config.json
│   └── config.json       # Editable: friends, thresholds, school days off
├── src/
│   ├── App.jsx           # Main layout grid
│   ├── components/
│   │   ├── Clock.jsx         # Big digital clock, per-second updates
│   │   ├── Countdown.jsx     # School countdown bar + color transitions
│   │   ├── Weather.jsx       # Current conditions + today forecast
│   │   ├── Calendar.jsx      # Today's events from Google Calendar
│   │   └── Motivator.jsx     # Encouraging messages (config + random)
│   ├── hooks/
│   │   ├── useTime.js        # Second-by-second clock hook
│   │   └── usePolling.js     # Generic polling hook for API data
│   └── styles/
│       └── index.css         # Dark theme, CSS Grid layout
├── package.json
└── vite.config.js
```

## Components

### Clock

Largest element. Digital `HH:MM:SS`, monospace font, updates every second.

### Countdown

Minutes/seconds until "must leave" time (default 8:26, derived from doors close 8:36 minus 10-min walk). Full-width bar with color transitions:

- Green: > 10 min before leave time
- Yellow: 5-10 min
- Red: < 5 min
- Pulsing red + "RUN!" after leave time but before 8:36
- Hidden on weekends, school holidays (NYC DOE calendar), and after 8:36

All thresholds configurable in `config.json`.

### Weather

Open-Meteo API, polled every 15 min via Express proxy. Displays:

- Current temp in both Celsius (primary) and Fahrenheit
- Condition icon + description
- High/low for the day
- "Feels like" temperature
- Rain alert if precipitation expected in next 2 hours

### Calendar

Server fetches iCal feeds every 5 min. Shows today's events sorted by time. Compact list: `9:00 AM — Dentist`.

### Motivator

Two blended message sources:

1. **Config-based friends**: Each friend has a time window. If current time is within the window, show "Leave now and you might walk with Noah!"
2. **Random encouragement**: Reward-framed messages that rotate. Uses psychological principles: social proof, streak tracking, positive framing.

Messages only appear on school mornings before 8:36.

## config.json

```json
{
  "school": {
    "doorsCloseAt": "08:36",
    "walkMinutes": 10,
    "timezone": "America/New_York"
  },
  "thresholds": {
    "greenMinutes": 10,
    "yellowMinutes": 5
  },
  "calendars": [
    { "name": "Carlos & Jenny", "icalUrl": "https://calendar.google.com/..." }
  ],
  "friends": [
    { "name": "Noah", "windowStart": "08:10", "windowEnd": "08:20" },
    { "name": "Kate", "windowStart": "08:12", "windowEnd": "08:22" }
  ],
  "randomMessages": [
    "Early birds get the best spot in line!",
    "3 days on time this week — keep the streak going!",
    "The playground before school is the best part of the day!"
  ],
  "daysOff": ["2026-03-30", "2026-04-03"]
}
```

Editable directly on the server. App re-reads on each API request (no restart needed).

## Server

- Express serves Vite build (`dist/`) as static files
- `/api/weather` — Open-Meteo proxy with 15-min cache
- `/api/calendar` — iCal fetch + parse, returns today's events
- `/api/config` — serves config.json (re-read each request)
- Runs on port 3055

## Layout (Landscape iPad)

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              8:14:32              🌤️  7°C / 45°F   │
│                                                    │
│  ████████████ 12 min to go ████████████  (green)   │
│  "Leave now — you might walk with Noah!"           │
│                                                    │
│  ┌─────────────────┐  ┌────────────────────────┐   │
│  │ TODAY            │  │ WEATHER                │   │
│  │ 9:00 Dentist    │  │ Feels like: 3°C / 37°F │   │
│  │ 3:30 Chess      │  │ High: 11°C  Low: 2°C   │   │
│  │ 6:00 Dinner     │  │ Rain at 2pm            │   │
│  └─────────────────┘  └────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React 18, Vite, CSS Grid, dark theme
- **Backend**: Express.js, `ical.js` for calendar parsing
- **Weather**: Open-Meteo API (free, no API key)
- **Calendar**: Google Calendar private iCal URLs
- **Process**: `node server/index.js` (systemd or pm2 for production)

## Decisions

- Web app over native iPad app (simplicity, "Add to Home Screen" for fullscreen)
- Open-Meteo over OpenWeatherMap (no API key, free, comparable quality)
- iCal URL over Google OAuth (zero auth setup, sufficient for home dashboard)
- Vite + React over Next.js (lighter, no SSR needed) or vanilla JS (component model for future widgets)
- Dark theme (always-on screen, less eye strain)
- Celsius primary, Fahrenheit secondary

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-08 | Initial design document |
