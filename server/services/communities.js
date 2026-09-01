import { parseJson, tables } from '../db.js'
import { addNotification } from './content.js'
import { awardPoints } from './gamification.js'
import { formatMove, formatRecipe } from './content.js'
import { formatChallengeRow } from './challenges.js'
import { formatUserPublic } from './social.js'

export function countCommunityMembers(communityId) {
  return tables.count('user_communities', { community_id: communityId })
}

export function isCommunityMember(userId, communityId) {
  if (!userId) return false
  return Boolean(tables.findOne('user_communities', { user_id: userId, community_id: communityId }))
}

export function formatCommunity(row, userId) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    vertical: row.vertical,
    description: row.description,
    memberCount: countCommunityMembers(row.id),
    joined: isCommunityMember(userId, row.id),
    recipeCount: tables.count('recipes', { community_id: row.id }),
    moveCount: tables.count('moves', { community_id: row.id }),
    challengeCount: tables.count('challenges', { community_id: row.id }),
    postCount: tables.count('community_posts', { community_id: row.id }),
  }
}

export function getUserCommunities(userId) {
  return tables
    .find('user_communities', { user_id: userId })
    .map((link) => {
      const community = tables.findOne('communities', { id: link.community_id })
      if (!community) return null
      return {
        ...formatCommunity(community, userId),
        joinedAt: link.joined_at,
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
}

export function getCommunityMembers(communityId, limit = 12) {
  return tables
    .find('user_communities', { community_id: communityId })
    .sort((a, b) => new Date(b.joined_at) - new Date(a.joined_at))
    .slice(0, limit)
    .map((link) => {
      const user = tables.findOne('users', { id: link.user_id })
      if (!user) return null
      return {
        ...formatUserPublic(user),
        joinedAt: link.joined_at,
      }
    })
    .filter(Boolean)
}

export function getTopCreators(communityId, limit = 6) {
  const counts = new Map()

  for (const recipe of tables.find('recipes', { community_id: communityId })) {
    if (!recipe.creator_id) continue
    counts.set(recipe.creator_id, (counts.get(recipe.creator_id) ?? 0) + 1)
  }
  for (const move of tables.find('moves', { community_id: communityId })) {
    if (!move.creator_id) continue
    counts.set(move.creator_id, (counts.get(move.creator_id) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([userId, posts]) => {
      const user = tables.findOne('users', { id: userId })
      if (!user) return null
      return { ...formatUserPublic(user), posts }
    })
    .filter(Boolean)
}

export function getCommunityFeed(communityId, userId, limit = 12) {
  const recipes = tables
    .find('recipes', { community_id: communityId })
    .sort((a, b) => b.saves - a.saves)
    .slice(0, limit)
    .map((r) => formatRecipe(r, userId))

  const moves = tables
    .find('moves', { community_id: communityId })
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map((m) => formatMove(m, userId))

  const challenges = tables
    .find('challenges', { community_id: communityId })
    .map((c) => formatChallengeRow(c, userId))
    .filter((c) => c.status === 'active')
    .slice(0, 6)

  return { recipes, moves, challenges }
}

export function formatCommunityPost(row) {
  const author = tables.findOne('users', { id: row.user_id })
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: author ? formatUserPublic(author) : null,
  }
}

export function getCommunityPosts(communityId, limit = 30) {
  return tables
    .find('community_posts', { community_id: communityId })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
    .map(formatCommunityPost)
}

export function getCommunityActivity(communityId, limit = 12) {
  const items = []

  for (const post of tables.find('community_posts', { community_id: communityId })) {
    const author = tables.findOne('users', { id: post.user_id })
    items.push({
      id: `post-${post.id}`,
      type: 'discussion',
      label: `${author?.name ?? 'Member'} posted in discussion`,
      createdAt: post.created_at,
      href: `/community/${tables.findOne('communities', { id: communityId })?.slug}#discussion`,
    })
  }

  for (const recipe of tables.find('recipes', { community_id: communityId })) {
    const creator = recipe.creator_id ? tables.findOne('users', { id: recipe.creator_id }) : null
    items.push({
      id: `recipe-${recipe.id}`,
      type: 'recipe',
      label: `${creator?.name ?? 'Creator'} shared ${recipe.title}`,
      createdAt: recipe.created_at ?? new Date(0).toISOString(),
      href: `/recipes/${recipe.id}`,
    })
  }

  for (const move of tables.find('moves', { community_id: communityId })) {
    const creator = move.creator_id ? tables.findOne('users', { id: move.creator_id }) : null
    items.push({
      id: `move-${move.id}`,
      type: 'move',
      label: `${creator?.name ?? 'Creator'} dropped ${move.title}`,
      createdAt: move.created_at ?? new Date(0).toISOString(),
      href: `/moves/${move.id}`,
    })
  }

  for (const link of tables.find('user_communities', { community_id: communityId })) {
    const user = tables.findOne('users', { id: link.user_id })
    items.push({
      id: `join-${link.id}`,
      type: 'join',
      label: `${user?.name ?? 'Creator'} joined the community`,
      createdAt: link.joined_at,
      href: user ? `/creators/${user.id}` : null,
    })
  }

  return items
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export function getCommunityDetail(slug, userId) {
  const row = tables.findOne('communities', { slug })
  if (!row) return null

  const community = formatCommunity(row, userId)
  let feed = getCommunityFeed(row.id, userId)

  if (slug === 'dance') {
    const danceRows = tables.find('communities', { vertical: 'dance' }).filter((c) => c.slug !== 'dance')
    const danceIds = danceRows.map((c) => c.id)

    feed = {
      ...feed,
      moves: tables
        .find('moves')
        .filter((m) => danceIds.includes(m.community_id))
        .sort((a, b) => b.views - a.views)
        .slice(0, 12)
        .map((m) => formatMove(m, userId)),
      challenges: tables
        .find('challenges')
        .filter((c) => danceIds.includes(c.community_id))
        .map((c) => formatChallengeRow(c, userId))
        .filter((c) => c.status === 'active')
        .slice(0, 6),
    }

    community.moveCount = tables.find('moves').filter((m) => danceIds.includes(m.community_id)).length
    community.challengeCount = tables.find('challenges').filter((c) => danceIds.includes(c.community_id)).length
    community.memberCount = danceRows.reduce(
      (sum, danceRow) => sum + countCommunityMembers(danceRow.id),
      countCommunityMembers(row.id),
    )
  }

  return {
    community,
    feed,
    members: getCommunityMembers(row.id),
    topCreators: getTopCreators(row.id),
    posts: getCommunityPosts(row.id),
    activity: getCommunityActivity(row.id),
  }
}

export function joinCommunity(user, slug) {
  const community = tables.findOne('communities', { slug })
  if (!community) return { error: 'Community not found.', status: 404 }

  const existing = tables.findOne('user_communities', {
    user_id: user.id,
    community_id: community.id,
  })

  if (!existing) {
    tables.insert('user_communities', {
      user_id: user.id,
      community_id: community.id,
      joined_at: new Date().toISOString(),
    })
    tables.increment('communities', { id: community.id }, 'member_count', 1)
    awardPoints(user.id, 15, { community: community.slug })
    addNotification(user.id, 'community', `Welcome to ${community.name}`, 'Your feed is now personalized for this community.', {
      href: `/community/${community.slug}`,
    })
  }

  return {
    ok: true,
    joined: true,
    community: formatCommunity(community, user.id),
    message: `Joined ${community.name} — +15 creator points.`,
  }
}

export function leaveCommunity(user, slug) {
  const community = tables.findOne('communities', { slug })
  if (!community) return { error: 'Community not found.', status: 404 }

  const result = tables.delete('user_communities', {
    user_id: user.id,
    community_id: community.id,
  })

  if (result.changes) {
    tables.increment('communities', { id: community.id }, 'member_count', -1)
  }

  return {
    ok: true,
    joined: false,
    community: formatCommunity(community, user.id),
    message: `Left ${community.name}.`,
  }
}

export function createCommunityPost(user, slug, body) {
  const community = tables.findOne('communities', { slug })
  if (!community) return { error: 'Community not found.', status: 404 }

  if (!isCommunityMember(user.id, community.id)) {
    return { error: 'Join this community to post in discussion.', status: 403 }
  }

  const text = String(body ?? '').trim()
  if (!text) return { error: 'Post body is required.', status: 400 }
  if (text.length > 1000) return { error: 'Post is too long (max 1000 characters).', status: 400 }

  const result = tables.insert('community_posts', {
    community_id: community.id,
    user_id: user.id,
    body: text,
  })

  awardPoints(user.id, 5, { community: community.slug, postId: result.lastInsertRowid })

  const post = formatCommunityPost(
    tables.findOne('community_posts', { id: result.lastInsertRowid }),
  )

  return {
    ok: true,
    post,
    message: 'Posted to community discussion — +5 points.',
  }
}

export function syncCommunityMemberCounts() {
  for (const community of tables.find('communities')) {
    const real = tables.count('user_communities', { community_id: community.id })
    if (real !== community.member_count) {
      tables.update('communities', { id: community.id }, { member_count: real })
    }
  }
}
