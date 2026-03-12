import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

function parseTime(timeStr, now, timezone) {
  // Parse "HH:MM" into a Date object for today in the given timezone
  const [h, m] = timeStr.split(':').map(Number)
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone }) // YYYY-MM-DD
  const dt = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`)
  const utcTarget = new Date(dt.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzTarget = new Date(dt.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcTarget - tzTarget
  return new Date(dt.getTime() + offset)
}

function getDayName(now, timezone) {
  return now.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' })
}

function isWeekend(now, timezone) {
  const day = getDayName(now, timezone)
  return day === 'Sat' || day === 'Sun'
}

function isTodayInDaysOff(now, timezone, daysOff) {
  if (!daysOff || daysOff.length === 0) return false
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  return daysOff.includes(todayStr)
}

function getNextSchoolMorning(now, timezone) {
  // Returns a Date for the next school day at 8:30 AM
  const day = getDayName(now, timezone)
  let daysToAdd
  if (day === 'Fri') daysToAdd = 3
  else if (day === 'Sat') daysToAdd = 2
  else if (day === 'Sun') daysToAdd = 1
  else daysToAdd = 1 // Mon-Thu: next day

  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const [y, mo, d] = todayStr.split('-').map(Number)
  const target = new Date(Date.UTC(y, mo - 1, d + daysToAdd, 8, 30, 0))
  // Adjust for timezone
  const utcTarget = new Date(target.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzTarget = new Date(target.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcTarget - tzTarget
  return new Date(target.getTime() + offset)
}

function formatHoursMinutes(ms) {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function Countdown() {
  const now = useTime()
  const config = usePolling('/api/config', 60000)

  if (!config) return null

  const { school, thresholds, daysOff } = config
  const timezone = school.timezone

  const noSchoolToday = isWeekend(now, timezone) || isTodayInDaysOff(now, timezone, daysOff)
  const doorsClose = parseTime(school.doorsCloseAt, now, timezone)
  const leaveBy = new Date(doorsClose.getTime() - school.walkMinutes * 60 * 1000)
  const pastDoorsClose = now >= doorsClose

  // After school or no school today → show "next school" countdown
  if (noSchoolToday || pastDoorsClose) {
    const nextSchool = getNextSchoolMorning(now, timezone)
    const msUntil = nextSchool - now
    if (msUntil <= 0) return null
    const day = getDayName(now, timezone)
    const isFriSatSun = day === 'Fri' || day === 'Sat' || day === 'Sun'
    const targetDay = isFriSatSun ? 'Monday' : 'tomorrow'

    return (
      <div className="countdown countdown-chill">
        <div className="countdown-content">
          <div className="countdown-main">
            <span className="countdown-label countdown-label-chill">
              {formatHoursMinutes(msUntil)}
            </span>
            <span className="countdown-leave-by">
              until {targetDay} 8:30 AM
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Active school morning countdown
  const msRemaining = leaveBy - now
  const secondsRemaining = Math.floor(msRemaining / 1000)
  const minutesRemaining = Math.floor(secondsRemaining / 60)
  const pastLeaveTime = now >= leaveBy

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

  const totalSpanMs = thresholds.greenMinutes * 60 * 1000
  let progress
  if (pastLeaveTime) {
    progress = 100
  } else if (msRemaining >= totalSpanMs) {
    progress = 0
  } else {
    progress = ((totalSpanMs - msRemaining) / totalSpanMs) * 100
  }

  const fmtTime = (date) =>
    date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

  const leaveByStr = fmtTime(leaveBy)
  const doorsCloseStr = fmtTime(doorsClose)

  const yellowPct = ((thresholds.greenMinutes - thresholds.yellowMinutes) / thresholds.greenMinutes) * 100

  return (
    <div className={`countdown${pulsing ? ' countdown-pulse' : ''}`}>
      <div
        className="countdown-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
      <div className="countdown-content">
        <div className="countdown-main">
          <span className="countdown-label" style={{ color }}>{label}</span>
          <span className="countdown-leave-by">
            {pastLeaveTime ? `Doors close ${doorsCloseStr}` : `Leave by ${leaveByStr}`}
          </span>
        </div>
        <div className="countdown-milestones">
          <div className="milestone" style={{ left: '0%' }}>
            <div className="milestone-dot" style={{ backgroundColor: '#22c55e' }} />
            <span className="milestone-label">{thresholds.greenMinutes}m</span>
          </div>
          <div className="milestone" style={{ left: `${yellowPct}%` }}>
            <div className="milestone-dot" style={{ backgroundColor: '#eab308' }} />
            <span className="milestone-label">{thresholds.yellowMinutes}m</span>
          </div>
          <div className="milestone" style={{ left: '100%' }}>
            <div className="milestone-dot" style={{ backgroundColor: '#ef4444' }} />
            <span className="milestone-label">GO!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
