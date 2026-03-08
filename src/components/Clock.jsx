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
