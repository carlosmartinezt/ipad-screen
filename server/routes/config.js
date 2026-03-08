// server/routes/config.js
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', 'config.json')

export default function configRoute(req, res) {
  try {
    const raw = readFileSync(configPath, 'utf-8')
    res.json(JSON.parse(raw))
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config' })
  }
}
