import jwt from 'jsonwebtoken'
import { tables, userToJson } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'lyfstyl-dev-secret-change-in-production'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    const row = tables.findOne('users', { id: payload.sub })
    req.user = userToJson(row)
  } catch {
    req.user = null
  }
  next()
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    next()
  })
}
