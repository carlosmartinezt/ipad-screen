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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=celsius&timezone=America%2FNew_York&forecast_days=2`
    const resp = await fetch(url)
    const json = await resp.json()
    cache = { data: json, timestamp: now }
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed' })
  }
}
