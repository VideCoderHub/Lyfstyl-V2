import { Router } from 'express'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import {
  createCommunityPost,
  formatCommunity,
  getCommunityDetail,
  getCommunityPosts,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
} from '../services/communities.js'
import { tables } from '../db.js'
import { logActivity } from '../services/personalization.js'

const router = Router()

router.get('/', optionalAuth, (req, res) => {
  const { vertical, category, joined } = req.query
  let communities = tables.find('communities')

  if (vertical) communities = communities.filter((c) => c.vertical === vertical)
  if (category) communities = communities.filter((c) => c.category === category)

  const joinedIds = req.user
    ? new Set(tables.find('user_communities', { user_id: req.user.id }).map((l) => l.community_id))
    : new Set()

  if (joined === 'true' && req.user) {
    communities = communities.filter((c) => joinedIds.has(c.id))
  }

  communities.sort((a, b) => {
    const membersA = tables.count('user_communities', { community_id: a.id })
    const membersB = tables.count('user_communities', { community_id: b.id })
    return membersB - membersA || a.name.localeCompare(b.name)
  })

  res.json({
    communities: communities.map((c) => formatCommunity(c, req.user?.id)),
  })
})

router.get('/mine', requireAuth, (req, res) => {
  res.json({ communities: getUserCommunities(req.user.id) })
})

router.get('/:slug', optionalAuth, (req, res) => {
  const detail = getCommunityDetail(req.params.slug, req.user?.id)
  if (!detail) return res.status(404).json({ error: 'Community not found.' })
  res.json(detail)
})

router.get('/:slug/posts', optionalAuth, (req, res) => {
  const community = tables.findOne('communities', { slug: req.params.slug })
  if (!community) return res.status(404).json({ error: 'Community not found.' })
  res.json({ posts: getCommunityPosts(community.id) })
})

router.post('/:slug/posts', requireAuth, (req, res) => {
  const result = createCommunityPost(req.user, req.params.slug, req.body?.body)
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })

  const community = tables.findOne('communities', { slug: req.params.slug })
  logActivity(req.user.id, 'community_post', 'community', community?.id, { slug: req.params.slug })

  res.status(201).json(result)
})

router.post('/:slug/join', requireAuth, (req, res) => {
  const result = joinCommunity(req.user, req.params.slug)
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })

  logActivity(req.user.id, 'join_community', 'community', result.community.id, { slug: req.params.slug })
  res.json(result)
})

router.delete('/:slug/join', requireAuth, (req, res) => {
  const result = leaveCommunity(req.user, req.params.slug)
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })
  res.json(result)
})

export default router
