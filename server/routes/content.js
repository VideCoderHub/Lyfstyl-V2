import { Router } from 'express'
import { parseJson, tables } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { getPlatformStats } from '../services/gamification.js'
import { addNotification, awardAndNotify, formatMove, formatRecipe } from '../services/content.js'
import { maybeAutoSubmit } from '../services/challenges.js'
import { formatDiscoverItem, getDiscoverDetail, getRelatedMoves, getRelatedRecipes } from '../services/detail.js'
import { countConnections, getConnectionStatus, getReviewStats } from '../services/social.js'
import { countFollowers, countFollowing, isFollowing } from '../services/feed.js'
import { getRecommendations, logActivity, personalizeDiscover } from '../services/personalization.js'
import { searchContent } from '../services/search.js'

const router = Router()

router.get('/stats', (_req, res) => {
  res.json({ stats: getPlatformStats() })
})

router.get('/search', optionalAuth, (req, res) => {
  const { q = '', type = 'all', country = '', language = '', community = '', fuzziness = '0.5' } = req.query
  const results = searchContent({
    q,
    type,
    country,
    language,
    community,
    fuzziness: Number(fuzziness),
    user: req.user,
  })
  if (req.user && q) {
    logActivity(req.user.id, 'search', null, null, { query: q, type, country, tags: [type].filter(Boolean) })
  }
  res.json({ results, query: q, fuzziness: Number(fuzziness) })
})

router.get('/recommendations', optionalAuth, (req, res) => {
  res.json({
    items: getRecommendations(req.user).map((row) =>
      row.kind === 'recipe' ? formatRecipe(row, req.user?.id) : formatMove(row, req.user?.id),
    ),
  })
})

router.get('/discover', optionalAuth, (req, res) => {
  const { kind = 'all', community = '', personalized = 'true' } = req.query
  let items = tables.find('discover_items').map((row) => formatDiscoverItem(row, req.user?.id))

  if (kind !== 'all') {
    const mappedKind = kind === 'food' ? 'recipe' : kind === 'dance' ? 'move' : kind
    items = items.filter((item) => item.kind === mappedKind)
  }
  if (community) items = items.filter((item) => item.communitySlug === community)
  if (personalized === 'true') items = personalizeDiscover(items, req.user)

  if (req.user) logActivity(req.user.id, 'view', 'discover', null, { kind, community })
  res.json({ items })
})

router.get('/discover/:id', optionalAuth, (req, res) => {
  const detail = getDiscoverDetail(req.params.id, req.user?.id)
  if (!detail) return res.status(404).json({ error: 'Story not found.' })
  if (req.user) logActivity(req.user.id, 'view', 'discover', Number(req.params.id))
  res.json(detail)
})

router.get('/recipes', optionalAuth, (req, res) => {
  const { filter = 'all', community = '' } = req.query
  let rows = tables.find('recipes')

  if (community) {
    const comm = tables.findOne('communities', { slug: community })
    rows = rows.filter((row) => row.community_id === comm?.id)
  }
  if (filter === 'quick') {
    rows = rows.filter((row) => {
      const mins = Number.parseInt(row.time, 10)
      return !Number.isNaN(mins) && mins <= 20
    })
  }
  if (filter === 'weekend') rows = rows.filter((row) => ['Medium', 'Hard'].includes(row.level))
  if (filter === 'street food') {
    rows = rows.filter((row) => {
      const comm = tables.findOne('communities', { id: row.community_id })
      return comm?.slug === 'street-food' || parseJson(row.tags).includes('street food')
    })
  }
  rows = [...rows].sort((a, b) => b.saves - a.saves)

  if (req.user) logActivity(req.user.id, 'view', 'recipes', null, { filter, community })
  res.json({ recipes: rows.map((r) => formatRecipe(r, req.user?.id)) })
})

router.get('/recipes/:id', optionalAuth, (req, res) => {
  const row = tables.findOne('recipes', { id: Number(req.params.id) })
  if (!row) return res.status(404).json({ error: 'Recipe not found.' })
  if (req.user) logActivity(req.user.id, 'view', 'recipe', row.id)
  const recipe = formatRecipe(row, req.user?.id)
  const related = getRelatedRecipes(row.community_id, row.id, req.user?.id)
  const reviewStats = getReviewStats('recipe', row.id)
  res.json({ recipe, related, reviewStats })
})

router.post('/recipes', requireAuth, (req, res) => {
  const { title, description, time, level, image, communitySlug, country, ingredients, steps, tags, challengeId } = req.body ?? {}
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' })

  const community = communitySlug ? tables.findOne('communities', { slug: communitySlug }) : null
  const result = tables.insert('recipes', {
    title: String(title).trim(),
    description: String(description ?? '').slice(0, 800),
    time: time ?? '30 min',
    level: level ?? 'Easy',
    image: image ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    community_id: community?.id ?? null,
    country: country ?? req.user.country,
    ingredients: JSON.stringify(ingredients ?? []),
    steps: JSON.stringify(steps ?? []),
    tags: JSON.stringify(tags ?? []),
    saves: 0,
    creator_id: req.user.id,
  })

  const points = awardAndNotify(req.user.id, 40, { action: 'create_recipe', id: result.lastInsertRowid })
  addNotification(req.user.id, 'post', 'Recipe published', `"${title}" is live on Lyfstyl.`)

  const submission = maybeAutoSubmit(req.user, challengeId, 'recipe', result.lastInsertRowid)

  res.status(201).json({
    recipe: formatRecipe(tables.findOne('recipes', { id: result.lastInsertRowid }), req.user.id),
    points,
    challengeSubmission: submission?.submission ?? null,
    challengeMessage: submission?.message ?? null,
  })
})

