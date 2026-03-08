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

function cToF(c) { return Math.round(c * 9 / 5 + 32) }
function formatTemp(c) { return `${Math.round(c)}°C / ${cToF(c)}°F` }

export default function Weather() {
  const data = usePolling('/api/weather', 15 * 60 * 1000)

  if (!data || !data.current) return null

  const { temperature_2m, apparent_temperature, weather_code } = data.current
  const [icon, description] = WMO_CODES[weather_code] || ['❓', 'Unknown']
  const high = data.daily?.temperature_2m_max?.[0]
  const low = data.daily?.temperature_2m_min?.[0]

  // Check precipitation probability in the next 2 hours
  let rainAlert = null
  if (data.hourly?.precipitation_probability) {
    const now = new Date()
    const hourIndex = now.getHours()
    const next2h = data.hourly.precipitation_probability.slice(hourIndex, hourIndex + 2)
    const maxProb = Math.max(...next2h)
    if (maxProb > 30) {
      rainAlert = `🌧️ ${maxProb}% chance of rain in the next 2 hours`
    }
  }

  return (
    <div className="weather">
      <div className="weather-current">
        <span className="weather-icon">{icon}</span>
        <span className="weather-temp">{formatTemp(temperature_2m)}</span>
      </div>
      <div className="weather-details">
        <span>{description}</span>
        <span>Feels like {formatTemp(apparent_temperature)}</span>
        {high != null && low != null && (
          <span>H: {formatTemp(high)} · L: {formatTemp(low)}</span>
        )}
        {rainAlert && <span className="weather-rain-alert">{rainAlert}</span>}
      </div>
    </div>
  )
}
