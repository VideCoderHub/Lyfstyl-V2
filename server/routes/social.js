import { Router } from 'express'
import { tables } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import {
  canMessage,
  contentCreatorId,
  countConnections,
  findConnection,
  formatConnectionRow,
  formatMessage,
  formatReview,
  formatUserPublic,
  getConnectionStatus,
  getReviewStats,
  getUserReview,
  notifyConnection,
  notifyContentEngagement,
  notifyFollow,
} from '../services/social.js'
import { getCreatorSuggestions, getPeople, getSocialFeed } from '../services/feed.js'
import { countFollowers, countFollowing, isFollowing } from '../services/feed.js'

const router = Router()

// ——— Social feed & people ———
router.get('/feed', requireAuth, (req, res) => {
  const { tab = 'following' } = req.query
  res.json(getSocialFeed(req.user, tab))
})

router.get('/people', requireAuth, (req, res) => {
  const { filter = 'suggested' } = req.query
  res.json({ people: getPeople(req.user.id, filter) })
})

router.get('/suggestions', requireAuth, (req, res) => {
  res.json({ suggestions: getCreatorSuggestions(req.user.id, 8) })
})

// ——— Follow ———
router.post('/follow/:userId', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself.' })

  const target = tables.findOne('users', { id: targetId })
  if (!target) return res.status(404).json({ error: 'User not found.' })

  if (isFollowing(req.user.id, targetId)) {
    return res.status(409).json({ error: 'Already following.' })
  }

  tables.insert('follows', {
    follower_id: req.user.id,
    following_id: targetId,
  })

  notifyFollow(targetId, req.user)
  res.status(201).json({ following: true, followers: countFollowers(targetId) })
})

router.delete('/follow/:userId', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  tables.delete('follows', { follower_id: req.user.id, following_id: targetId })
  res.json({ following: false, followers: countFollowers(targetId) })
})

// ——— Applause ———
router.post('/applause/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params
  if (!['recipe', 'move'].includes(type)) return res.status(400).json({ error: 'Invalid type.' })

  const existing = tables.findOne('applause', {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
  })

  if (existing) {
    tables.delete('applause', { id: existing.id })
    return res.json({ applauded: false, applauseCount: tables.count('applause', { entity_type: type, entity_id: Number(id) }) })
  }

  tables.insert('applause', {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
  })

  const creatorId = contentCreatorId(type, id)
  if (creatorId && creatorId !== req.user.id) {
    notifyContentEngagement(creatorId, req.user, type, type, Number(id), 'applause')
  }

  res.json({ applauded: true, applauseCount: tables.count('applause', { entity_type: type, entity_id: Number(id) }) })
})

// ——— Connections ———
router.get('/connections', requireAuth, (req, res) => {
  const rows = tables
    .find('connections')
    .filter((c) => c.requester_id === req.user.id || c.recipient_id === req.user.id)
    .sort((a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? a.created_at))

  const connections = rows.map((row) => formatConnectionRow(row, req.user.id))
  res.json({ connections })
})

router.post('/connections/:userId', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot connect with yourself.' })

  const target = tables.findOne('users', { id: targetId })
  if (!target) return res.status(404).json({ error: 'User not found.' })

  const existing = findConnection(req.user.id, targetId)
  if (existing?.status === 'accepted') {
    return res.status(409).json({ error: 'Already connected.' })
  }
  if (existing?.status === 'pending') {
    return res.status(409).json({ error: 'Connection request already pending.' })
  }

  const result = tables.insert('connections', {
    requester_id: req.user.id,
    recipient_id: targetId,
    status: 'pending',
    updated_at: new Date().toISOString(),
  })

  notifyConnection(targetId, 'request', req.user)
  res.status(201).json({
    connection: formatConnectionRow(
      tables.findOne('connections', { id: result.lastInsertRowid }),
      req.user.id,
    ),
    status: 'pending_sent',
  })
})

router.patch('/connections/:userId/accept', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  const row = tables.findOne('connections', {
    requester_id: targetId,
    recipient_id: req.user.id,
    status: 'pending',
  })
  if (!row) return res.status(404).json({ error: 'No pending request found.' })

  tables.update('connections', { id: row.id }, {
    status: 'accepted',
    updated_at: new Date().toISOString(),
  })

  const requester = tables.findOne('users', { id: targetId })
  if (requester) notifyConnection(targetId, 'accepted', req.user)

  res.json({
    connection: formatConnectionRow(tables.findOne('connections', { id: row.id }), req.user.id),
    status: 'connected',
  })
})

