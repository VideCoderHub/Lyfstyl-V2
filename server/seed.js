import { initDb, resetDb, tables } from './db.js'
import { submissionKindForType } from './services/challenges.js'
import { syncCommunityMemberCounts } from './services/communities.js'

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function hoursFromNow(hours) {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

const COMMUNITIES = [
  { slug: 'recipes', name: 'Recipes', category: 'food', vertical: 'food', description: 'Share and discover dishes from home cooks and pros.' },
  { slug: 'healthy-eating', name: 'Healthy Eating', category: 'food', vertical: 'food', description: 'Nutrition-forward meals and wellness cooking.' },
  { slug: 'soul-food', name: 'Soul Food', category: 'food', vertical: 'food', description: 'Comfort classics and family traditions.' },
  { slug: 'street-food', name: 'Street Food', category: 'food', vertical: 'food', description: 'Market stalls, late-night bites, and urban flavours.' },
  { slug: 'fast-food', name: 'Fast Food', category: 'food', vertical: 'food', description: 'Quick plates and weeknight wins.' },
  { slug: 'snacks', name: 'Snacks', category: 'food', vertical: 'food', description: 'Small bites, treats, and shareable plates.' },
  { slug: 'dance', name: 'Dance', category: 'dance', vertical: 'dance', description: 'Move. Express. Inspire. — the home for battles, cyphers, and creative movement.' },
  { slug: 'freestyle', name: 'Freestyle', category: 'dance', vertical: 'dance', description: 'Open movement and creative expression.' },
  { slug: 'hip-hop', name: 'Hip-hop', category: 'dance', vertical: 'dance', description: 'Grooves, battles, and street energy.' },
  { slug: 'house', name: 'House', category: 'dance', vertical: 'dance', description: 'Footwork, glide, and club culture.' },
  { slug: 'battle', name: 'Battle', category: 'dance', vertical: 'dance', description: 'Competition drops and cypher moments.' },
  { slug: 'contemporary', name: 'Contemporary', category: 'dance', vertical: 'dance', description: 'Story-driven movement and flow.' },
  { slug: 'social-dance', name: 'Social Dance', category: 'dance', vertical: 'dance', description: 'Party moves everyone can learn.' },
]

const BADGES = [
  { slug: 'bronze-chef', name: 'Bronze Chef', description: 'Earn 100 creator points in food communities.', category: 'food', threshold: 100 },
  { slug: 'silver-chef', name: 'Silver Chef', description: 'Earn 300 creator points in food communities.', category: 'food', threshold: 300 },
  { slug: 'gold-chef', name: 'Gold Chef', description: 'Earn 600 creator points in food communities.', category: 'food', threshold: 600 },
  { slug: 'rockstar-chef', name: 'Rockstar Chef', description: 'Earn 1000 creator points in food communities.', category: 'food', threshold: 1000 },
  { slug: 'legendary-creator', name: 'Legendary Creator', description: 'Earn 2000 total creator points.', category: 'general', threshold: 2000 },
  { slug: 'bronze-mover', name: 'Bronze Mover', description: 'Earn 100 creator points in dance communities.', category: 'dance', threshold: 100 },
  { slug: 'silver-mover', name: 'Silver Mover', description: 'Earn 300 creator points in dance communities.', category: 'dance', threshold: 300 },
  { slug: 'gold-mover', name: 'Gold Mover', description: 'Earn 600 creator points in dance communities.', category: 'dance', threshold: 600 },
]

const RECIPES = [
  { title: 'Fire-roasted salsa bowl', time: '20 min', level: 'Easy', saves: 2400, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', community: 'recipes', country: 'Mexico', tags: ['quick', 'popular'] },
  { title: 'Midnight miso ramen', time: '45 min', level: 'Medium', saves: 5100, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', community: 'street-food', country: 'Japan', tags: ['weekend', 'street food'] },
  { title: 'Herb flatbread picnic', time: '35 min', level: 'Easy', saves: 1800, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80', community: 'healthy-eating', country: 'Italy', tags: ['quick', 'healthy'] },
  { title: 'Crispy honey chicken', time: '30 min', level: 'Medium', saves: 3700, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80', community: 'fast-food', country: 'USA', tags: ['popular'] },
  { title: 'Green goddess toast', time: '12 min', level: 'Easy', saves: 980, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80', community: 'healthy-eating', country: 'Kenya', tags: ['quick', 'student'] },
  { title: 'Street taco trio', time: '25 min', level: 'Easy', saves: 4200, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80', community: 'street-food', country: 'Mexico', tags: ['street food', 'popular'] },
  { title: 'Smoky chili noodles', time: '12 min', level: 'Easy', saves: 2900, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', community: 'snacks', country: 'South Korea', tags: ['quick', 'affordable'] },
  { title: 'Citrus grilled catch', time: '40 min', level: 'Medium', saves: 1600, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80', community: 'recipes', country: 'Nigeria', tags: ['weekend'] },
]

const MOVES = [
  { title: 'Plate spin intro', style: 'Freestyle', length: '18s', views: 84000, image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=900&q=80', community: 'freestyle', country: 'Nigeria', tags: ['trending'] },
  { title: 'Countertop bounce', style: 'Hip-hop', length: '22s', views: 61000, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80', community: 'hip-hop', country: 'USA', tags: ['trending'] },
  { title: 'Market aisle glide', style: 'House', length: '28s', views: 120000, image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=900&q=80', community: 'house', country: 'UK', tags: ['freestyle'] },
  { title: 'Feast battle drop', style: 'Battle', length: '35s', views: 210000, image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80', community: 'battle', country: 'Nigeria', tags: ['battle'] },
  { title: 'Slow pour contemporary', style: 'Contemporary', length: '40s', views: 45000, image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=900&q=80', community: 'contemporary', country: 'Japan', tags: ['tutorial'] },
  { title: 'Dinner party shuffle', style: 'Social', length: '16s', views: 33000, image: 'https://images.unsplash.com/photo-1524594154908-eddfff187f8b?auto=format&fit=crop&w=900&q=80', community: 'social-dance', country: 'Kenya', tags: ['social'] },
  { title: 'Kitchen island groove', style: 'Freestyle', length: '30s', views: 98000, image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80', community: 'freestyle', country: 'South Africa', tags: ['trending'] },
  { title: 'Beat drop footwork', style: 'Hip-hop', length: '24s', views: 156000, image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=900&q=80', community: 'hip-hop', country: 'USA', tags: ['battle'] },
]

const DISCOVER = [
  { tag: 'Food × Dance', title: 'Night market freestyle', meta: 'Seoul · Trending', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80', kind: 'story', community: 'street-food', country: 'South Korea' },
  { tag: 'Recipe', title: 'Smoky chili noodles', meta: '12 min · Easy', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80', kind: 'recipe', community: 'snacks', country: 'South Korea' },
  { tag: 'Move', title: 'Kitchen island groove', meta: 'Beginner · 30s', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80', kind: 'move', community: 'freestyle', country: 'South Africa' },
  { tag: 'Story', title: "Grandma's feast cypher", meta: 'Community pick', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80', kind: 'story', community: 'soul-food', country: 'Nigeria' },
  { tag: 'Recipe', title: 'Citrus grilled catch', meta: 'Weekend plate', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80', kind: 'recipe', community: 'recipes', country: 'Nigeria' },
  { tag: 'Move', title: 'Beat drop footwork', meta: 'Intermediate', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=900&q=80', kind: 'move', community: 'hip-hop', country: 'USA' },
]

const CHALLENGES = [
  { title: '30-Second Plate Drop', type: 'Dance', ends_label: 'Ends in 3 days', ends_at: daysFromNow(3), prize: 'Featured on Home', tone: 'lime', community: 'battle', points_reward: 75, submission_reward: 30 },
  { title: 'One-Pan Weeknight', type: 'Recipe', ends_label: 'Ends in 5 days', ends_at: daysFromNow(5), prize: 'Creator badge', tone: 'coral', community: 'fast-food', points_reward: 50, submission_reward: 25 },
  { title: 'Taste & Tempo Duo', type: 'Food × Dance', ends_label: 'Ends in 1 week', ends_at: daysFromNow(7), prize: '$500 creator fund', tone: 'lime', community: 'freestyle', points_reward: 100, submission_reward: 40 },
  { title: 'Street Snack Cypher', type: 'Live', ends_label: 'Tonight 8PM', ends_at: hoursFromNow(8), prize: 'Live stage slot', tone: 'coral', community: 'street-food', points_reward: 80, submission_reward: 35 },
  { title: 'Best Food Photography', type: 'Recipe', ends_label: 'Ends in 4 days', ends_at: daysFromNow(4), prize: 'Bronze Chef badge', tone: 'coral', community: 'recipes', points_reward: 60, submission_reward: 25 },
  { title: 'Traditional Dish Challenge', type: 'Recipe', ends_label: 'Ends in 6 days', ends_at: daysFromNow(6), prize: 'Featured listing', tone: 'lime', community: 'soul-food', points_reward: 70, submission_reward: 25 },
]

const FEATURED_USERS = [
  { name: 'Aisha K.', email: 'aisha@lyfstyl.demo', role: 'Chef · Lagos', blurb: 'Posting Sunday soups and kitchen dance breaks.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', country: 'Nigeria', interests: ['food', 'dance'] },
  { name: 'Marco R.', email: 'marco@lyfstyl.demo', role: 'Dancer · Milan', blurb: 'Turning pasta nights into freestyle sessions.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', country: 'Italy', interests: ['dance'] },
  { name: 'Jin & Yuna', email: 'jin@lyfstyl.demo', role: 'Duo · Busan', blurb: 'Street food tours with choreography drops.', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', country: 'South Korea', interests: ['food', 'dance'] },
  { name: 'Nova Collective', email: 'nova@lyfstyl.demo', role: 'Crew · NYC', blurb: 'Cook-off battles every Friday night.', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80', country: 'USA', interests: ['food', 'dance'] },
]

function communityId(slug) {
  return tables.findOne('communities', { slug })?.id
}

const SAMPLE_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

const RECIPE_EXTRAS = {
  'Fire-roasted salsa bowl': {
    description: 'Charred tomatoes, lime, and cilantro over warm grains — a feed-ready bowl built for sharing.',
    ingredients: ['2 tomatoes', '1 lime', 'Fresh cilantro', 'Cooked grains', 'Chili flakes'],
    steps: ['Char tomatoes until blistered.', 'Rough-chop with lime and cilantro.', 'Spoon over warm grains and finish with chili.'],
  },
  'Midnight miso ramen': {
    description: 'Deep miso broth with springy noodles — the kind of street-food bowl that keeps creators coming back.',
    ingredients: ['Miso paste', 'Ramen noodles', 'Soft egg', 'Scallions', 'Sesame oil'],
    steps: ['Simmer miso broth for 15 minutes.', 'Cook noodles separately.', 'Assemble with egg and scallions.'],
  },
}

const MOVE_EXTRAS = {
  'Plate spin intro': {
    description: 'A playful kitchen opener — spin, step, and hit the beat in under 20 seconds.',
    video_url: SAMPLE_VIDEO,
  },
  'Feast battle drop': {
    description: 'Battle-ready footwork built for challenge entries and crowd reactions.',
    video_url: SAMPLE_VIDEO,
  },
}

export function upgradeContent() {
  if (!tables.findOne('communities', { slug: 'dance' })) {
    tables.insert('communities', {
      slug: 'dance',
      name: 'Dance',
      category: 'dance',
      vertical: 'dance',
      description: 'Move. Express. Inspire. — the home for battles, cyphers, and creative movement.',
      member_count: 8900,
    })
  }

  for (const recipe of tables.find('recipes')) {
    const extra = RECIPE_EXTRAS[recipe.title]
    if (!recipe.description && extra) {
      tables.update('recipes', { id: recipe.id }, {
        description: extra.description,
        ingredients: JSON.stringify(extra.ingredients),
        steps: JSON.stringify(extra.steps),
      })
    } else if (!recipe.description) {
      tables.update('recipes', { id: recipe.id }, {
        description: `A community favourite from ${recipe.country ?? 'around the world'} — shared on Lyfstyl.`,
        ingredients: JSON.stringify(['Main ingredient', 'Seasoning', 'Fresh herbs', 'Side garnish']),
        steps: JSON.stringify(['Prep your ingredients.', 'Cook with confidence.', 'Plate and share your story.']),
      })
    }
  }

  for (const move of tables.find('moves')) {
    const extra = MOVE_EXTRAS[move.title]
    if (!move.description && extra) {
      tables.update('moves', { id: move.id }, {
        description: extra.description,
        video_url: extra.video_url,
      })
    } else if (!move.description) {
      tables.update('moves', { id: move.id }, {
        description: `A ${move.style} clip from the Lyfstyl dance community.`,
        video_url: SAMPLE_VIDEO,
      })
    }
  }

  const demoUsers = tables.find('users', { provider: 'demo' })
  const recipes = tables.find('recipes')
  const moves = tables.find('moves')
  recipes.forEach((r, i) => {
    if (!r.creator_id && demoUsers[i % demoUsers.length]) {
      tables.update('recipes', { id: r.id }, { creator_id: demoUsers[i % demoUsers.length].id })
    }
  })
  moves.forEach((m, i) => {
    if (!m.creator_id && demoUsers[i % demoUsers.length]) {
      tables.update('moves', { id: m.id }, { creator_id: demoUsers[i % demoUsers.length].id })
    }
  })

  for (const user of FEATURED_USERS) {
    const row = tables.findOne('users', { email: user.email })
    if (row && !row.bio) tables.update('users', { id: row.id }, { bio: user.blurb })
  }

  for (const item of tables.find('discover_items')) {
    const patch = {}
    if (item.kind === 'recipe') {
      const recipe = tables.find('recipes').find((r) => r.title === item.title)
      if (recipe) patch.ref_id = recipe.id
    }
    if (item.kind === 'move') {
      const move = tables.find('moves').find((m) => m.title === item.title)
      if (move) patch.ref_id = move.id
    }
    if (item.kind === 'story' && !item.body) {
      patch.body =
        item.title === 'Night market freestyle'
          ? 'Creators in Seoul paired late-night street food with freestyle drops — proof that Lyfstyl communities blur kitchen and cypher culture.'
          : 'A soul-food Sunday turned into a family cypher. Recipes and movement shared across generations.'
    }
    if (Object.keys(patch).length) tables.update('discover_items', { id: item.id }, patch)
  }

  for (const challenge of tables.find('challenges')) {
    const patch = {}
    if (!challenge.description) {
      patch.description = `Join the ${challenge.title} challenge in the Lyfstyl community. Submit your best work, collect votes, and earn creator points.`
      patch.rules = JSON.stringify([
        'Enter the challenge before the deadline',
        'Submit an original recipe or move from the host community',
        'Community votes decide featured winners',
        'Winners earn badges and creator fund prizes',
      ])
    }
    if (!challenge.ends_at) {
      const seed = CHALLENGES.find((c) => c.title === challenge.title)
      if (seed?.ends_at) patch.ends_at = seed.ends_at
      else patch.ends_at = daysFromNow(5)
    }
    if (!challenge.submission_kind) patch.submission_kind = submissionKindForType(challenge.type)
    if (!challenge.submission_reward) patch.submission_reward = 25
    if (!challenge.status) patch.status = 'active'
    if (Object.keys(patch).length) tables.update('challenges', { id: challenge.id }, patch)
  }

  seedChallengeDemoData()
  seedCommunityDemoData()
  syncCommunityMemberCounts()
}

function seedCommunityDemoData() {
  if (tables.count('community_posts') > 0) return

  const demoUsers = tables.find('users', { provider: 'demo' })
  const streetFood = tables.findOne('communities', { slug: 'street-food' })
  const hipHop = tables.findOne('communities', { slug: 'hip-hop' })
  const soulFood = tables.findOne('communities', { slug: 'soul-food' })

  if (streetFood && demoUsers[2]) {
    tables.insert('user_communities', {
      user_id: demoUsers[2].id,
      community_id: streetFood.id,
      joined_at: daysFromNow(-14),
    })
    tables.insert('community_posts', {
      community_id: streetFood.id,
      user_id: demoUsers[2].id,
      body: 'Night market crew — drop your best street snack recipe this week. Bonus points if you pair it with a 15s dance clip.',
    })
  }

  if (hipHop && demoUsers[3]) {
    tables.insert('user_communities', {
      user_id: demoUsers[3].id,
      community_id: hipHop.id,
      joined_at: daysFromNow(-10),
    })
    tables.insert('community_posts', {
      community_id: hipHop.id,
      user_id: demoUsers[3].id,
      body: 'Friday cook-off battle thread: post your kitchen cypher warm-up moves before the challenge closes.',
    })
  }

  if (soulFood && demoUsers[0]) {
    tables.insert('user_communities', {
      user_id: demoUsers[0].id,
      community_id: soulFood.id,
      joined_at: daysFromNow(-20),
    })
    tables.insert('community_posts', {
      community_id: soulFood.id,
      user_id: demoUsers[0].id,
      body: 'Sharing Sunday soup traditions — what dish does your family always serve before the music starts?',
    })
  }
}

function seedChallengeDemoData() {
  if (tables.count('challenge_submissions') > 0) return

  const demoUsers = tables.find('users', { provider: 'demo' })
  const plateDrop = tables.findOne('challenges', { title: '30-Second Plate Drop' })
  const onePan = tables.findOne('challenges', { title: 'One-Pan Weeknight' })
  const feastMove = tables.findOne('moves', { title: 'Feast battle drop' })
  const honeyChicken = tables.findOne('recipes', { title: 'Crispy honey chicken' })

  if (plateDrop && demoUsers[0] && feastMove) {
    tables.update('moves', { id: feastMove.id }, { creator_id: demoUsers[0].id })
    tables.insert('challenge_entries', {
      user_id: demoUsers[0].id,
      challenge_id: plateDrop.id,
      status: 'submitted',
      entered_at: daysFromNow(-2),
    })
    const sub = tables.insert('challenge_submissions', {
      challenge_id: plateDrop.id,
      user_id: demoUsers[0].id,
      entity_type: 'move',
      entity_id: feastMove.id,
      submitted_at: daysFromNow(-1),
    })
    if (demoUsers[1]) {
      tables.insert('challenge_votes', { user_id: demoUsers[1].id, submission_id: sub.lastInsertRowid })
      tables.insert('challenge_votes', { user_id: demoUsers[2]?.id ?? demoUsers[1].id, submission_id: sub.lastInsertRowid })
    }
  }

  if (onePan && demoUsers[1] && honeyChicken) {
    tables.update('recipes', { id: honeyChicken.id }, { creator_id: demoUsers[1].id })
    tables.insert('challenge_entries', {
      user_id: demoUsers[1].id,
      challenge_id: onePan.id,
      status: 'submitted',
      entered_at: daysFromNow(-1),
    })
    tables.insert('challenge_submissions', {
      challenge_id: onePan.id,
      user_id: demoUsers[1].id,
      entity_type: 'recipe',
      entity_id: honeyChicken.id,
      submitted_at: daysFromNow(-1),
    })
  }
}

export function seedDatabase(force = false) {
  initDb()
  if (tables.count('communities') > 0 && !force) {
    upgradeContent()
    return
  }
  if (force) resetDb()

  for (const community of COMMUNITIES) {
    tables.insert('communities', {
      ...community,
      member_count: Math.floor(Math.random() * 4000) + 500,
    })
  }

  for (const badge of BADGES) tables.insert('badges', badge)

  for (const recipe of RECIPES) {
    tables.insert('recipes', {
      title: recipe.title,
      time: recipe.time,
      level: recipe.level,
      saves: recipe.saves,
      image: recipe.image,
      community_id: communityId(recipe.community),
      country: recipe.country,
      tags: JSON.stringify(recipe.tags),
    })
  }

  for (const move of MOVES) {
    tables.insert('moves', {
      title: move.title,
      style: move.style,
      length: move.length,
      views: move.views,
      image: move.image,
      community_id: communityId(move.community),
      country: move.country,
      tags: JSON.stringify(move.tags),
    })
  }

  for (const item of DISCOVER) {
    tables.insert('discover_items', {
      tag: item.tag,
      title: item.title,
      meta: item.meta,
      image: item.image,
      kind: item.kind,
      community_id: communityId(item.community),
      country: item.country,
    })
  }

  for (const challenge of CHALLENGES) {
    tables.insert('challenges', {
      title: challenge.title,
      type: challenge.type,
      ends_label: challenge.ends_label,
      ends_at: challenge.ends_at,
      prize: challenge.prize,
      tone: challenge.tone,
      community_id: communityId(challenge.community),
      points_reward: challenge.points_reward,
      submission_reward: challenge.submission_reward,
      submission_kind: submissionKindForType(challenge.type),
      status: 'active',
    })
  }

  for (const user of FEATURED_USERS) {
    tables.insert('users', {
      email: user.email,
      password_hash: null,
      name: user.name,
      bio: user.blurb,
      age: 28,
      country: user.country,
      language: 'en',
      interests: JSON.stringify(user.interests),
      avatar_style: user.avatar,
      points: 450,
      provider: 'demo',
      onboarding_complete: 1,
    })
  }

  upgradeContent()
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('server/seed.js')) {
  seedDatabase(true)
  console.log('Database seeded.')
}
