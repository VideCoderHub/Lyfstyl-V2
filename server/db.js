import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
const dbPath = join(dataDir, 'lyfstyl.json')

mkdirSync(dataDir, { recursive: true })

const emptyDb = () => ({
  users: [],
  communities: [],
  user_communities: [],
  community_posts: [],
  recipes: [],
  moves: [],
  discover_items: [],
  challenges: [],
  challenge_entries: [],
  challenge_submissions: [],
  challenge_votes: [],
  badges: [],
  user_badges: [],
  content_stars: [],
  activity_log: [],
  comments: [],
  notifications: [],
  saved_items: [],
  connections: [],
  messages: [],
  reviews: [],
  follows: [],
  applause: [],
  _counters: {},
})

let db = loadDb()

function loadDb() {
  if (!existsSync(dbPath)) {
    const fresh = emptyDb()
    saveDb(fresh)
    return fresh
  }
  try {
    return { ...emptyDb(), ...JSON.parse(readFileSync(dbPath, 'utf8')) }
  } catch {
    const fresh = emptyDb()
    saveDb(fresh)
    return fresh
  }
}

function saveDb(next = db) {
  writeFileSync(dbPath, JSON.stringify(next, null, 2), 'utf8')
}

function nextId(table) {
  db._counters[table] = (db._counters[table] ?? 0) + 1
  return db._counters[table]
}

function matchWhere(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (value && typeof value === 'object' && '$in' in value) {
      return value.$in.includes(row[key])
    }
    return row[key] === value
  })
}

export function resetDb() {
  db = emptyDb()
  saveDb()
}

export function getDb() {
  return db
}

export function persist() {
  saveDb()
}

export function parseJson(value, fallback = []) {
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value ?? 'null') ?? fallback
  } catch {
    return fallback
  }
}

export function userToJson(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    age: row.age,
    country: row.country,
    language: row.language,
    interests: parseJson(row.interests),
    avatarStyle: row.avatar_style,
    points: row.points,
    provider: row.provider,
    onboardingComplete: Boolean(row.onboarding_complete),
    bio: row.bio ?? '',
    createdAt: row.created_at,
  }
}

export const tables = {
  insert(table, row) {
    const id = row.id ?? nextId(table)
    const record = { ...row, id, created_at: row.created_at ?? new Date().toISOString() }
    db[table].push(record)
    persist()
    return { lastInsertRowid: id, changes: 1 }
  },

  upsertComposite(table, keyFields, row) {
    const existing = tables.findOne(table, Object.fromEntries(keyFields.map((k) => [k, row[k]])))
    if (existing) {
      Object.assign(existing, row)
      persist()
      return { changes: 1 }
    }
    return tables.insert(table, row)
  },

  find(table, where = {}, sort) {
    let rows = db[table].filter((row) => matchWhere(row, where))
    if (sort) rows = [...rows].sort(sort)
    return rows
  },

  findOne(table, where = {}) {
    return db[table].find((row) => matchWhere(row, where)) ?? null
  },

  update(table, where, patch) {
    let changes = 0
    for (const row of db[table]) {
      if (matchWhere(row, where)) {
        Object.assign(row, patch)
        changes += 1
      }
    }
    if (changes) persist()
    return { changes }
  },

  increment(table, where, field, amount = 1) {
    for (const row of db[table]) {
      if (matchWhere(row, where)) {
        row[field] = Math.max(0, (row[field] ?? 0) + amount)
      }
    }
    persist()
  },

  delete(table, where = {}) {
    const before = db[table].length
    db[table] = db[table].filter((row) => !matchWhere(row, where))
    const changes = before - db[table].length
    if (changes) persist()
    return { changes }
  },

  count(table, where = {}) {
    return tables.find(table, where).length
  },
}

export function initDb() {
  db = loadDb()
}

// Compatibility alias for existing route imports
export { tables as db }
