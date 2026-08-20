import { parseJson, tables } from '../db.js'
import { formatMove, formatRecipe } from './content.js'
import { formatChallengeRow } from './challenges.js'

const STORY_BODIES = {
  'Night market freestyle': 'Creators in Seoul paired late-night street food with freestyle drops — proof that Lyfstyl communities blur kitchen and cypher culture.',
  "Grandma's feast cypher": 'A soul-food Sunday turned into a family cypher. Recipes and movement shared across generations in the Soul Food community.',
}

export function resolveDiscoverRef(item) {
  if (item.ref_id) return item.ref_id
  if (item.kind === 'recipe') {
    return tables.find('recipes').find((r) => r.title === item.title)?.id ?? null
  }
  if (item.kind === 'move') {
    return tables.find('moves').find((m) => m.title === item.title)?.id ?? null
  }
  return null
}

export function discoverDetailUrl(item) {
  const refId = resolveDiscoverRef(item)
  if (item.kind === 'recipe' && refId) return `/recipes/${refId}`
  if (item.kind === 'move' && refId) return `/moves/${refId}`
  if (item.kind === 'story') return `/discover/${item.id}`
  return null
}

export function formatDiscoverItem(row, userId) {
  const c = row.community_id ? tables.findOne('communities', { id: row.community_id }) : null
  const refId = resolveDiscoverRef(row)
  return {
    id: row.id,
    tag: row.tag,
    title: row.title,
    meta: row.meta,
    image: row.image,
    kind: row.kind,
    country: row.country,
    body: row.body ?? STORY_BODIES[row.title] ?? '',
    communitySlug: c?.slug,
    communityName: c?.name,
    vertical: c?.vertical,
    contentId: refId,
    detailUrl: discoverDetailUrl(row),
  }
}

export function getDiscoverDetail(id, userId) {
  const row = tables.findOne('discover_items', { id: Number(id) })
  if (!row) return null

  const item = formatDiscoverItem(row, userId)
  const refId = item.contentId

  let linked = null
  if (item.kind === 'recipe' && refId) {
    const recipe = tables.findOne('recipes', { id: refId })
    if (recipe) linked = { kind: 'recipe', ...formatRecipe(recipe, userId) }
  }
  if (item.kind === 'move' && refId) {
    const move = tables.findOne('moves', { id: refId })
    if (move) linked = { kind: 'move', ...formatMove(move, userId) }
  }

  const related = tables
    .find('discover_items')
    .filter((d) => d.id !== row.id && d.community_id === row.community_id)
    .slice(0, 3)
    .map((d) => formatDiscoverItem(d, userId))

  return { item, linked, related }
}

export function getRelatedRecipes(communityId, excludeId, userId, limit = 3) {
  return tables
    .find('recipes')
    .filter((r) => r.community_id === communityId && r.id !== excludeId)
    .slice(0, limit)
    .map((r) => formatRecipe(r, userId))
}

export function getRelatedMoves(communityId, excludeId, userId, limit = 3) {
  return tables
    .find('moves')
    .filter((m) => m.community_id === communityId && m.id !== excludeId)
    .slice(0, limit)
    .map((m) => formatMove(m, userId))
}

export function formatChallenge(row, userId) {
  return formatChallengeRow(row, userId)
}
