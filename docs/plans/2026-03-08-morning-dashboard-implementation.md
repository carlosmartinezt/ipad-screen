# Morning Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based morning dashboard for iPad that shows a live clock, school countdown with color-coded urgency, weather, calendar events, and motivational messages.

**Architecture:** Vite + React SPA served by an Express backend. Express proxies Open-Meteo weather, parses Google Calendar iCal feeds, and serves an editable config.json. Frontend polls APIs and renders widgets in a CSS Grid dark-theme layout.

**Tech Stack:** React 18, Vite, Express.js, ical.js, Open-Meteo API, CSS Grid

---

### Task 1: Project Scaffolding

**Files:**
- Create: `~/ipad-screen/package.json`
- Create: `~/ipad-screen/vite.config.js`
- Create: `~/ipad-screen/index.html`
- Create: `~/ipad-screen/src/main.jsx`
- Create: `~/ipad-screen/src/App.jsx`
- Create: `~/ipad-screen/src/styles/index.css`
- Create: `~/ipad-screen/.gitignore`

**Step 1: Initialize project and install dependencies**

```bash
cd ~/ipad-screen
npm init -y
npm install react react-dom express ical.js cors
npm install -D vite @vitejs/plugin-react
```

**Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3055'
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <title>Morning Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

**Step 4: Create src/main.jsx with minimal App**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

```jsx
// src/App.jsx
export default function App() {
  return <div className="dashboard">Morning Dashboard</div>
}
```

**Step 5: Create base CSS with dark theme**

```css
/* src/styles/index.css */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

#root { height: 100%; width: 100%; }

.dashboard {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  height: 100vh;
  padding: 2vh 3vw;
  gap: 2vh;
}
```

**Step 6: Create .gitignore**

```
node_modules/
dist/
.DS_Store
```

**Step 7: Verify dev server starts**

```bash
cd ~/ipad-screen
npx vite --host 0.0.0.0 &
# Visit http://localhost:5173 — should show "Morning Dashboard"
# Kill with: kill %1
```

**Step 8: Commit**

```bash
cd ~/ipad-screen
git add -A
git commit -m "feat: scaffold Vite + React project with dark theme"
```

---

### Task 2: Clock Component

**Files:**
- Create: `~/ipad-screen/src/hooks/useTime.js`
- Create: `~/ipad-screen/src/components/Clock.jsx`
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Create useTime hook**

```js
// src/hooks/useTime.js
import { useState, useEffect } from 'react'

export function useTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}
```

**Step 2: Create Clock component**

```jsx
// src/components/Clock.jsx
import { useTime } from '../hooks/useTime'

export default function Clock() {
  const now = useTime()

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  })

  return <div className="clock">{time}</div>
}
```

**Step 3: Add Clock to App and add CSS**

```jsx
// src/App.jsx
import Clock from './components/Clock'

export default function App() {
  return (
    <div className="dashboard">
      <Clock />
    </div>
  )
}
```

Add to `src/styles/index.css`:

```css
.clock {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 12vw;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.05em;
  color: #ffffff;
}
```

**Step 4: Verify clock ticks every second in browser**

```bash
cd ~/ipad-screen && npx vite --host 0.0.0.0 &
# Visit http://localhost:5173 — big clock should tick every second
# Kill with: kill %1
```

**Step 5: Commit**

```bash
cd ~/ipad-screen
git add src/hooks/useTime.js src/components/Clock.jsx src/App.jsx src/styles/index.css
git commit -m "feat: add real-time clock component"
```

---

### Task 3: Config File and Config API

**Files:**
- Create: `~/ipad-screen/server/config.json`
- Create: `~/ipad-screen/server/routes/config.js`
- Create: `~/ipad-screen/server/index.js`

**Step 1: Create config.json with defaults**

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
  "calendars": [],
  "friends": [
    { "name": "Noah", "windowStart": "08:10", "windowEnd": "08:20" },
    { "name": "Kate", "windowStart": "08:12", "windowEnd": "08:22" }
  ],
  "randomMessages": [
    "Early birds get the best spot in line!",
    "The playground before school is the best part of the day!",
    "Walking together is way more fun than running alone!",
    "On-time kids get to pick their favourite seat!",
    "Champions are always ready before the bell!"
  ],
  "daysOff": []
}
```

**Step 2: Create config route**

```js
// server/routes/config.js
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', 'config.json')