router.patch('/connections/:userId/decline', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  const row = tables.findOne('connections', {
    requester_id: targetId,
    recipient_id: req.user.id,
    status: 'pending',
  })
  if (!row) return res.status(404).json({ error: 'No pending request found.' })

  tables.delete('connections', { id: row.id })
  res.json({ ok: true, status: 'none' })
})

router.delete('/connections/:userId', requireAuth, (req, res) => {
  const targetId = Number(req.params.userId)
  const row = findConnection(req.user.id, targetId)
  if (!row) return res.status(404).json({ error: 'Connection not found.' })

  tables.delete('connections', { id: row.id })
  res.json({ ok: true, status: 'none' })
})

// ——— Messages ———
router.get('/messages/conversations', requireAuth, (req, res) => {
  const messages = tables
    .find('messages')
    .filter((m) => m.sender_id === req.user.id || m.recipient_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const seen = new Set()
  const conversations = []

  for (const msg of messages) {
    const otherId = msg.sender_id === req.user.id ? msg.recipient_id : msg.sender_id
    if (seen.has(otherId)) continue
    seen.add(otherId)

    if (!canMessage(req.user.id, otherId)) continue

    const other = tables.findOne('users', { id: otherId })
    const unread = tables.count('messages', {
      sender_id: otherId,
      recipient_id: req.user.id,
      read: 0,
    })

    conversations.push({
      user: formatUserPublic(other),
      lastMessage: formatMessage(msg),
      unread,
    })
  }

  res.json({ conversations })
})

router.get('/messages/:userId', requireAuth, (req, res) => {
  const otherId = Number(req.params.userId)
  if (!canMessage(req.user.id, otherId)) {
    return res.status(403).json({ error: 'Connect with this user before messaging.' })
  }

  const messages = tables
    .find('messages')
    .filter(
      (m) =>
        (m.sender_id === req.user.id && m.recipient_id === otherId) ||
        (m.sender_id === otherId && m.recipient_id === req.user.id),
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((m) => formatMessage(m))

  tables.update(
    'messages',
    { sender_id: otherId, recipient_id: req.user.id, read: 0 },
    { read: 1 },
  )

  res.json({ messages })
})

router.post('/messages/:userId', requireAuth, (req, res) => {
  const otherId = Number(req.params.userId)
  const { body } = req.body ?? {}
  if (!body?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' })
  if (!canMessage(req.user.id, otherId)) {
    return res.status(403).json({ error: 'Connect with this user before messaging.' })
  }

  const result = tables.insert('messages', {
    sender_id: req.user.id,
    recipient_id: otherId,
    body: String(body).trim().slice(0, 1000),
    read: 0,
  })

  res.status(201).json({ message: formatMessage(tables.findOne('messages', { id: result.lastInsertRowid })) })
})

// ——— Reviews ———
router.get('/reviews/:type/:id', optionalAuth, (req, res) => {
  const { type, id } = req.params
  if (!['recipe', 'move'].includes(type)) return res.status(400).json({ error: 'Invalid type.' })

  const reviews = tables
    .find('reviews', { entity_type: type, entity_id: Number(id) })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((r) => formatReview(r, req.user?.id))

  res.json({
    reviews,
    stats: getReviewStats(type, id),
    userReview: req.user ? getUserReview(type, id, req.user.id) : null,
  })
})

router.post('/reviews/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params
  const { rating, body } = req.body ?? {}
  if (!['recipe', 'move'].includes(type)) return res.status(400).json({ error: 'Invalid type.' })

  const numericRating = Number(rating)
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' })
  }
  if (!body?.trim()) return res.status(400).json({ error: 'Review text is required.' })

  tables.upsertComposite('reviews', ['user_id', 'entity_type', 'entity_id'], {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
    rating: numericRating,
    body: String(body).trim().slice(0, 800),
    updated_at: new Date().toISOString(),
  })

  const row = tables.findOne('reviews', {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
  })

  const creatorId = contentCreatorId(type, id)
  if (creatorId && creatorId !== req.user.id) {
    notifyContentEngagement(creatorId, req.user, type, type, Number(id), 'review')
  }

  res.status(201).json({
    review: formatReview(row, req.user.id),
    stats: getReviewStats(type, id),
  })
})

export { countConnections, getConnectionStatus }

export default router
