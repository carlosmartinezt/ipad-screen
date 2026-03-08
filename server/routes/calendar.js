// server/routes/calendar.js
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import ICAL from 'ical.js'

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
    const calendars = config.calendars || []

    if (calendars.length === 0) {
      cache = { data: [], timestamp: now }
      return res.json([])
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const allEvents = []

    for (const cal of calendars) {
      try {
        const resp = await fetch(cal.url)
        const icalText = await resp.text()
        const jcal = ICAL.parse(icalText)
        const comp = new ICAL.Component(jcal)
        const vevents = comp.getAllSubcomponents('vevent')

        for (const vevent of vevents) {
          const event = new ICAL.Event(vevent)
          const start = event.startDate.toJSDate()

          if (start >= todayStart && start <= todayEnd) {
            allEvents.push({
              summary: event.summary,
              start: start.toISOString(),
              calendar: cal.name || 'Calendar'
            })
          }
        }
      } catch (err) {
        console.error(`Failed to fetch calendar "${cal.name}":`, err.message)
      }
    }

    allEvents.sort((a, b) => new Date(a.start) - new Date(b.start))

    cache = { data: allEvents, timestamp: now }
    res.json(allEvents)
  } catch (err) {
    console.error('Calendar route error:', err.message)
    res.status(500).json({ error: 'Calendar fetch failed' })
  }
}
