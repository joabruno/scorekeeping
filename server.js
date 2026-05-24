import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const DATA_FILE = path.join(__dirname, 'tournament-data.json')
const PORT = 3001

app.use(cors())
app.use(express.json())

// Helper functions to read/write data
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading data file:', error)
  }
  return { isActive: false, participants: [] }
}

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing data file:', error)
  }
}

// GET - Get current tournament status and participants
app.get('/api/tournament', (req, res) => {
  const data = readData()
  res.json(data)
})

// POST - Start a new tournament
app.post('/api/tournament/start', (req, res) => {
  writeData({ isActive: true, participants: [] })
  res.json({ isActive: true, participants: [] })
})

// POST - Join tournament
app.post('/api/tournament/join', (req, res) => {
  const { name, saldo } = req.body

  if (!name || !saldo) {
    return res.status(400).json({ error: 'Name and saldo are required' })
  }

  const data = readData()

  if (!data.isActive) {
    return res.status(400).json({ error: 'No active tournament' })
  }

  data.participants.push({ name, saldo })
  writeData(data)

  res.json(data)
})

// POST - End tournament
app.post('/api/tournament/end', (req, res) => {
  writeData({ isActive: false, participants: [] })
  res.json({ isActive: false, participants: [] })
})

app.listen(PORT, () => {
  console.log(`Tournament server running on http://localhost:${PORT}`)
})
