import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

function parseTime(timeStr, now, timezone) {
  // Parse "HH:MM" into a Date object for today in the given timezone
  const [h, m] = timeStr.split(':').map(Number)
  // Build a date for today in the target timezone
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone }) // YYYY-MM-DD
  const dt = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`)
  // Adjust for timezone offset: we need the absolute instant when it's HH:MM in that timezone
  const utcTarget = new Date(dt.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzTarget = new Date(dt.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcTarget - tzTarget
  return new Date(dt.getTime() + offset)
}

function isWeekend(now, timezone) {
  const dayName = now.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' })
  return dayName === 'Sat' || dayName === 'Sun'
}

function isTodayInDaysOff(now, timezone, daysOff) {
  if (!daysOff || daysOff.length === 0) return false
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone }) // YYYY-MM-DD
  return daysOff.includes(todayStr)
}

export default function Countdown() {
  const now = useTime()
  const config = usePolling('/api/config', 60000)

  if (!config) return null

  const { school, thresholds, daysOff } = config
  const timezone = school.timezone

  // Hidden on weekends
  if (isWeekend(now, timezone)) return null

  // Hidden on days off
  if (isTodayInDaysOff(now, timezone, daysOff)) return null

  const doorsClose = parseTime(school.doorsCloseAt, now, timezone)
  const leaveBy = new Date(doorsClose.getTime() - school.walkMinutes * 60 * 1000)

  // Hidden after doors close
  if (now >= doorsClose) return null

  const msRemaining = leaveBy - now
  const secondsRemaining = Math.floor(msRemaining / 1000)
  const minutesRemaining = Math.floor(secondsRemaining / 60)

  const pastLeaveTime = now >= leaveBy

  // Determine color
  let color
  let label
  let pulsing = false

  if (pastLeaveTime) {
    color = '#ef4444'
    pulsing = true
    const secUntilDoors = Math.floor((doorsClose - now) / 1000)
    const m = Math.floor(secUntilDoors / 60)
    const s = secUntilDoors % 60
    label = `RUN! ${m}:${String(s).padStart(2, '0')}`
  } else if (minutesRemaining < thresholds.yellowMinutes) {
    color = '#ef4444'
    const m = Math.floor(secondsRemaining / 60)
    const s = secondsRemaining % 60
    label = `${m}:${String(s).padStart(2, '0')}`
  } else if (minutesRemaining < thresholds.greenMinutes) {
    color = '#eab308'
    const m = Math.floor(secondsRemaining / 60)
    const s = secondsRemaining % 60
    label = `${m}:${String(s).padStart(2, '0')}`
  } else {
    color = '#22c55e'
    label = `${minutesRemaining} min to go`
  }

  // Progress bar: fills from left as time runs out
  // Total time span = greenMinutes (the full visual range before leave time)
  // When at greenMinutes or more, bar is at 0%. At leave time, bar is 100%.
  const totalSpanMs = thresholds.greenMinutes * 60 * 1000
  let progress
  if (pastLeaveTime) {
    progress = 100
  } else if (msRemaining >= totalSpanMs) {
    progress = 0
  } else {
    progress = ((totalSpanMs - msRemaining) / totalSpanMs) * 100
  }

  return (
    <div className={`countdown${pulsing ? ' countdown-pulse' : ''}`}>
      <div
        className="countdown-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
      <span className="countdown-label">{label}</span>
    </div>
  )
}
