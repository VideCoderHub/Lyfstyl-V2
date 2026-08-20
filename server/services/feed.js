import { parseJson, tables } from '../db.js'
import { formatMove, formatRecipe } from './content.js'
import { formatUserPublic } from './social.js'

export function countFollowers(userId) {
  return tables.count('follows', { following_id: userId })
}

export function countFollowing(userId) {
  return tables.count('follows', { follower_id: userId })
}

export function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false
  return Boolean(tables.findOne('follows', { follower_id: followerId, following_id: followingId }))
}

export function countApplause(entityType, entityId) {
  return tables.count('applause', { entity_type: entityType, entity_id: Number(entityId) })
}

export function hasApplauded(userId, entityType, entityId) {
  if (!userId) return false
  return Boolean(
    tables.findOne('applause', {
      user_id: userId,
      entity_type: entityType,
      entity_id: Number(entityId),
    }),
  )
}

export function getFollowingIds(userId) {
  return tables.find('follows', { follower_id: userId }).map((f) => f.following_id)
}

export function getFollowersIds(userId) {
  return tables.find('follows', { following_id: userId }).map((f) => f.follower_id)
}

export function getSocialFeed(user, tab = 'following') {
  if (!user) return { items: [], suggestions: [] }

  if (tab === 'activity') {
    return { items: getActivityItems(user.id), suggestions: [] }
  }

  if (tab === 'suggestions') {
    return { items: [], suggestions: getCreatorSuggestions(user.id, 8) }
  }

  const followingIds = getFollowingIds(user.id)
  const items = []

  for (const creatorId of followingIds) {
    const creator = tables.findOne('users', { id: creatorId })
    if (!creator) continue

    const recipes = tables
      .find('recipes', { creator_id: creatorId })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)

    const moves = tables
      .find('moves', { creator_id: creatorId })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)

    for (const recipe of recipes) {
      items.push(buildFeedItem('recipe', recipe, creator, user.id))
    }
    for (const move of moves) {
      items.push(buildFeedItem('move', move, creator, user.id))
    }
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return {
    items: items.slice(0, 24),
    suggestions: followingIds.length < 3 ? getCreatorSuggestions(user.id, 6) : [],
  }
}

function buildFeedItem(kind, row, creator, viewerId) {
  const formatted = kind === 'recipe' ? formatRecipe(row, viewerId) : formatMove(row, viewerId)
  return {
    kind,
    id: row.id,
    title: row.title,
    image: row.image,
    meta: kind === 'recipe' ? `${row.time} · ${row.level}` : `${row.style} · ${row.length}`,
    detailUrl: kind === 'recipe' ? `/recipes/${row.id}` : `/moves/${row.id}`,
    tag: kind === 'recipe' ? 'Recipe' : 'Move',
    tagClass: kind === 'recipe' ? 'tag--food' : 'tag--dance',
    portrait: kind === 'move',
    play: kind === 'move',
    applauseCount: countApplause(kind, row.id),
    commentCount: formatted.commentCount,
    creator: formatUserPublic(creator),
    createdAt: row.created_at,
    communityName: formatted.communityName,
  }
}

export function getActivityItems(userId, limit = 20) {
  return tables
    .find('activity_log', { user_id: userId })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entity_type,
      entityId: entry.entity_id,
      meta: parseJson(entry.meta, {}),
      createdAt: entry.created_at,
      label: activityLabel(entry),
    }))
}

function activityLabel(entry) {
  const labels = {
    view: 'Viewed content',
    star: 'Starred content',
    search: 'Searched Lyfstyl',
    join_community: 'Joined a community',
    enter_challenge: 'Entered a challenge',
    onboarding_complete: 'Completed onboarding',
  }
  return labels[entry.action] ?? entry.action
}

export function getCreatorSuggestions(userId, limit = 8) {
  const user = tables.findOne('users', { id: userId })
  if (!user) return []

  const following = new Set(getFollowingIds(userId))
  following.add(userId)

  const joinedCommunityIds = tables
    .find('user_communities', { user_id: userId })
    .map((r) => r.community_id)

  const interests = parseJson(user.interests, [])

  const candidates = tables
    .find('users')
    .filter((u) => !following.has(u.id) && u.onboarding_complete)
    .map((candidate) => {
      let score = candidate.points / 100
      if (candidate.country === user.country) score += 3

      const candidateCommunities = tables
        .find('user_communities', { user_id: candidate.id })
        .map((r) => r.community_id)
      const shared = candidateCommunities.filter((id) => joinedCommunityIds.includes(id)).length
      score += shared * 4

      const candidateInterests = parseJson(candidate.interests, [])
      if (interests.some((i) => candidateInterests.includes(i))) score += 2

      const recipeCount = tables.count('recipes', { creator_id: candidate.id })
      const moveCount = tables.count('moves', { creator_id: candidate.id })
      score += recipeCount + moveCount

      return { user: formatUserPublic(candidate), score, recipeCount, moveCount }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return candidates
}

export function getPeople(userId, filter = 'suggested') {
  if (filter === 'following') {
    return getFollowingIds(userId)
      .map((id) => tables.findOne('users', { id }))
      .filter(Boolean)
      .map((u) => ({
        ...formatUserPublic(u),
        followers: countFollowers(u.id),
        following: countFollowing(u.id),
        isFollowing: true,
      }))
  }

  return getCreatorSuggestions(userId, 12).map((c) => ({
    ...c.user,
    followers: countFollowers(c.user.id),
    recipeCount: c.recipeCount,
    moveCount: c.moveCount,
    isFollowing: isFollowing(userId, c.user.id),
  }))
}
