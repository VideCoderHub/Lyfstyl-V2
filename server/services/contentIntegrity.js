import { parseJson, tables } from '../db.js'

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  if (!setA.size || !setB.size) return 0
  const intersection = [...setA].filter((token) => setB.has(token)).length
  const union = new Set([...setA, ...setB]).size
  return intersection / union
}

export function checkContentIntegrity({ type, title, description, steps = [], ingredients = [] }) {
  const body = [title, description, ...(steps ?? []), ...(ingredients ?? [])].join(' ')
  const table = type === 'move' ? 'moves' : 'recipes'
  const rows = tables.find(table)

  let bestMatch = null
  let bestScore = 0

  for (const row of rows) {
    const existing = [
      row.title,
      row.description,
      ...parseJson(row.steps ?? row.ingredients ? row.steps || row.ingredients : '[]', []),
      ...parseJson(row.ingredients ?? '[]', []),
    ].join(' ')
    const score = jaccardSimilarity(body, existing)
    if (score > bestScore) {
      bestScore = score
      bestMatch = row
    }
  }

  if (bestScore >= 0.55) {
    return {
      ok: false,
      score: Number(bestScore.toFixed(2)),
      message: `This looks very similar to "${bestMatch.title}". Add your own twist or credit the original creator.`,
      similarTitle: bestMatch.title,
    }
  }

  if (bestScore >= 0.35) {
    return {
      ok: true,
      warning: true,
      score: Number(bestScore.toFixed(2)),
      message: `Reminds us of "${bestMatch.title}". Consider mentioning your inspiration.`,
      similarTitle: bestMatch.title,
    }
  }

  return { ok: true, score: bestScore }
}
