/** Country-specific animated guides from the Lyfstyl deck */

export const COUNTRY_MASCOTS = {
  Kenya: {
    id: 'kenya-chef',
    name: 'Chef Wanjiku',
    emoji: '👩🏾‍🍳',
    speech: 'Karibu! Let me show you bold Kenyan flavours.',
    type: 'chef',
    accent: 'food',
  },
  Italy: {
    id: 'italy-pizza',
    name: 'Pizza Master Marco',
    emoji: '🍕',
    speech: 'Mamma mia — fresh dough, fire, and passion!',
    type: 'chef',
    accent: 'food',
  },
  Japan: {
    id: 'japan-sushi',
    name: 'Sushi Master Yuki',
    emoji: '🍣',
    speech: 'Precision, balance, and respect for ingredients.',
    type: 'chef',
    accent: 'food',
  },
  Mexico: {
    id: 'mexico-taco',
    name: 'Taco Expert Rosa',
    emoji: '🌮',
    speech: 'Street food soul — spice, lime, and community.',
    type: 'chef',
    accent: 'food',
  },
  Nigeria: {
    id: 'nigeria-dancer',
    name: 'Afro Groove Kemi',
    emoji: '💃🏾',
    speech: 'Feel the rhythm — every move tells a story.',
    type: 'dancer',
    accent: 'entertainment',
  },
  USA: {
    id: 'usa-dancer',
    name: 'Hip-hop Hype Jay',
    emoji: '🕺',
    speech: 'Drop the beat — battles start in the kitchen too.',
    type: 'dancer',
    accent: 'entertainment',
  },
}

export function getMascotForCountry(country) {
  if (!country) return null
  return COUNTRY_MASCOTS[country] ?? null
}

export function getMascotType(country, fallback = 'chef') {
  return getMascotForCountry(country)?.type ?? fallback
}

export const AVATAR_CUSTOMIZATION = {
  hair: [
    { id: 'natural', label: 'Natural', emoji: '💇' },
    { id: 'braids', label: 'Braids', emoji: '🪮' },
    { id: 'fade', label: 'Fade', emoji: '✂️' },
    { id: 'locs', label: 'Locs', emoji: '🌀' },
  ],
  outfit: [
    { id: 'chef-coat', label: 'Chef coat', emoji: '👨‍🍳' },
    { id: 'streetwear', label: 'Streetwear', emoji: '👟' },
    { id: 'traditional', label: 'Traditional', emoji: '🥻' },
    { id: 'creator', label: 'Creator fit', emoji: '🎬' },
  ],
  expression: [
    { id: 'warm', label: 'Warm smile', emoji: '😊' },
    { id: 'focused', label: 'Focused', emoji: '😤' },
    { id: 'playful', label: 'Playful', emoji: '😄' },
    { id: 'cool', label: 'Cool', emoji: '😎' },
  ],
}

export function avatarLevelLabel(level = 1) {
  const labels = ['Starter', 'Rising', 'Skilled', 'Pro', 'Legend']
  return labels[Math.min(Math.max(level, 1), 5) - 1]
}
