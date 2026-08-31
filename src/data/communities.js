/** Two-pillar community hub — Entertainment & Food */

export const PILLAR_TABS = [
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'food', label: 'Food' },
]

export const DANCE_HUB_SLUG = 'dance'
export const FOOD_LIVE_SLUGS = ['street-food', 'soul-food']
export const DANCE_STYLE_SLUGS = ['hip-hop', 'battle', 'house', 'freestyle', 'contemporary', 'social-dance']

export const ENTERTAINMENT_HUB = {
  eyebrow: 'Entertainment Community',
  title: 'Entertainment & Dance',
  tagline: 'Move. Express. Inspire.',
  lede: 'Join dancers from around the world. Share your moves, learn new styles, and grow with a global stage.',
  heroImage:
    'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1600&q=80',
  features: [
    { icon: '🎵', title: 'All Styles', text: 'Hip Hop, Afro, Break, Popping & more' },
    { icon: '📈', title: 'Learn & Grow', text: 'Tutorials, challenges & workshops' },
    { icon: '🌍', title: 'Global Stage', text: 'Showcase your talent to the world' },
  ],
  live: {
    slug: DANCE_HUB_SLUG,
    title: 'Dance',
    tagline: 'Move. Express. Inspire.',
    description: 'The home for movement — battles, cyphers, and creative expression.',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    cta: 'Join the Dance Movement',
  },
  comingSoon: [
    {
      id: 'songs',
      title: 'Songs',
      description: 'Discover. Share. Create.',
      image:
        'https://images.unsplash.com/photo-1478737270239-2f02b77ab618?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'comedy',
      title: 'Comedy',
      description: 'Laugh out loud. Everyday.',
      image:
        'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Live shows & meetups.',
      image:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    },
  ],
  danceStyles: [
    { slug: 'hip-hop', title: 'Hip Hop', icon: '🕺' },
    { slug: 'battle', title: 'Breakdance', icon: '⚡' },
    { slug: 'house', title: 'House', icon: '🪩' },
    { slug: 'freestyle', title: 'Freestyle', icon: '✨' },
    { slug: 'contemporary', title: 'Contemporary', icon: '🎭' },
    { slug: 'social-dance', title: 'Social Dance', icon: '🤝' },
  ],
}

export const FOOD_HUB = {
  eyebrow: 'Food Community',
  title: 'Food',
  tagline: 'From the street to your soul.',
  lede: 'Dedicated food communities where flavor lives and stories stay — street bites, soul classics, and the people who cook from the heart.',
  heroImage:
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
  features: [
    { icon: '🍳', title: 'Recipes', text: 'Hearty meals from the heart' },
    { icon: '📖', title: 'Stories', text: 'The memories behind the meals' },
    { icon: '👥', title: 'Community', text: 'Connect. Share. Be inspired.' },
  ],
  live: [
    {
      slug: 'street-food',
      title: 'Street Food',
      tagline: 'Local bites, big flavor.',
      description: 'Market stalls, late-night bites, and urban flavours from every corner.',
      image:
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80',
      membersLabel: '12.4K members',
    },
    {
      slug: 'soul-food',
      title: 'Soul Food',
      tagline: 'Comfort classics that feel like home.',
      description: 'Celebrate rich traditions, bold flavors and timeless recipes that bring people together.',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
      membersLabel: '8.7K members',
    },
  ],
  comingSoon: [
    {
      id: 'vegetarian',
      title: 'Vegetarian',
      description: 'Good for you, good for the planet.',
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'seafood',
      title: 'Seafood',
      description: 'Discover, create & share flavors of the sea.',
      image:
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    },
  ],
  exploreSections: [
    { id: 'recipes', title: 'Recipes', description: 'Hearty meals from the heart', icon: '🍲' },
    { id: 'stories', title: 'Stories', description: 'The memories behind the meals', icon: '📖' },
    { id: 'community', title: 'Community', description: 'Connect. Share. Be inspired.', icon: '👥' },
    { id: 'videos', title: 'Videos', description: 'Watch, learn and cook', icon: '▶' },
    { id: 'chefs', title: 'Chefs', description: 'Meet our home cooking heroes', icon: '👨‍🍳' },
  ],
}

