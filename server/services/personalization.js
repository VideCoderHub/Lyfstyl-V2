import { parseJson, tables } from '../db.js'

function scoreItem(item, user, joinedCommunityIds, activityTags) {
  let score = 0

  if (user?.country && item.country === user.country) score += 4
  if (user?.language && item.language === user.language) score += 1

  const interests = user?.interests ?? []
  if (interests.includes('food') && (item.kind === 'recipe' || item.vertical === 'food')) score += 3
  if (interests.includes('dance') && (item.kind === 'move' || item.vertical === 'dance')) score += 3
  if (interests.includes('both')) score += 2

  if (item.community_id && joinedCommunityIds.has(item.community_id)) score += 5

  const tags = parseJson(item.tags, [])
  for (const tag of tags) {
    if (activityTags.has(String(tag).toLowerCase())) score += 2
  }

  if (item.saves) score += Math.min(item.saves / 1000, 3)
  if (item.views) score += Math.min(item.views / 50000, 3)

  return score
}

export function getActivityTags(userId) {
  if (!userId) return new Set()

  const rows = tables
    .find('activity_log', { user_id: userId })
    .filter((row) => ['view', 'search', 'star'].includes(row.action))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 40)

  const tags = new Set()
  for (const row of rows) {
    const meta = parseJson(row.meta, {})
    for (const tag of meta.tags ?? []) tags.add(String(tag).toLowerCase())
    if (meta.query) tags.add(String(meta.query).toLowerCase())
  }
  return tags
}

export function getJoinedCommunityIds(userId) {
  if (!userId) return new Set()
  return new Set(tables.find('user_communities', { user_id: userId }).map((row) => row.community_id))
}

export function personalizeDiscover(items, user) {
  const joined = getJoinedCommunityIds(user?.id)
  const activityTags = getActivityTags(user?.id)

  return [...items]
    .map((item) => ({
      ...item,
      relevanceScore: scoreItem(item, user, joined, activityTags),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

function withCommunity(row, kind) {
  const community = row.community_id ? tables.findOne('communities', { id: row.community_id }) : null
  return {
    ...row,
    tags: parseJson(row.tags),
    community_slug: community?.slug,
    community_name: community?.name,
    kind,
    vertical: community?.vertical,
  }
}

export function getRecommendations(user) {
  const joined = getJoinedCommunityIds(user?.id)
  const activityTags = getActivityTags(user?.id)

  const recipes = tables.find('recipes').map((row) => withCommunity(row, 'recipe'))
  const moves = tables.find('moves').map((row) => withCommunity(row, 'move'))

  return [...recipes, ...moves]
    .map((row) => ({
      ...row,
      relevanceScore: scoreItem({ ...row, vertical: row.vertical }, user, joined, activityTags),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8)
}

export function logActivity(userId, action, entityType, entityId, meta = {}) {
  tables.insert('activity_log', {
    user_id: userId ?? null,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    meta: JSON.stringify(meta),
  })
}