export default function configRoute(req, res) {
  try {
    const raw = readFileSync(configPath, 'utf-8')
    res.json(JSON.parse(raw))
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config' })
  }
}
```

**Step 3: Create Express server**

```js
// server/index.js
import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import configRoute from './routes/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3055

app.get('/api/config', configRoute)

// Serve static build in production
const distPath = join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`)
})
```

**Step 4: Add `"type": "module"` to package.json and add scripts**

In `package.json`, ensure:
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "server": "node server/index.js",
    "start": "npm run build && npm run server"
  }
}
```

**Step 5: Verify config endpoint**

```bash
cd ~/ipad-screen
node server/index.js &
curl http://localhost:3055/api/config | head -5
# Should print the config JSON
kill %1
```

**Step 6: Commit**

```bash
cd ~/ipad-screen
git add server/ package.json
git commit -m "feat: add Express server with config API"
```

---

### Task 4: Weather API Route and Component

**Files:**
- Create: `~/ipad-screen/server/routes/weather.js`
- Create: `~/ipad-screen/src/hooks/usePolling.js`
- Create: `~/ipad-screen/src/components/Weather.jsx`
- Modify: `~/ipad-screen/server/index.js`
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Create weather route with 15-min cache**

```js
// server/routes/weather.js
let cache = { data: null, timestamp: 0 }
const CACHE_MS = 15 * 60 * 1000
const LAT = 40.7831  // Upper West Side NYC
const LON = -73.9712

