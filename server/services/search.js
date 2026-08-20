import { parseJson, tables } from '../db.js'
import { formatDiscoverItem } from './detail.js'

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

export function searchContent({ q = '', type = 'all', country = '', language = '', community = '', fuzziness = 0.5, user }) {
  const results = []

  const recipeRows = tables.find('recipes').map((row) => ({
    id: row.id,
    title: row.title,
    meta: row.time,
    tag: 'Recipe',
    image: row.image,
    country: row.country,
    tags: parseJson(row.tags),
    kind: 'recipe',
    ...communityFor(row.community_id),
  }))

  const moveRows = tables.find('moves').map((row) => ({
    id: row.id,
    title: row.title,
    meta: row.style,
    tag: 'Move',
    image: row.image,
    country: row.country,
    tags: parseJson(row.tags),
    kind: 'move',
    ...communityFor(row.community_id),
  }))

  const discoverRows = tables.find('discover_items').map((row) => ({
    ...formatDiscoverItem(row),
    tags: [],
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
  }))

  let pool = [...recipeRows, ...moveRows, ...discoverRows, ...communityRows]

  if (type !== 'all') {
    pool = pool.filter(
      (row) =>
        row.kind === type ||
        (type === 'food' && row.kind === 'recipe') ||
        (type === 'dance' && row.kind === 'move'),
    )
  }
  if (country) pool = pool.filter((row) => normalize(row.country) === normalize(country))
  if (community) pool = pool.filter((row) => normalize(row.community_slug) === normalize(community))

  for (const row of pool) {
    const score = q ? scoreRecord(row, q, Number(fuzziness)) : 0.5
    if (q && score <= 0) continue

    let relevance = score
    if (user?.country && normalize(row.country) === normalize(user.country)) relevance += 0.15
    if (user?.language && language && normalize(user.language) === normalize(language)) relevance += 0.05

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
