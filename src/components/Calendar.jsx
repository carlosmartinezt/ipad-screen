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
