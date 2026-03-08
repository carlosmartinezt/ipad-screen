import { useState, useEffect } from 'react'
import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

// Parse "HH:MM" into a Date object for today in the given timezone
function parseTime(timeStr, now, timezone) {
  const [h, m] = timeStr.split(':').map(Number)
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone }) // YYYY-MM-DD
  const dt = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
  const utcTarget = new Date(dt.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzTarget = new Date(dt.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcTarget - tzTarget
  return new Date(dt.getTime() + offset)
}

export default function Motivator() {
  const now = useTime()
  const config = usePolling('/api/config', 60 * 1000)
  const [randomIndex, setRandomIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setRandomIndex(prev => prev + 1), 30000)
    return () => clearInterval(id)
  }, [])

  if (!config) return null

  const { school, friends, randomMessages, daysOff } = config
  const timezone = school.timezone

  // Only show on school mornings
  const dayOfWeek = now.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' })
  if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') return null
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  if (daysOff?.includes(todayStr)) return null

  const doorsClose = parseTime(school.doorsCloseAt, now, timezone)
  if (now > doorsClose) return null

  // Check for friends in their window
  const availableFriends = (friends || []).filter(f => {
    const start = parseTime(f.windowStart, now, timezone)
    const end = parseTime(f.windowEnd, now, timezone)
    return now >= start && now <= end
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
