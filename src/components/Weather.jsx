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

function getHourlyForecast(data) {
  if (!data.hourly?.time || !data.hourly?.temperature_2m || !data.hourly?.weather_code) return []

  const nowHour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }))
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const startIndex = data.hourly.time.findIndex(t => t === `${todayStr}T${String(nowHour).padStart(2, '0')}:00`)

  if (startIndex === -1) return []

  const hours = []
  for (let i = startIndex + 1; i < startIndex + 13 && i < data.hourly.time.length; i++) {
    const time = new Date(data.hourly.time[i] + ':00')
    const hour = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'America/New_York' })
    const temp = data.hourly.temperature_2m[i]
    const code = data.hourly.weather_code[i]
    const [icon] = WMO_CODES[code] || ['❓']
    const precip = data.hourly.precipitation_probability?.[i]
    hours.push({ hour, temp, icon, precip })
  }
  return hours
}

export default function Weather() {
  const data = usePolling('/api/weather', 15 * 60 * 1000)

  if (!data || !data.current) return null

  const { temperature_2m, apparent_temperature, weather_code } = data.current
  const [icon, description] = WMO_CODES[weather_code] || ['❓', 'Unknown']
  const high = data.daily?.temperature_2m_max?.[0]
  const low = data.daily?.temperature_2m_min?.[0]
  const hourly = getHourlyForecast(data)

  return (
    <div className="weather">
      <h2 className="widget-title">🌡️ Weather</h2>
      <div className="weather-current">
        <span className="weather-icon">{icon}</span>
        <span className="weather-temp">{Math.round(temperature_2m)}° / {cToF(temperature_2m)}°F</span>
      </div>
      <div className="weather-details">
        <span>{description} · Feels {Math.round(apparent_temperature)}°</span>
        {high != null && low != null && (
          <span>H: {Math.round(high)}° · L: {Math.round(low)}°</span>
        )}
      </div>
      {hourly.length > 0 && (
        <div className="weather-hourly">
          {hourly.map((h, i) => (
            <div key={i} className="weather-hour">
              <span className="weather-hour-time">{h.hour}</span>
              <span className="weather-hour-icon">{h.icon}</span>
              <span className="weather-hour-temp">{Math.round(h.temp)}°</span>
              {h.precip > 20 && <span className="weather-hour-rain">{h.precip}%</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
