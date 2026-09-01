import { tables } from '../db.js'

export function awardPoints(userId, points, meta = {}) {
  tables.increment('users', { id: userId }, 'points', points)
  tables.insert('activity_log', {
    user_id: userId,
    action: 'points_awarded',
    entity_type: null,
    entity_id: null,
    meta: JSON.stringify({ points, ...meta }),
  })
  checkBadges(userId)
  return tables.findOne('users', { id: userId }).points
}

export function checkBadges(userId) {
  const user = tables.findOne('users', { id: userId })
  if (!user) return []

  const interests = JSON.parse(user.interests || '[]')
  const foodFocus = interests.includes('food') || interests.includes('both')
  const danceFocus = interests.includes('dance') || interests.includes('both')
  const badges = tables.find('badges', {}, (a, b) => a.threshold - b.threshold)
  const earned = []

  for (const badge of badges) {
    const already = tables.findOne('user_badges', { user_id: userId, badge_id: badge.id })
    if (already) continue

    let qualifies = false
    if (badge.category === 'general' && user.points >= badge.threshold) qualifies = true
    if (badge.category === 'food' && foodFocus && user.points >= badge.threshold) qualifies = true
    if (badge.category === 'dance' && danceFocus && user.points >= badge.threshold) qualifies = true

    if (qualifies) {
      tables.insert('user_badges', { user_id: userId, badge_id: badge.id, earned_at: new Date().toISOString() })
      earned.push(badge)
    }
  }

  return earned
}

export function getUserBadges(userId) {
  const links = tables.find('user_badges', { user_id: userId })
  return links
    .map((link) => {
      const badge = tables.findOne('badges', { id: link.badge_id })
      return badge
        ? {
            slug: badge.slug,
            name: badge.name,
            description: badge.description,
            category: badge.category,
            earnedAt: link.earned_at,
          }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
}

export function getPlatformStats() {
  const recipes = tables.count('recipes')
  const moves = tables.count('moves')
  const users = tables.count('users')

  const creatorIds = new Set()
  for (const recipe of tables.find('recipes')) {
    if (recipe.creator_id) creatorIds.add(recipe.creator_id)
  }
  for (const move of tables.find('moves')) {
    if (move.creator_id) creatorIds.add(move.creator_id)
  }

  const countries = new Set([
    ...tables.find('recipes').map((r) => r.country).filter(Boolean),
    ...tables.find('moves').map((m) => m.country).filter(Boolean),
    ...tables.find('users').map((u) => u.country).filter(Boolean),
  ])

  return {
    creators: Math.max(creatorIds.size, users),
    recipesShared: recipes,
    danceClips: moves,
    countries: countries.size,
  }
}
