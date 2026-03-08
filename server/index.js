// server/index.js
import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import configRoute from './routes/config.js'
import weatherRoute from './routes/weather.js'
import calendarRoute from './routes/calendar.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3055

app.get('/api/config', configRoute)
app.get('/api/weather', weatherRoute)
app.get('/api/calendar', calendarRoute)

// Serve static build in production
const distPath = join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Build not found. Run npm run build first.')
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`)
})
