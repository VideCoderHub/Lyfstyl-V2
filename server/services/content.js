import { parseJson, tables, userToJson } from '../db.js'
import { getMyChallenges } from './challenges.js'
import { getUserCommunities } from './communities.js'
import { awardPoints } from './gamification.js'

function applauseCount(entityType, entityId) {
  return tables.count('applause', { entity_type: entityType, entity_id: entityId })
}

function applaudedBy(userId, entityType, entityId) {
  if (!userId) return false
  return Boolean(
    tables.findOne('applause', { user_id: userId, entity_type: entityType, entity_id: entityId }),
  )
}

export function communityFor(id) {
  const c = id ? tables.findOne('communities', { id }) : null
  return c
    ? { communitySlug: c.slug, communityName: c.name, vertical: c.vertical, category: c.category }
    : {}
}

export function creatorFor(id) {
  const u = id ? tables.findOne('users', { id }) : null
  if (!u) return { creatorName: 'Lyfstyl Creator', creatorId: null }
  return {
    creatorId: u.id,
    creatorName: u.name,
    creatorCountry: u.country,
    creatorAvatar: u.avatar_style,
  }
}

export function addNotification(userId, type, title, body, meta = {}) {
  tables.insert('notifications', {
    user_id: userId,
    type,
    title,
    body,
    meta: JSON.stringify(meta),
    read: 0,
    created_at: new Date().toISOString(),
  })
}

export function getNotifications(userId) {
  return tables
    .find('notifications', { user_id: userId })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 30)
    .map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      meta: parseJson(n.meta, {}),
      read: Boolean(n.read),
      createdAt: n.created_at,
    }))
}

export function formatRecipe(row, userId) {
  const meta = communityFor(row.community_id)
  const creator = creatorFor(row.creator_id)
  const starred = userId
    ? tables.findOne('content_stars', { user_id: userId, entity_type: 'recipe', entity_id: row.id })
    : null
  const saved = userId
    ? tables.findOne('saved_items', { user_id: userId, entity_type: 'recipe', entity_id: row.id })
    : null
  const commentCount = tables.count('comments', { entity_type: 'recipe', entity_id: row.id })

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    ingredients: parseJson(row.ingredients),
    steps: parseJson(row.steps),
    time: row.time,
    level: row.level,
    saves: row.saves >= 1000 ? `${(row.saves / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(row.saves),
    savesCount: row.saves,
    image: row.image,
    country: row.country,
    tags: parseJson(row.tags),
    ...meta,
    ...creator,
    commentCount,
    applauseCount: applauseCount('recipe', row.id),
    applauded: applaudedBy(userId, 'recipe', row.id),
    starred: Boolean(starred),
    saved: Boolean(saved),
    rating: starred?.rating ?? null,
  }
}

export function formatMove(row, userId) {
  const meta = communityFor(row.community_id)
  const creator = creatorFor(row.creator_id)
  const starred = userId
    ? tables.findOne('content_stars', { user_id: userId, entity_type: 'move', entity_id: row.id })
    : null
  const saved = userId
    ? tables.findOne('saved_items', { user_id: userId, entity_type: 'move', entity_id: row.id })
    : null
  const commentCount = tables.count('comments', { entity_type: 'move', entity_id: row.id })

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    style: row.style,
    length: row.length,
    videoUrl: row.video_url ?? '',
    views: row.views >= 1000 ? `${Math.round(row.views / 1000)}k` : String(row.views),
    viewsCount: row.views,
    image: row.image,
    country: row.country,
    tags: parseJson(row.tags),
    ...meta,
    ...creator,
    commentCount,
    applauseCount: applauseCount('move', row.id),
    applauded: applaudedBy(userId, 'move', row.id),
    starred: Boolean(starred),
    saved: Boolean(saved),
    rating: starred?.rating ?? null,
  }
}

export function notifyBadgeEarned(userId, badges) {
  for (const badge of badges) {
    addNotification(userId, 'badge', `Badge unlocked: ${badge.name}`, badge.description, { slug: badge.slug })
  }
}

export function getDashboard(userId) {
  const user = tables.findOne('users', { id: userId })
  const badges = tables.find('user_badges', { user_id: userId })
  const badgeDetails = badges.map((b) => tables.findOne('badges', { id: b.badge_id })).filter(Boolean)

  const saved = tables
    .find('saved_items', { user_id: userId })
    .sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at))
    .slice(0, 12)
    .map((item) => {
      if (item.entity_type === 'recipe') {
        const row = tables.findOne('recipes', { id: item.entity_id })
        return row ? { kind: 'recipe', ...formatRecipe(row, userId) } : null
      }
      const row = tables.findOne('moves', { id: item.entity_id })
      return row ? { kind: 'move', ...formatMove(row, userId) } : null
    })
    .filter(Boolean)

  const challenges = getMyChallenges(userId)
  const communities = getUserCommunities(userId)

  const myRecipes = tables.find('recipes', { creator_id: userId }).length
  const myMoves = tables.find('moves', { creator_id: userId }).length

  return {
    user: userToJson(user),
    stats: {
      points: user.points,
      badges: badgeDetails.length,
      communities: tables.count('user_communities', { user_id: userId }),
      saved: tables.count('saved_items', { user_id: userId }),
      challenges: challenges.length,
      posts: myRecipes + myMoves,
    },
    badges: badgeDetails.map((b) => ({
      slug: b.slug,
      name: b.name,
      description: b.description,
      category: b.category,
    })),
    saved,
    challenges,
    communities,
    notifications: getNotifications(userId),
  }
}

export function awardAndNotify(userId, points, meta) {
  const before = tables.find('user_badges', { user_id: userId }).map((b) => b.badge_id)
  const total = awardPoints(userId, points, meta)
  const after = tables.find('user_badges', { user_id: userId })
  const newBadgeIds = after.filter((b) => !before.includes(b.badge_id)).map((b) => b.badge_id)
  const newBadges = newBadgeIds.map((id) => tables.findOne('badges', { id })).filter(Boolean)
  notifyBadgeEarned(userId, newBadges)
  return total
}
