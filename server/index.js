// server/index.js
import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import configRoute from './routes/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3055

app.get('/api/config', configRoute)

// Serve static build in production
const distPath = join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`)
})
