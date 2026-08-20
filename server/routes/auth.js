import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { tables, userToJson } from '../db.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { checkBadges, getUserBadges } from '../services/gamification.js'
import { logActivity } from '../services/personalization.js'

const router = Router()

function normalizeInterests(raw) {
  const values = Array.isArray(raw) ? raw : []
  if (values.includes('both')) return ['food', 'dance', 'both']
  return values.filter((v) => ['food', 'dance', 'both'].includes(v))
}

router.post('/register', async (req, res) => {
  const { email, password, name, age, country, language, interests } = req.body ?? {}

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' })
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const existing = tables.findOne('users', { email: String(email).toLowerCase() })
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const normalizedInterests = normalizeInterests(interests)
  const onboardingComplete = Boolean(age && country && language)

  const result = tables.insert('users', {
    email: String(email).toLowerCase(),
    password_hash: passwordHash,
    name: String(name).trim(),
    age: age ? Number(age) : null,
    country: country ? String(country) : null,
    language: language ? String(language) : 'en',
    interests: JSON.stringify(normalizedInterests.length ? normalizedInterests : ['food', 'dance']),
    onboarding_complete: onboardingComplete ? 1 : 0,
    points: 25,
    provider: 'email',
    avatar_style: 'default',
  })

  autoJoinCommunities(result.lastInsertRowid, normalizedInterests)
  checkBadges(result.lastInsertRowid)

  const user = userToJson(tables.findOne('users', { id: result.lastInsertRowid }))
  const token = signToken(result.lastInsertRowid)
  logActivity(result.lastInsertRowid, 'register', 'user', result.lastInsertRowid, { interests: normalizedInterests })

  res.status(201).json({ token, user, badges: getUserBadges(result.lastInsertRowid), message: 'Welcome to Lyfstyl!' })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const row = tables.findOne('users', { email: String(email).toLowerCase() })
  if (!row?.password_hash) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = signToken(row.id)
  logActivity(row.id, 'login', 'user', row.id)
  res.json({ token, user: userToJson(row), badges: getUserBadges(row.id) })
})

router.post('/social', (req, res) => {
  const { provider, email, name } = req.body ?? {}
  const allowed = ['google', 'apple', 'facebook']
  if (!allowed.includes(provider)) {
    return res.status(400).json({ error: 'Unsupported social provider.' })
  }
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required for social sign-in.' })
  }

  let row = tables.findOne('users', { email: String(email).toLowerCase() })
  if (!row) {
    const result = tables.insert('users', {
      email: String(email).toLowerCase(),
      name: String(name).trim(),
      provider,
      interests: JSON.stringify(['food', 'dance']),
      points: 25,
      onboarding_complete: 0,
      avatar_style: 'default',
      password_hash: null,
    })
    row = tables.findOne('users', { id: result.lastInsertRowid })
  }

  const token = signToken(row.id)
  logActivity(row.id, 'social_login', 'user', row.id, { provider })
  res.json({
    token,
    user: userToJson(row),
    badges: getUserBadges(row.id),
    message: `Signed in with ${provider}. Complete onboarding to personalize your feed.`,
  })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    badges: getUserBadges(req.user.id),
    communities: getUserCommunities(req.user.id),
  })
})

function autoJoinCommunities(userId, interests) {
  const verticals = []
  if (interests.includes('food') || interests.includes('both')) verticals.push('food')
  if (interests.includes('dance') || interests.includes('both')) verticals.push('dance')
  if (!verticals.length) verticals.push('food', 'dance')

  const communities = tables.find('communities', { vertical: { $in: verticals } }).slice(0, 3)
  for (const community of communities) {
    tables.upsertComposite('user_communities', ['user_id', 'community_id'], {
      user_id: userId,
      community_id: community.id,
      joined_at: new Date().toISOString(),
    })
  }
}

function getUserCommunities(userId) {
  const links = tables.find('user_communities', { user_id: userId })
  return links
    .map((link) => tables.findOne('communities', { id: link.community_id }))
    .filter(Boolean)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      category: c.category,
      vertical: c.vertical,
      description: c.description,
    }))
}

export default router
