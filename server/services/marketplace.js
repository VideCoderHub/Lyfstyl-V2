import { tables } from '../db.js'

export function formatListing(row) {
  const community = row.community_id ? tables.findOne('communities', { id: row.community_id }) : null
  const seller = row.seller_id ? tables.findOne('users', { id: row.seller_id }) : null
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    price: row.price,
    currency: row.currency ?? 'USD',
    image: row.image,
    category: row.category,
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
    communitySlug: community?.slug,
    communityName: community?.name,
    sellerName: seller?.name ?? 'Lyfstyl Merchant',
  }
}

export function getCommunityListings(communityId, limit = 8) {
  return tables
    .find('marketplace_listings', { community_id: communityId })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(formatListing)
}

export function getFeaturedListings(limit = 6) {
  return tables
    .find('marketplace_listings')
    .filter((row) => row.featured)
    .slice(0, limit)
    .map(formatListing)
}
