import { tables } from '../db.js'
import { addNotification } from './content.js'

export function findConnection(userA, userB) {
  return (
    tables.find('connections').find(
      (c) =>
        (c.requester_id === userA && c.recipient_id === userB) ||
        (c.requester_id === userB && c.recipient_id === userA),
    ) ?? null
  )
}

export function getConnectionStatus(viewerId, targetId) {
  if (!viewerId || !targetId || viewerId === targetId) return 'self'
  const row = findConnection(viewerId, targetId)
  if (!row) return 'none'
  if (row.status === 'accepted') return 'connected'
  if (row.status === 'pending') {
    return row.requester_id === viewerId ? 'pending_sent' : 'pending_received'
  }
  return 'none'
}

export function countConnections(userId) {
  return tables.find('connections').filter(
    (c) => c.status === 'accepted' && (c.requester_id === userId || c.recipient_id === userId),
  ).length
}

export function formatUserPublic(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    bio: row.bio ?? '',
    country: row.country,
    avatar: row.avatar_style,
    points: row.points,
  }
}

export function formatConnectionRow(row, viewerId) {
  const otherId = row.requester_id === viewerId ? row.recipient_id : row.requester_id
  const other = tables.findOne('users', { id: otherId })
  return {
    id: row.id,
    status: row.status,
    direction: row.requester_id === viewerId ? 'sent' : 'received',
    user: formatUserPublic(other),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function formatMessage(row) {
  const sender = tables.findOne('users', { id: row.sender_id })
  return {
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    senderName: sender?.name ?? 'User',
    senderAvatar: sender?.avatar_style,
    read: Boolean(row.read),
    createdAt: row.created_at,
  }
}

export function formatReview(row, viewerId) {
  const author = tables.findOne('users', { id: row.user_id })
  return {
    id: row.id,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    author: author ? { id: author.id, name: author.name, avatar: author.avatar_style } : null,
    isOwn: viewerId === row.user_id,
  }
}

export function getReviewStats(entityType, entityId) {
  const rows = tables.find('reviews', { entity_type: entityType, entity_id: Number(entityId) })
  if (!rows.length) return { count: 0, average: 0 }
  const sum = rows.reduce((acc, r) => acc + r.rating, 0)
  return { count: rows.length, average: Math.round((sum / rows.length) * 10) / 10 }
}

export function getUserReview(entityType, entityId, userId) {
  const row = tables.findOne('reviews', {
    entity_type: entityType,
    entity_id: Number(entityId),
    user_id: userId,
  })
  return row ? formatReview(row, userId) : null
}

export function canMessage(userA, userB) {
  if (!userA || !userB || userA === userB) return false
  const row = findConnection(userA, userB)
  return row?.status === 'accepted'
}

export function notifyConnection(recipientId, type, fromUser) {
  const titles = {
    request: 'New connection request',
    accepted: 'Connection accepted',
  }
  const bodies = {
    request: `${fromUser.name} sent you a connection request.`,
    accepted: `${fromUser.name} accepted your connection request.`,
  }
  addNotification(recipientId, 'connection', titles[type] ?? 'Connection update', bodies[type] ?? `${fromUser.name} updated your connection.`, {
    userId: fromUser.id,
    type,
    href: `/creators/${fromUser.id}`,
  })
}

export function notifyFollow(recipientId, fromUser) {
  addNotification(recipientId, 'follow', 'New follower', `${fromUser.name} started following you.`, {
    userId: fromUser.id,
    href: `/creators/${fromUser.id}`,
  })
}

export function notifyContentEngagement(recipientId, fromUser, type, entityType, entityId, action) {
  const titles = {
    comment: 'New comment',
    review: 'New review',
    applause: 'New applause',
  }
  const bodies = {
    comment: `${fromUser.name} commented on your ${entityType}.`,
    review: `${fromUser.name} reviewed your ${entityType}.`,
    applause: `${fromUser.name} applauded your ${entityType}.`,
  }
  addNotification(recipientId, action, titles[action] ?? 'New activity', bodies[action] ?? `${fromUser.name} engaged with your content.`, {
    userId: fromUser.id,
    entityType,
    entityId,
    href: entityType === 'recipe' ? `/recipes/${entityId}` : `/moves/${entityId}`,
  })
}

export function contentCreatorId(entityType, entityId) {
  if (entityType === 'recipe') return tables.findOne('recipes', { id: Number(entityId) })?.creator_id ?? null
  if (entityType === 'move') return tables.findOne('moves', { id: Number(entityId) })?.creator_id ?? null
  return null
}