router.get('/moves', optionalAuth, (req, res) => {
  const { filter = 'all', community = '' } = req.query
  let rows = tables.find('moves')

  if (community) {
    const comm = tables.findOne('communities', { slug: community })
    rows = rows.filter((row) => row.community_id === comm?.id)
  }
  if (filter === 'freestyle') rows = rows.filter((row) => row.style === 'Freestyle')
  if (filter === 'battle') {
    rows = rows.filter((row) => row.style === 'Battle' || parseJson(row.tags).includes('battle'))
  }
  if (filter === 'tutorials') {
    rows = rows.filter((row) => parseJson(row.tags).includes('tutorial'))
  }
  rows = [...rows].sort((a, b) => b.views - a.views)

  if (req.user) logActivity(req.user.id, 'view', 'moves', null, { filter, community })
  res.json({ moves: rows.map((m) => formatMove(m, req.user?.id)) })
})

router.get('/moves/:id', optionalAuth, (req, res) => {
  const row = tables.findOne('moves', { id: Number(req.params.id) })
  if (!row) return res.status(404).json({ error: 'Move not found.' })
  tables.increment('moves', { id: row.id }, 'views', 1)
  if (req.user) logActivity(req.user.id, 'view', 'move', row.id)
  const move = formatMove({ ...row, views: row.views + 1 }, req.user?.id)
  const related = getRelatedMoves(row.community_id, row.id, req.user?.id)
  const reviewStats = getReviewStats('move', row.id)
  res.json({ move, related, reviewStats })
})

router.post('/moves', requireAuth, (req, res) => {
  const { title, description, style, length, image, videoUrl, communitySlug, country, tags, challengeId } = req.body ?? {}
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' })

  const community = communitySlug ? tables.findOne('communities', { slug: communitySlug }) : null
  const result = tables.insert('moves', {
    title: String(title).trim(),
    description: String(description ?? '').slice(0, 800),
    style: style ?? 'Freestyle',
    length: length ?? '30s',
    image: image ?? 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80',
    video_url: videoUrl ?? '',
    community_id: community?.id ?? null,
    country: country ?? req.user.country,
    tags: JSON.stringify(tags ?? []),
    views: 0,
    creator_id: req.user.id,
  })

  const points = awardAndNotify(req.user.id, 40, { action: 'create_move', id: result.lastInsertRowid })
  addNotification(req.user.id, 'post', 'Move published', `"${title}" is live on Lyfstyl.`)

  const submission = maybeAutoSubmit(req.user, challengeId, 'move', result.lastInsertRowid)

  res.status(201).json({
    move: formatMove(tables.findOne('moves', { id: result.lastInsertRowid }), req.user.id),
    points,
    challengeSubmission: submission?.submission ?? null,
    challengeMessage: submission?.message ?? null,
  })
})

router.get('/members', (_req, res) => {
  const members = tables
    .find('users')
    .filter((u) => u.provider === 'demo' || u.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 12)
    .map((row) => {
      const interests = parseJson(row.interests)
      return {
        id: row.id,
        name: row.name,
        avatar: row.avatar_style,
        country: row.country,
        interests,
        role: `${interests.includes('food') ? 'Creator' : 'Dancer'} · ${row.country}`,
        blurb: row.bio ?? (row.points >= 400 ? 'Active in competitions and community challenges.' : 'Exploring Lyfstyl communities.'),
        points: row.points,
      }
    })

  res.json({ members })
})

router.get('/members/:id', optionalAuth, (req, res) => {
  const row = tables.findOne('users', { id: Number(req.params.id) })
  if (!row) return res.status(404).json({ error: 'Creator not found.' })

  const recipes = tables.find('recipes', { creator_id: row.id }).map((r) => formatRecipe(r, req.user?.id))
  const moves = tables.find('moves', { creator_id: row.id }).map((m) => formatMove(m, req.user?.id))
  const connectionStatus = getConnectionStatus(req.user?.id, row.id)

  res.json({
    member: {
      id: row.id,
      name: row.name,
      avatar: row.avatar_style,
      country: row.country,
      bio: row.bio ?? '',
      points: row.points,
      interests: parseJson(row.interests),
      connectionCount: countConnections(row.id),
      followerCount: countFollowers(row.id),
      followingCount: countFollowing(row.id),
      recipeCount: recipes.length,
      moveCount: moves.length,
    },
    connectionStatus,
    isFollowing: isFollowing(req.user?.id, row.id),
    recipes,
    moves,
  })
})

export default router