export default async function weatherRoute(req, res) {
  const now = Date.now()
  if (cache.data && now - cache.timestamp < CACHE_MS) {
    return res.json(cache.data)
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=precipitation_probability&temperature_unit=celsius&timezone=America%2FNew_York&forecast_days=1`
    const resp = await fetch(url)
    const json = await resp.json()
    cache = { data: json, timestamp: now }
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed' })
  }
}
```

**Step 2: Register weather route in server/index.js**

Add import and route:
```js
import weatherRoute from './routes/weather.js'
// ...
app.get('/api/weather', weatherRoute)
```

**Step 3: Create usePolling hook**

```js
// src/hooks/usePolling.js
import { useState, useEffect } from 'react'

export function usePolling(url, intervalMs) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    const doFetch = async () => {
      try {
        const res = await fetch(url)
        const json = await res.json()
        if (active) setData(json)
      } catch (err) {
        console.error(`Polling ${url} failed:`, err)
      }
    }
    doFetch()
    const id = setInterval(doFetch, intervalMs)
    return () => { active = false; clearInterval(id) }
  }, [url, intervalMs])

  return data
}
```

**Step 4: Create Weather component**

The component should:
- Show current temp as `7°C / 45°F`
- Map WMO weather codes to emoji icons and descriptions
- Show feels-like, high/low
- Show rain alert if precipitation probability > 30% in next 2 hours

```jsx
// src/components/Weather.jsx
import { usePolling } from '../hooks/usePolling'

const WMO_CODES = {
  0: ['☀️', 'Clear sky'],
  1: ['🌤️', 'Mostly clear'],
  2: ['⛅', 'Partly cloudy'],
  3: ['☁️', 'Overcast'],
  45: ['🌫️', 'Foggy'],
  48: ['🌫️', 'Icy fog'],
  51: ['🌦️', 'Light drizzle'],
  53: ['🌦️', 'Drizzle'],
  55: ['🌧️', 'Heavy drizzle'],
  61: ['🌧️', 'Light rain'],
  63: ['🌧️', 'Rain'],
  65: ['🌧️', 'Heavy rain'],
  66: ['🌨️', 'Freezing rain'],
  67: ['🌨️', 'Heavy freezing rain'],
  71: ['🌨️', 'Light snow'],
  73: ['❄️', 'Snow'],
  75: ['❄️', 'Heavy snow'],
  77: ['🌨️', 'Snow grains'],
  80: ['🌦️', 'Light showers'],
  81: ['🌧️', 'Showers'],
  82: ['⛈️', 'Heavy showers'],
  85: ['🌨️', 'Snow showers'],
  86: ['🌨️', 'Heavy snow showers'],
  95: ['⛈️', 'Thunderstorm'],
  96: ['⛈️', 'Thunderstorm + hail'],
  99: ['⛈️', 'Severe thunderstorm'],
}

function cToF(c) {
  return Math.round(c * 9 / 5 + 32)
}

function formatTemp(c) {
  return `${Math.round(c)}°C / ${cToF(c)}°F`
}

export default function Weather() {
  const data = usePolling('/api/weather', 15 * 60 * 1000)

  if (!data || !data.current) return <div className="weather">Loading weather...</div>

  const { temperature_2m, apparent_temperature, weather_code } = data.current
  const [icon, description] = WMO_CODES[weather_code] || ['🌡️', 'Unknown']
  const high = data.daily?.temperature_2m_max?.[0]
  const low = data.daily?.temperature_2m_min?.[0]

  // Check rain in next 2 hours
  const nowHour = new Date().getHours()
  const precipProbs = data.hourly?.precipitation_probability?.slice(nowHour, nowHour + 2) || []
  const rainSoon = precipProbs.some(p => p > 30)

  return (
    <div className="weather">
      <div className="weather-current">
        <span className="weather-icon">{icon}</span>
        <span className="weather-temp">{formatTemp(temperature_2m)}</span>
      </div>
      <div className="weather-details">
        <div>{description}</div>
        <div>Feels like {formatTemp(apparent_temperature)}</div>
        {high != null && low != null && (
          <div>H: {Math.round(high)}°C &nbsp; L: {Math.round(low)}°C</div>
        )}
        {rainSoon && <div className="weather-rain-alert">🌧️ Rain expected soon — grab an umbrella!</div>}
      </div>
    </div>
  )
}
```

**Step 5: Add Weather to App layout and add CSS**

Update `src/App.jsx` to include Weather in a bottom grid. Add weather styles to `src/styles/index.css`:

```css
.weather {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2vh 2vw;
}

.weather-current {
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 1vh;
}

.weather-icon { font-size: 4vh; }
.weather-temp { font-size: 3vh; font-weight: 600; }

.weather-details {
  font-size: 2vh;
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  gap: 0.5vh;
}

.weather-rain-alert {
  color: #5cacee;
  font-weight: 600;
}
```

**Step 6: Verify weather shows in browser**

```bash
cd ~/ipad-screen
node server/index.js &
npx vite --host 0.0.0.0 &
# Visit http://localhost:5173 — should show clock + weather data
kill %1 %2
```

**Step 7: Commit**

```bash
cd ~/ipad-screen
git add server/routes/weather.js src/hooks/usePolling.js src/components/Weather.jsx src/App.jsx src/styles/index.css server/index.js
git commit -m "feat: add weather widget with Open-Meteo integration"
```

---

### Task 5: Countdown Component

**Files:**
- Create: `~/ipad-screen/src/components/Countdown.jsx`
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Create Countdown component**

The component needs to:
- Fetch config for thresholds and school times
- Calculate "must leave by" time (doorsCloseAt minus walkMinutes)
- Show minutes/seconds remaining with color-coded bar
- Hide on weekends, days off, and after doors close
- Show "RUN!" mode between leave time and doors close time

```jsx
// src/components/Countdown.jsx
import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

function parseTime(timeStr, now) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  return d
}

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function formatDateStr(date) {
  return date.toISOString().split('T')[0]
}

export default function Countdown() {
  const now = useTime()
  const config = usePolling('/api/config', 60 * 1000)

  if (!config) return null

  const { school, thresholds, daysOff } = config
  const tz = school.timezone

  // Get current time in target timezone
  const tzNow = new Date(now.toLocaleString('en-US', { timeZone: tz }))

  if (isWeekend(tzNow)) return null
  if (daysOff?.includes(formatDateStr(tzNow))) return null

  const doorsClose = parseTime(school.doorsCloseAt, tzNow)
  const leaveBy = new Date(doorsClose.getTime() - school.walkMinutes * 60 * 1000)

  // After doors close — hide
  if (tzNow > doorsClose) return null

  const msLeft = leaveBy.getTime() - tzNow.getTime()
  const minLeft = msLeft / 60000
  const pastLeaveTime = msLeft < 0

  // Determine color
  let color = '#22c55e' // green
  let label = ''

  if (pastLeaveTime) {
    const msToDoors = doorsClose.getTime() - tzNow.getTime()
    const minToDoors = Math.ceil(msToDoors / 60000)
    color = '#ef4444'
    label = `RUN! ${minToDoors} min until doors close!`
  } else if (minLeft <= thresholds.yellowMinutes) {
    color = '#ef4444' // red
    const min = Math.floor(minLeft)
    const sec = Math.floor((msLeft % 60000) / 1000)
    label = `${min}:${sec.toString().padStart(2, '0')} — GO GO GO!`
  } else if (minLeft <= thresholds.greenMinutes) {
    color = '#eab308' // yellow
    const min = Math.floor(minLeft)
    const sec = Math.floor((msLeft % 60000) / 1000)
    label = `${min}:${sec.toString().padStart(2, '0')} until time to leave`
  } else {
    const min = Math.floor(minLeft)
    label = `${min} min until time to leave`
  }

  // Progress bar: percentage of time consumed (from greenMinutes to 0)
  const totalWindow = thresholds.greenMinutes * 60 * 1000
  const elapsed = totalWindow - msLeft
  const progress = pastLeaveTime ? 100 : Math.max(0, Math.min(100, (elapsed / totalWindow) * 100))

  return (
    <div className={`countdown ${pastLeaveTime ? 'countdown-pulse' : ''}`}>
      <div className="countdown-bar" style={{ backgroundColor: color, width: `${progress}%` }} />
      <div className="countdown-label">{label}</div>
    </div>
  )
}
```

**Step 2: Add Countdown to App**

Update `src/App.jsx` to render `<Countdown />` between Clock and the bottom panels.

**Step 3: Add countdown CSS**

```css
.countdown {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.8rem;
  overflow: hidden;
  height: 6vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 1s linear, background-color 0.5s;
  opacity: 0.3;
}

.countdown-label {
  position: relative;
  z-index: 1;
  font-size: 2.5vh;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.countdown-pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**Step 4: Verify countdown in browser**

Test by temporarily changing `doorsCloseAt` in config.json to a time a few minutes from now.

**Step 5: Commit**

```bash
cd ~/ipad-screen
git add src/components/Countdown.jsx src/App.jsx src/styles/index.css
git commit -m "feat: add school countdown with color-coded urgency bar"
```

---

### Task 6: Calendar API Route and Component

**Files:**
- Create: `~/ipad-screen/server/routes/calendar.js`
- Create: `~/ipad-screen/src/components/Calendar.jsx`
- Modify: `~/ipad-screen/server/index.js`
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Create calendar route**

```js
// server/routes/calendar.js
import ICAL from 'ical.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', 'config.json')

let cache = { data: null, timestamp: 0 }
const CACHE_MS = 5 * 60 * 1000

export default async function calendarRoute(req, res) {
  const now = Date.now()
  if (cache.data && now - cache.timestamp < CACHE_MS) {
    return res.json(cache.data)
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    const events = []

    for (const cal of config.calendars) {
      try {
        const resp = await fetch(cal.icalUrl)
        const text = await resp.text()
        const jcal = ICAL.parse(text)
        const comp = new ICAL.Component(jcal)
        const vevents = comp.getAllSubcomponents('vevent')

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        for (const vevent of vevents) {
          const event = new ICAL.Event(vevent)
          const start = event.startDate.toJSDate()

          if (start >= today && start < tomorrow) {
            events.push({
              summary: event.summary,
              start: start.toISOString(),
              calendar: cal.name
            })
          }
        }
      } catch (err) {
        console.error(`Failed to fetch calendar ${cal.name}:`, err.message)
      }
    }

    events.sort((a, b) => new Date(a.start) - new Date(b.start))
    cache = { data: events, timestamp: now }
    res.json(events)
  } catch (err) {
    res.status(500).json({ error: 'Calendar fetch failed' })
  }
}
```

**Step 2: Register calendar route in server/index.js**

```js
import calendarRoute from './routes/calendar.js'
// ...
app.get('/api/calendar', calendarRoute)
```

**Step 3: Create Calendar component**

```jsx
// src/components/Calendar.jsx
import { usePolling } from '../hooks/usePolling'

export default function Calendar() {
  const events = usePolling('/api/calendar', 5 * 60 * 1000)

  return (
    <div className="calendar">
      <h2 className="widget-title">📅 Today</h2>
      {!events && <div className="calendar-loading">Loading...</div>}
      {events && events.length === 0 && <div className="calendar-empty">No events today</div>}
      {events && events.length > 0 && (
        <ul className="calendar-list">
          {events.map((e, i) => {
            const time = new Date(e.start).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/New_York'
            })
            return (
              <li key={i} className="calendar-event">
                <span className="calendar-time">{time}</span>
                <span className="calendar-summary">{e.summary}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

**Step 4: Add Calendar to App and add CSS**

```css
.calendar, .weather {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2vh 2vw;
}

.widget-title {
  font-size: 2.2vh;
  margin-bottom: 1.5vh;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.calendar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1vh;
}

.calendar-event {
  display: flex;
  gap: 1.5vw;
  font-size: 2vh;
}

.calendar-time {
  font-weight: 600;
  white-space: nowrap;
  opacity: 0.9;
}

.calendar-summary { opacity: 0.8; }
.calendar-empty, .calendar-loading { opacity: 0.5; font-size: 2vh; }
```

**Step 5: Verify calendar endpoint returns empty array (no calendars configured yet)**

```bash
cd ~/ipad-screen
node server/index.js &
curl http://localhost:3055/api/calendar
# Should return []
kill %1
```

**Step 6: Commit**

```bash
cd ~/ipad-screen
git add server/routes/calendar.js src/components/Calendar.jsx src/App.jsx src/styles/index.css server/index.js
git commit -m "feat: add calendar widget with iCal feed support"
```

---

### Task 7: Motivator Component

**Files:**
- Create: `~/ipad-screen/src/components/Motivator.jsx`
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Create Motivator component**

Logic:
1. On school mornings before doors close, pick a message
2. Check if any friends are in their time window — if so, show friend message
3. Otherwise pick a random encouraging message
4. Rotate random messages every 30 seconds so it doesn't feel static

```jsx
// src/components/Motivator.jsx
import { useState, useEffect } from 'react'
import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

function parseTime(timeStr, now) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  return d
}

export default function Motivator() {
  const now = useTime()
  const config = usePolling('/api/config', 60 * 1000)
  const [randomIndex, setRandomIndex] = useState(0)

  // Rotate random message every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setRandomIndex(prev => prev + 1)
    }, 30000)
    return () => clearInterval(id)
  }, [])

  if (!config) return null

  const { school, friends, randomMessages, daysOff } = config
  const tzNow = new Date(now.toLocaleString('en-US', { timeZone: school.timezone }))

  // Only show on school mornings
  const day = tzNow.getDay()
  if (day === 0 || day === 6) return null
  if (daysOff?.includes(tzNow.toISOString().split('T')[0])) return null

  const doorsClose = parseTime(school.doorsCloseAt, tzNow)
  if (tzNow > doorsClose) return null

  // Check for friends in their window
  const availableFriends = (friends || []).filter(f => {
    const start = parseTime(f.windowStart, tzNow)
    const end = parseTime(f.windowEnd, tzNow)
    return tzNow >= start && tzNow <= end
  })

  let message = ''
  if (availableFriends.length > 0) {
    const names = availableFriends.map(f => f.name)
    if (names.length === 1) {
      message = `Leave now and you might walk with ${names[0]}! 🚶‍♂️`
    } else {
      message = `Leave now and you might catch ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}! 🚶‍♂️`
    }
  } else if (randomMessages && randomMessages.length > 0) {
    message = randomMessages[randomIndex % randomMessages.length]
  }

  if (!message) return null

  return <div className="motivator">{message}</div>
}
```

**Step 2: Add Motivator to App below Countdown**

**Step 3: Add motivator CSS**

```css
.motivator {
  text-align: center;
  font-size: 2.5vh;
  font-style: italic;
  opacity: 0.85;
  padding: 0.5vh 0;
  transition: opacity 0.3s;
}
```

**Step 4: Verify motivator shows messages in browser**

Test by adjusting friend time windows in config.json to match current time.

**Step 5: Commit**

```bash
cd ~/ipad-screen
git add src/components/Motivator.jsx src/App.jsx src/styles/index.css
git commit -m "feat: add motivator with friend alerts and rotating encouragement"
```

---

### Task 8: Full Layout Assembly

**Files:**
- Modify: `~/ipad-screen/src/App.jsx`
- Modify: `~/ipad-screen/src/styles/index.css`

**Step 1: Assemble final App layout**

```jsx
// src/App.jsx
import Clock from './components/Clock'
import Countdown from './components/Countdown'
import Motivator from './components/Motivator'
import Weather from './components/Weather'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="dashboard">
      <div className="top-row">
        <Clock />
        <Weather />
      </div>
      <Countdown />
      <Motivator />
      <div className="bottom-row">
        <Calendar />
      </div>
    </div>
  )
}
```

**Step 2: Finalize CSS grid layout**

```css
.dashboard {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  height: 100vh;
  padding: 2vh 3vw;
  gap: 2vh;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2vw;
  overflow: hidden;
}
```

Adjust Clock and Weather to sit side-by-side — clock on the left (larger), weather on the right (compact).

**Step 3: Test full layout on an iPad-sized viewport**

Use Chrome DevTools responsive mode at 1024x768 (iPad landscape).

**Step 4: Commit**

```bash
cd ~/ipad-screen
git add src/App.jsx src/styles/index.css
git commit -m "feat: assemble full dashboard layout with all widgets"
```

---

### Task 9: Production Build and Deployment

**Files:**
- Modify: `~/ipad-screen/package.json`

**Step 1: Build the frontend**

```bash
cd ~/ipad-screen
npm run build
```

Verify `dist/` directory is created with bundled assets.

**Step 2: Test production mode**

```bash
cd ~/ipad-screen
node server/index.js &
curl http://localhost:3055
# Should return the HTML page
kill %1
```

**Step 3: Create a systemd service (optional, for auto-start)**

```bash
cat > ~/.config/systemd/user/ipad-screen.service << 'EOF'
[Unit]
Description=Morning Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/carlos/ipad-screen
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable ipad-screen
systemctl --user start ipad-screen
```

**Step 4: Verify the service is running**

```bash
systemctl --user status ipad-screen
curl http://localhost:3055
```

**Step 5: Commit**

```bash
cd ~/ipad-screen
git add -A
git commit -m "feat: add production build and systemd service"
```

---

### Task 10: Final Polish and iPad Testing

**Step 1: Add viewport meta and PWA manifest for fullscreen**

Ensure `index.html` has proper meta tags for iPad fullscreen experience. Add a simple `manifest.json` for "Add to Home Screen" support.

**Step 2: Test on actual iPad**

- Open Safari on iPad
- Navigate to `http://dev.carlosmartinezt.com:3055`
- Tap Share > Add to Home Screen
- Open from home screen (should be fullscreen, no browser chrome)
- Verify: clock ticks, weather loads, countdown shows/hides correctly

**Step 3: Add iCal URLs to config**

Once confirmed working, Carlos adds his Google Calendar private iCal URLs to `server/config.json`.

**Step 4: Final commit**

```bash
cd ~/ipad-screen
git add -A
git commit -m "feat: add PWA manifest and final polish for iPad"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Project scaffolding | package.json, vite.config.js, index.html |
| 2 | Clock component | Clock.jsx, useTime.js |
| 3 | Config file + API | config.json, server/index.js, routes/config.js |
| 4 | Weather widget | routes/weather.js, Weather.jsx, usePolling.js |
| 5 | Countdown bar | Countdown.jsx |
| 6 | Calendar widget | routes/calendar.js, Calendar.jsx |
| 7 | Motivator messages | Motivator.jsx |
| 8 | Full layout assembly | App.jsx, index.css |
| 9 | Production build + systemd | package.json, systemd service |
| 10 | PWA + iPad testing | manifest.json, index.html |
