import { useState, useEffect } from 'react'
import { useTime } from '../hooks/useTime'
import { usePolling } from '../hooks/usePolling'

// Parse "HH:MM" string into a Date for today
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

  useEffect(() => {
    const id = setInterval(() => setRandomIndex(prev => prev + 1), 30000)
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