export const COMMUNITY_FEATURES = [
  { icon: '🧑‍🤝‍🧑', label: 'Connect with like-minded people', accent: 'food' },
  { icon: '📣', label: 'Share your passion and be discovered', accent: 'fusion' },
  { icon: '⭐', label: 'Join events & challenges', accent: 'entertainment' },
  { icon: '🏆', label: 'Earn badges and grow your influence', accent: 'entertainment' },
]

/** Landing page pillar cards */
export const HOME_PILLARS = {
  food: {
    title: 'Food',
    lede: 'Recipes, street bites, soul classics & dedicated kitchen communities.',
    icon: '🍴',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=80',
    to: '/community?tab=food',
    cta: 'Explore Food',
    subcommunities: [
      {
        slug: 'street-food',
        title: 'Street Food',
        description: 'Local bites, big flavor.',
        icon: '🌮',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
        membersLabel: '12.4K members',
        to: '/community/street-food',
        live: true,
      },
      {
        slug: 'soul-food',
        title: 'Soul Food',
        description: 'Comfort classics that feel like home.',
        icon: '🍲',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
        membersLabel: '8.7K members',
        to: '/community/soul-food',
        live: true,
      },
      {
        id: 'vegetarian',
        title: 'Vegetarian',
        description: 'Good for you, good for the planet.',
        icon: '🥗',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        comingSoon: true,
      },
    ],
  },
  entertainment: {
    title: 'Entertainment & Dance',
    lede: 'Dance is live now — songs, comedy & more entertainment coming soon.',
    icon: '▶',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    to: '/community?tab=entertainment',
    cta: 'Explore Entertainment',
    subcommunities: [
      {
        id: 'songs',
        title: 'Songs',
        description: 'Discover. Share. Create.',
        icon: '🎤',
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77ab618?auto=format&fit=crop&w=600&q=80',
        comingSoon: true,
      },
      {
        slug: 'dance',
        title: 'Dance',
        description: 'Move. Express. Inspire.',
        icon: '💃',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80',
        membersLabel: '18.9K members',
        to: '/community/dance',
        live: true,
      },
      {
        id: 'comedy',
        title: 'Comedy',
        description: 'Laugh out loud. Everyday.',
        icon: '😂',
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
        comingSoon: true,
      },
    ],
  },
}

export const LANDING_HERO = {
  left: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  right: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80',
}

export const COMMUNITY_DETAIL_THEMES = {
  'street-food': {
    pillar: 'food',
    pillarLabel: 'Food Community',
    tagline: 'From the street to your soul.',
    headline: 'Street Food',
    headlineAccent: 'Big flavor. Local heart.',
    heroImage:
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1600&q=80',
    cta: 'Join the Street Food Movement',
    secondaryCta: 'Share Your Recipe',
  },
  'soul-food': {
    pillar: 'food',
    pillarLabel: 'Food Community',
    tagline: 'Food for the Soul. Made with Love.',
    headline: 'Soul Food',
    headlineAccent: 'Made with Love.',
    heroImage:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    cta: 'Join the Soul',
    secondaryCta: 'Share Your Recipe',
  },
  dance: {
    pillar: 'entertainment',
    pillarLabel: 'Entertainment Community',
    tagline: 'Move. Express. Inspire.',
    headline: 'Dance',
    headlineAccent: '',
    heroImage:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    cta: 'Join the Dance Movement',
    secondaryCta: 'Share Your Move',
  },
}

export function isFoodLiveSlug(slug) {
  return FOOD_LIVE_SLUGS.includes(slug)
}

export function isDanceStyleSlug(slug) {
  return DANCE_STYLE_SLUGS.includes(slug)
}

export function isFeaturedCommunitySlug(slug) {
  return slug === DANCE_HUB_SLUG || isFoodLiveSlug(slug) || isDanceStyleSlug(slug)
}
