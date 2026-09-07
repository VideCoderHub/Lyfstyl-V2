import { tables } from '../db.js'

export function formatClass(row) {
  const community = row.community_id ? tables.findOne('communities', { id: row.community_id }) : null
  const instructor = row.instructor_id ? tables.findOne('users', { id: row.instructor_id }) : null
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    duration: row.duration,
    level: row.level,
    price: row.price,
    image: row.image,
    format: row.format ?? 'video',
    communitySlug: community?.slug,
    communityName: community?.name,
    instructorName: instructor?.name ?? 'Lyfstyl Instructor',
  }
}

export function getCommunityClasses(communityId, limit = 6) {
  return tables
    .find('classes', { community_id: communityId })
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(formatClass)
}
