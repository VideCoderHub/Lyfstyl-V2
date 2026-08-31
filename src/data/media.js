/** Looping preview clips (Mixkit — free for product use) */
export const LOOP_VIDEOS = {
  cooking:
    'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-4274-large.mp4',
  dance:
    'https://assets.mixkit.co/videos/preview/mixkit-dancing-man-in-a-neon-room-1236-large.mp4',
  fusion:
    'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-with-a-fan-4237-large.mp4',
  kitchen:
    'https://assets.mixkit.co/videos/preview/mixkit-person-frying-vegetables-in-a-pan-4275-large.mp4',
}

export const COMMUNITY_PORTALS = [
  {
    id: 'food',
    title: 'Food communities',
    subtitle: 'Street food, soul food & dedicated kitchens',
    to: '/community?tab=food',
    video: LOOP_VIDEOS.cooking,
    accent: 'food',
    mascot: 'chef',
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    subtitle: 'Dance is live — more coming soon',
    to: '/community?tab=entertainment',
    video: LOOP_VIDEOS.dance,
    accent: 'dance',
    mascot: 'dancer',
  },
]
