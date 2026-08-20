import { Router } from 'express'
import { parseJson, tables, userToJson } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { awardPoints, getUserBadges } from '../services/gamification.js'
import {
  addNotification,
  awardAndNotify,
  formatMove,
  formatRecipe,
  getDashboard,
  getNotifications,
} from '../services/content.js'
import { logActivity } from '../services/personalization.js'
import { getUserCommunities } from '../services/communities.js'
import { contentCreatorId, notifyContentEngagement } from '../services/social.js'

const router = Router()

router.get('/me/communities', requireAuth, (req, res) => {
  res.json({ communities: getUserCommunities(req.user.id) })
})

router.get('/me/dashboard', requireAuth, (req, res) => {
  res.json(getDashboard(req.user.id))
})

router.get('/me/notifications', requireAuth, (req, res) => {
  res.json({ notifications: getNotifications(req.user.id) })
})

router.get('/me/notifications/unread-count', requireAuth, (req, res) => {
  const unread = tables.count('notifications', { user_id: req.user.id, read: 0 })
  const pendingConnections = tables.count('connections', { recipient_id: req.user.id, status: 'pending' })
  res.json({ unread: unread + pendingConnections, notifications: unread, pendingConnections })
})

router.patch('/me/notifications/read', requireAuth, (req, res) => {
  tables.update('notifications', { user_id: req.user.id, read: 0 }, { read: 1 })
  res.json({ ok: true })
})

router.patch('/me/profile', requireAuth, (req, res) => {
  const { name, bio, country, language, interests, avatarStyle } = req.body ?? {}
  const patch = {}
  if (name) patch.name = String(name).trim()
  if (bio !== undefined) patch.bio = String(bio).slice(0, 280)
  if (country) patch.country = String(country)
  if (language) patch.language = String(language)
  if (interests) patch.interests = JSON.stringify(interests)
  if (avatarStyle) patch.avatar_style = avatarStyle

  tables.update('users', { id: req.user.id }, patch)
  res.json({ user: userToJson(tables.findOne('users', { id: req.user.id })) })
})

router.get('/me/saved', requireAuth, (req, res) => {
  const saved = tables
    .find('saved_items', { user_id: req.user.id })
    .sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at))
    .map((item) => {
      if (item.entity_type === 'recipe') {
        const row = tables.findOne('recipes', { id: item.entity_id })
        return row ? { kind: 'recipe', ...formatRecipe(row, req.user.id) } : null
      }
      const row = tables.findOne('moves', { id: item.entity_id })
      return row ? { kind: 'move', ...formatMove(row, req.user.id) } : null
    })
    .filter(Boolean)
  res.json({ saved })
})

router.post('/me/save/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params
  if (!['recipe', 'move'].includes(type)) return res.status(400).json({ error: 'Invalid type.' })

  const existing = tables.findOne('saved_items', {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
  })

  if (existing) {
    tables.delete('saved_items', { id: existing.id })
    return res.json({ saved: false })
  }

  tables.insert('saved_items', {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
    saved_at: new Date().toISOString(),
  })
  addNotification(req.user.id, 'save', 'Saved to your library', `Added to your personal collection.`)
  res.json({ saved: true })
})

router.get('/comments/:type/:id', (req, res) => {
  const comments = tables
    .find('comments', { entity_type: req.params.type, entity_id: Number(req.params.id) })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((c) => {
      const author = tables.findOne('users', { id: c.user_id })
      return {
        id: c.id,
        body: c.body,
        createdAt: c.created_at,
        author: author ? { id: author.id, name: author.name, avatar: author.avatar_style } : null,
      }
    })
  res.json({ comments })
})

router.post('/comments/:type/:id', requireAuth, (req, res) => {
  const { body } = req.body ?? {}
  if (!body?.trim()) return res.status(400).json({ error: 'Comment cannot be empty.' })

  const result = tables.insert('comments', {
    user_id: req.user.id,
    entity_type: req.params.type,
    entity_id: Number(req.params.id),
    body: String(body).trim().slice(0, 500),
    created_at: new Date().toISOString(),
  })

  awardPoints(req.user.id, 5, { comment: result.lastInsertRowid })

  const creatorId = contentCreatorId(req.params.type, req.params.id)
  if (creatorId && creatorId !== req.user.id) {
    notifyContentEngagement(creatorId, req.user, req.params.type, req.params.type, Number(req.params.id), 'comment')
  }

  res.status(201).json({ ok: true, id: result.lastInsertRowid })
})

router.patch('/me/onboarding', requireAuth, (req, res) => {
  const { age, country, language, interests, avatarStyle } = req.body ?? {}
  if (!age || !country || !language) {
    return res.status(400).json({ error: 'Age, country, and language are required.' })
  }

  const normalizedInterests = Array.isArray(interests) && interests.length ? interests : req.user.interests

  tables.update(
    'users',
    { id: req.user.id },
    {
      age: Number(age),
      country: String(country),
      language: String(language),
      interests: JSON.stringify(normalizedInterests),
      avatar_style: avatarStyle ?? 'default',
      onboarding_complete: 1,
    },
  )

  const verticals = []
  if (normalizedInterests.includes('food') || normalizedInterests.includes('both')) verticals.push('food')
  if (normalizedInterests.includes('dance') || normalizedInterests.includes('both')) verticals.push('dance')

  const communities = tables.find('communities', { vertical: { $in: verticals } }).slice(0, 4)
  for (const community of communities) {
    const existing = tables.findOne('user_communities', {
      user_id: req.user.id,
      community_id: community.id,
    })
    if (!existing) {
      tables.insert('user_communities', {
        user_id: req.user.id,
        community_id: community.id,
        joined_at: new Date().toISOString(),
      })
      tables.increment('communities', { id: community.id }, 'member_count', 1)
    }
  }

  logActivity(req.user.id, 'onboarding_complete', 'user', req.user.id, { country, language })
  addNotification(req.user.id, 'welcome', 'Welcome to Lyfstyl', 'Your feed is now personalized by country and passions.')

  const user = userToJson(tables.findOne('users', { id: req.user.id }))
  res.json({ user, badges: getUserBadges(req.user.id) })
})

router.post('/content/:type/:id/star', requireAuth, (req, res) => {
  const { type, id } = req.params
  const rating = Number(req.body?.rating ?? 5)
  if (!['recipe', 'move', 'discover'].includes(type)) {
    return res.status(400).json({ error: 'Invalid content type.' })
  }

  tables.upsertComposite('content_stars', ['user_id', 'entity_type', 'entity_id'], {
    user_id: req.user.id,
    entity_type: type,
    entity_id: Number(id),
    rating,
    created_at: new Date().toISOString(),
  })

  const points = awardAndNotify(req.user.id, 10, { action: 'star', type, id })
  logActivity(req.user.id, 'star', type, Number(id), { rating })

  res.json({ rating, points, badges: getUserBadges(req.user.id) })
})

export default router
