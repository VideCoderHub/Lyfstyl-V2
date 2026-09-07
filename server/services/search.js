import { parseJson, tables } from '../db.js'
import { formatDiscoverItem } from './detail.js'
import { creatorFor } from './content.js'

function normalize(text) {
  return String(text ?? '').toLowerCase().trim()
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    }
  }
  return matrix[b.length][a.length]
}

function fuzzyMatch(query, target, fuzziness) {
  const q = normalize(query)
  const t = normalize(target)
  if (!q) return 1
  if (t.includes(q)) return 1
  if (fuzziness <= 0.1) return 0
  const distance = levenshtein(q, t.slice(0, Math.max(q.length + 4, 8)))
  const maxDistance = Math.ceil(q.length * fuzziness)
  return distance <= maxDistance ? 1 - distance / (maxDistance + 1) : 0
}

function scoreRecord(record, query, fuzziness) {
  const fields = [record.title, record.meta, record.tag, record.style, record.community_name, ...(record.tags ?? [])]
  let best = 0
  for (const field of fields) best = Math.max(best, fuzzyMatch(query, field, fuzziness))
  return best
}

function communityFor(id) {
  const community = id ? tables.findOne('communities', { id }) : null
  return { community_slug: community?.slug, community_name: community?.name }
}

const COUNTRY_ALIASES = {
  kenya: 'Kenya',
  japan: 'Japan',
  nigeria: 'Nigeria',
  italy: 'Italy',
  mexico: 'Mexico',
  korea: 'South Korea',
  'south korea': 'South Korea',
  usa: 'USA',
  america: 'USA',
  uk: 'UK',
  britain: 'UK',
  'south africa': 'South Africa',
}

export function parseSemanticQuery(rawQuery = '') {
  let q = String(rawQuery).trim()
  let country = ''
  let type = 'all'
  let level = ''
  const tags = []
  const lower = q.toLowerCase()

  for (const [alias, value] of Object.entries(COUNTRY_ALIASES)) {
    if (lower.includes(alias)) {
      country = value
      q = q.replace(new RegExp(alias, 'i'), '').trim()
      break
    }
  }

  if (/\b(dance|move|battle|cypher|footwork|choreo)\b/i.test(lower)) type = 'move'
  if (/\b(recipe|food|cook|dish|meal|kitchen|bake)\b/i.test(lower)) type = 'recipe'
  if (/\b(story|discover)\b/i.test(lower)) type = 'story'
  if (/\b(community|communities)\b/i.test(lower)) type = 'community'

  if (/\b(easy|beginner|simple)\b/i.test(lower)) {
    level = 'Easy'
    tags.push('quick')
  }
  if (/\b(quick|fast|under\s*\d+\s*min)\b/i.test(lower)) tags.push('quick')
  if (/\b(weekend|slow)\b/i.test(lower)) tags.push('weekend')
  if (/\b(street food|street)\b/i.test(lower)) tags.push('street food')
  if (/\b(healthy|wellness)\b/i.test(lower)) tags.push('healthy')
  if (/\b(tutorial|learn)\b/i.test(lower)) tags.push('tutorial')

  q = q.replace(/\b(from|in|for|with|the|a|an)\b/gi, ' ').replace(/\s+/g, ' ').trim()

  return { q, country, type, level, tags, semantic: Boolean(country || type !== 'all' || tags.length || level) }
}

export function searchContent({
  q = '',
  type = 'all',
  country = '',
  language = '',
  community = '',
  creator = '',
  level = '',
  fuzziness = 0.5,
  user,
  semantic = false,
}) {
  const results = []
  const parsed = semantic && q ? parseSemanticQuery(q) : { q, country: '', type: 'all', level: '', tags: [] }
  const effectiveQuery = parsed.q || q
  const effectiveType = parsed.type !== 'all' && type === 'all' ? parsed.type : type
  const effectiveCountry = parsed.country || country
  const effectiveLevel = parsed.level || level

  const recipeRows = tables.find('recipes').map((row) => {
    const creatorMeta = creatorFor(row.creator_id)
    return {
      id: row.id,
      title: row.title,
      meta: `${row.time} · ${row.level}`,
      tag: 'Recipe',
      image: row.image,
      country: row.country,
      tags: parseJson(row.tags),
      kind: 'recipe',
      creator_name: creatorMeta.creatorName,
      ...communityFor(row.community_id),
    }
  })

  const moveRows = tables.find('moves').map((row) => {
    const creatorMeta = creatorFor(row.creator_id)
    return {
      id: row.id,
      title: row.title,
      meta: row.style,
      tag: 'Move',
      image: row.image,
      country: row.country,
      tags: parseJson(row.tags),
      kind: 'move',
      creator_name: creatorMeta.creatorName,
      ...communityFor(row.community_id),
    }
  })

  const discoverRows = tables.find('discover_items').map((row) => ({
    ...formatDiscoverItem(row),
    tags: [],
    creator_name: '',
  }))

  const communityRows = tables.find('communities').map((row) => ({
    id: row.id,
    title: row.name,
    meta: row.description,
    tag: row.category,
    image: '',
    country: '',
    tags: [],
    kind: 'community',
    community_slug: row.slug,
    community_name: row.name,
    creator_name: '',
  }))

  let pool = [...recipeRows, ...moveRows, ...discoverRows, ...communityRows]

  if (effectiveType !== 'all') {
    pool = pool.filter(
      (row) =>
        row.kind === effectiveType ||
        (effectiveType === 'food' && row.kind === 'recipe') ||
        (effectiveType === 'dance' && row.kind === 'move'),
    )
  }
  if (effectiveCountry) pool = pool.filter((row) => normalize(row.country) === normalize(effectiveCountry))
  if (community) pool = pool.filter((row) => normalize(row.community_slug) === normalize(community))
  if (effectiveLevel) {
    pool = pool.filter((row) => normalize(row.meta).includes(normalize(effectiveLevel)) || row.tags?.includes('quick'))
  }
  if (parsed.tags?.length) {
    pool = pool.filter((row) => parsed.tags.some((tag) => row.tags?.includes(tag) || normalize(row.meta).includes(tag)))
  }
  if (creator) {
    const needle = normalize(creator)
    pool = pool.filter((row) => normalize(row.creator_name).includes(needle))
  }

  for (const row of pool) {
    const score = effectiveQuery ? scoreRecord(row, effectiveQuery, Number(fuzziness)) : 0.5
    if (effectiveQuery && score <= 0) continue

    let relevance = score
    if (user?.country && normalize(row.country) === normalize(user.country)) relevance += 0.15
    if (user?.language && language && normalize(user.language) === normalize(language)) relevance += 0.05
    if (parsed.semantic) relevance += 0.05

    results.push({
      id: row.id,
      title: row.title,
      meta: row.meta,
      tag: row.tag,
      image: row.image,
      country: row.country,
      kind: row.kind,
      communitySlug: row.community_slug,
      communityName: row.community_name,
      score: Number(relevance.toFixed(3)),
    })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 40)
}
