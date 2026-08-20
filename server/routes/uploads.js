import { Router } from 'express'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { requireAuth } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'uploads')
mkdirSync(uploadsDir, { recursive: true })

const router = Router()

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}

router.post('/', requireAuth, (req, res) => {
  const { data, filename, mimeType } = req.body ?? {}
  if (!data?.startsWith('data:')) {
    return res.status(400).json({ error: 'Invalid upload payload.' })
  }

  const match = /^data:([^;]+);base64,(.+)$/.exec(data)
  if (!match) return res.status(400).json({ error: 'Invalid data URL.' })

  const [, detectedMime, base64] = match
  const mime = mimeType || detectedMime
  const ext = ALLOWED[mime]
  if (!ext) return res.status(400).json({ error: 'Unsupported file type.' })

  const buffer = Buffer.from(base64, 'base64')
  const maxSize = mime.startsWith('video/') ? 20 * 1024 * 1024 : 6 * 1024 * 1024
  if (buffer.length > maxSize) {
    return res.status(400).json({ error: 'File too large.' })
  }

  const safeName = `${randomUUID()}.${ext}`
  writeFileSync(join(uploadsDir, safeName), buffer)

  res.status(201).json({
    url: `/uploads/${safeName}`,
    mimeType: mime,
    filename: filename ?? safeName,
    size: buffer.length,
  })
})

export default router
