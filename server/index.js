import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { initDb } from './db.js'
import { seedDatabase } from './seed.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import communityRoutes from './routes/communities.js'
import contentRoutes from './routes/content.js'
import challengeRoutes from './routes/challenges.js'
import socialRoutes from './routes/social.js'
import uploadRoutes from './routes/uploads.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const uploadsDir = join(__dirname, 'uploads')
mkdirSync(uploadsDir, { recursive: true })

initDb()
seedDatabase()

app.use(cors())
app.use(express.json({ limit: '25mb' }))
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lyfstyl-api', version: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/users', socialRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api', contentRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/uploads', uploadRoutes)

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`Lyfstyl API running on http://localhost:${PORT}`)
})
