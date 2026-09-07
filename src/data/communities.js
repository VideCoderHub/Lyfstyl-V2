/** Two-pillar community hub — Entertainment & Food */

export const PILLAR_TABS = [
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'food', label: 'Food' },
  { id: 'lifestyle', label: 'Lifestyle' },
]

export const DANCE_HUB_SLUG = 'dance'
export const FOOD_LIVE_SLUGS = ['recipes', 'healthy-eating', 'soul-food', 'street-food', 'fast-food', 'snacks']
export const LIFESTYLE_LIVE_SLUGS = ['gaming', 'tech', 'fashion', 'fitness']
export const DANCE_STYLE_SLUGS = ['hip-hop', 'battle', 'house', 'freestyle', 'contemporary', 'social-dance']

export function formatMemberCount(count) {
  if (!count) return null
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K members`
  return `${count} member${count === 1 ? '' : 's'}`
}

export function enrichSubcommunity(item, communityMap) {
  if (!item.slug || !communityMap[item.slug]) return item
  const community = communityMap[item.slug]
  return {
    ...item,
    description: community.description || item.description,
    membersLabel: formatMemberCount(community.memberCount),
  }
}

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
      slug: 'recipes',
      title: 'Recipes',
      tagline: 'Hearty meals from the heart.',
      description: 'Share and discover dishes from home cooks and pros worldwide.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'healthy-eating',
      title: 'Healthy Eating',
      tagline: 'Good for you, good for the planet.',
      description: 'Nutrition-forward meals and wellness cooking.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'street-food',
      title: 'Street Food',
      tagline: 'Local bites, big flavor.',
      description: 'Market stalls, late-night bites, and urban flavours from every corner.',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'soul-food',
      title: 'Soul Food',
      tagline: 'Comfort classics that feel like home.',
      description: 'Celebrate rich traditions, bold flavors and timeless recipes that bring people together.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'fast-food',
      title: 'Fast Food',
      tagline: 'Quick plates, big wins.',
      description: 'Weeknight heroes and fast comfort food from creators everywhere.',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'snacks',
      title: 'Snacks',
      tagline: 'Small bites, shareable joy.',
      description: 'Treats, small plates, and snack culture from every corner.',
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
    },
  ],
  comingSoon: [
    {
      id: 'vegetarian',
      title: 'Vegetarian',
      description: 'Plant-forward plates coming soon.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'seafood',
      title: 'Seafood',
      description: 'Flavors of the sea — coming soon.',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
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

export const LIFESTYLE_HUB = {
  eyebrow: 'Lifestyle Communities',
  title: 'Gaming · Tech · Fashion · Fitness',
  tagline: 'Expand your Lyfstyl beyond the kitchen and dance floor.',
  lede: 'Phase 2 verticals from the Lyfstyl vision — connect around gaming, creator tech, fashion drops, and fitness culture.',
  heroImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
  features: [
    { icon: '🎮', title: 'Gaming', text: 'Streams, reviews & highlight reels' },
    { icon: '💻', title: 'Tech', text: 'Creator gear & kitchen innovation' },
    { icon: '👗', title: 'Fashion', text: 'Street style & outfit culture' },
    { icon: '💪', title: 'Fitness', text: 'Workouts & active living' },
  ],
  live: [
    { slug: 'gaming', title: 'Gaming', tagline: 'Play. Share. Compete.', description: 'Game highlights, reviews, and creator streams.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80' },
    { slug: 'tech', title: 'Tech', tagline: 'Build. Create. Innovate.', description: 'Gadgets, creator gear, and kitchen innovation.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
    { slug: 'fashion', title: 'Fashion', tagline: 'Style. Express. Inspire.', description: 'Street style, outfit drops, and runway energy.', image: 'https://images.unsplash.com/photo-1483985988354-763728e1935b?auto=format&fit=crop&w=900&q=80' },
    { slug: 'fitness', title: 'Fitness', tagline: 'Move. Train. Thrive.', description: 'Workouts, wellness routines, and active living.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80' },
  ],
  comingSoon: [
    { id: 'travel', title: 'Travel', description: 'Global food & culture journeys.', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80' },
    { id: 'finance', title: 'Finance', description: 'Creator funds & money moves.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80' },
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
        to: '/community/street-food',
        live: true,
      },
      {
        slug: 'soul-food',
        title: 'Soul Food',
        description: 'Comfort classics that feel like home.',
        icon: '🍲',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
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

export function isLifestyleSlug(slug) {
  return LIFESTYLE_LIVE_SLUGS.includes(slug)
}

export function isDanceStyleSlug(slug) {
  return DANCE_STYLE_SLUGS.includes(slug)
}

export function isFeaturedCommunitySlug(slug) {
  return slug === DANCE_HUB_SLUG || isFoodLiveSlug(slug) || isDanceStyleSlug(slug) || isLifestyleSlug(slug)
}
