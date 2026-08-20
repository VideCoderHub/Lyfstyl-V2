import { parseJson, tables } from '../db.js'
import { addNotification } from './content.js'
import { awardPoints, getUserBadges } from './gamification.js'
import { formatUserPublic } from './social.js'

const SUBMISSION_KIND = {
  Recipe: 'recipe',
  Dance: 'move',
  'Food × Dance': 'both',
  Live: 'move',
}

export function submissionKindForType(challengeType) {
  return SUBMISSION_KIND[challengeType] ?? 'both'
}

export function isChallengeActive(challenge) {
  if (challenge.status === 'closed') return false
  if (challenge.ends_at && new Date(challenge.ends_at) < new Date()) return false
  return true
}

export function getChallengeEntry(userId, challengeId) {
  if (!userId) return null
  return tables.findOne('challenge_entries', { user_id: userId, challenge_id: challengeId })
}

export function countSubmissionVotes(submissionId) {
  return tables.count('challenge_votes', { submission_id: submissionId })
}

export function hasVoted(userId, submissionId) {
  if (!userId) return false
  return Boolean(tables.findOne('challenge_votes', { user_id: userId, submission_id: submissionId }))
}

function contentRow(entityType, entityId) {
  if (entityType === 'recipe') return tables.findOne('recipes', { id: Number(entityId) })
  if (entityType === 'move') return tables.findOne('moves', { id: Number(entityId) })
  return null
}

export function formatSubmission(row, viewerId, rank = null) {
  const content = contentRow(row.entity_type, row.entity_id)
  const author = tables.findOne('users', { id: row.user_id })
  const voteCount = countSubmissionVotes(row.id)

  return {
    id: row.id,
    challengeId: row.challenge_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: content?.title ?? 'Submission',
    image: content?.image ?? '',
    meta:
      row.entity_type === 'recipe'
        ? `${content?.time ?? ''} · ${content?.level ?? ''}`.trim()
        : `${content?.style ?? ''} · ${content?.length ?? ''}`.trim(),
    detailUrl: row.entity_type === 'recipe' ? `/recipes/${row.entity_id}` : `/moves/${row.entity_id}`,
    author: formatUserPublic(author),
    voteCount,
    voted: hasVoted(viewerId, row.id),
    isOwn: viewerId === row.user_id,
    submittedAt: row.submitted_at,
    rank,
  }
}

export function formatChallengeRow(row, userId) {
  const community = row.community_id ? tables.findOne('communities', { id: row.community_id }) : null
  const entry = getChallengeEntry(userId, row.id)
  const submissions = tables.find('challenge_submissions', { challenge_id: row.id })
  const userSubmissions = userId ? submissions.filter((s) => s.user_id === userId) : []
  const active = isChallengeActive(row)

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    ends: row.ends_label,
    endsAt: row.ends_at ?? null,
    status: active ? 'active' : 'closed',
    prize: row.prize,
    tone: row.tone,
    pointsReward: row.points_reward,
    submissionReward: row.submission_reward ?? 25,
    description: row.description ?? '',
    rules: parseJson(row.rules, []),
    submissionKind: row.submission_kind ?? submissionKindForType(row.type),
    communitySlug: community?.slug,
    communityName: community?.name,
    communityVertical: community?.vertical,
    entryCount: tables.count('challenge_entries', { challenge_id: row.id }),
    submissionCount: submissions.length,
    entered: Boolean(entry),
    entryStatus: entry?.status ?? null,
    enteredAt: entry?.entered_at ?? null,
    hasSubmitted: userSubmissions.length > 0,
    userSubmissionCount: userSubmissions.length,
  }
}

export function getChallengeSubmissions(challengeId, viewerId) {
  return tables
    .find('challenge_submissions', { challenge_id: challengeId })
    .sort((a, b) => {
      const votesA = countSubmissionVotes(a.id)
      const votesB = countSubmissionVotes(b.id)
      if (votesB !== votesA) return votesB - votesA
      return new Date(b.submitted_at) - new Date(a.submitted_at)
    })
    .map((row, index) => formatSubmission(row, viewerId, index + 1))
}

export function getEligiblePosts(userId, challenge) {
  if (!userId || !challenge) return []

  const kind = challenge.submission_kind ?? submissionKindForType(challenge.type)
  const existing = tables
    .find('challenge_submissions', { challenge_id: challenge.id, user_id: userId })
    .map((s) => `${s.entity_type}:${s.entity_id}`)

  const items = []

  if (kind === 'recipe' || kind === 'both') {
    for (const recipe of tables.find('recipes', { creator_id: userId })) {
      if (existing.includes(`recipe:${recipe.id}`)) continue
      if (challenge.community_id && recipe.community_id !== challenge.community_id) continue
      items.push({
        entityType: 'recipe',
        entityId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        meta: `${recipe.time} · ${recipe.level}`,
        detailUrl: `/recipes/${recipe.id}`,
      })
    }
  }

  if (kind === 'move' || kind === 'both') {
    for (const move of tables.find('moves', { creator_id: userId })) {
      if (existing.includes(`move:${move.id}`)) continue
      if (challenge.community_id && move.community_id !== challenge.community_id) continue
      items.push({
        entityType: 'move',
        entityId: move.id,
        title: move.title,
        image: move.image,
        meta: `${move.style} · ${move.length}`,
        detailUrl: `/moves/${move.id}`,
      })
    }
  }

  return items
}

export function getChallengeDetail(challengeId, userId) {
  const row = tables.findOne('challenges', { id: Number(challengeId) })
  if (!row) return null

  const challenge = formatChallengeRow(row, userId)
  const submissions = getChallengeSubmissions(row.id, userId)
  const eligiblePosts = getEligiblePosts(userId, row)
  const userSubmissions = submissions.filter((s) => s.isOwn)

  return {
    challenge,
    submissions,
    userSubmissions,
    eligiblePosts,
    leaderboard: submissions.slice(0, 10),
  }
}

export function enterChallenge(user, challengeId) {
  const challenge = tables.findOne('challenges', { id: Number(challengeId) })
  if (!challenge) return { error: 'Challenge not found.', status: 404 }

  if (!isChallengeActive(challenge)) {
    return { error: 'This challenge has ended.', status: 400 }
  }

  const existing = getChallengeEntry(user.id, challenge.id)
  if (existing) return { error: 'You have already entered this challenge.', status: 409 }

  tables.insert('challenge_entries', {
    user_id: user.id,
    challenge_id: challenge.id,
    status: 'entered',
    entered_at: new Date().toISOString(),
  })

  const points = awardPoints(user.id, challenge.points_reward, { challengeId: challenge.id, action: 'enter' })

  addNotification(user.id, 'challenge', 'Challenge joined', `You're in "${challenge.title}". Submit your entry before the deadline.`, {
    challengeId: challenge.id,
    href: `/challenges/${challenge.id}`,
  })

  return {
    ok: true,
    challenge: formatChallengeRow(challenge, user.id),
    points,
    badges: getUserBadges(user.id),
    message: `You're in! +${challenge.points_reward} creator points.`,
  }
}

function entityAllowedForChallenge(challenge, entityType) {
  const kind = challenge.submission_kind ?? submissionKindForType(challenge.type)
  if (kind === 'both') return entityType === 'recipe' || entityType === 'move'
  return kind === entityType
}

export function submitToChallenge(user, challengeId, entityType, entityId) {
  const challenge = tables.findOne('challenges', { id: Number(challengeId) })
  if (!challenge) return { error: 'Challenge not found.', status: 404 }

  if (!isChallengeActive(challenge)) {
    return { error: 'Submissions are closed for this challenge.', status: 400 }
  }

  const entry = getChallengeEntry(user.id, challenge.id)
  if (!entry) {
    return { error: 'Enter the challenge before submitting.', status: 403 }
  }

  if (!['recipe', 'move'].includes(entityType)) {
    return { error: 'Invalid submission type.', status: 400 }
  }

  if (!entityAllowedForChallenge(challenge, entityType)) {
    return { error: `This challenge accepts ${challenge.submission_kind ?? submissionKindForType(challenge.type)} entries only.`, status: 400 }
  }

  const content = contentRow(entityType, entityId)
  if (!content) return { error: 'Content not found.', status: 404 }
  if (content.creator_id !== user.id) return { error: 'You can only submit your own content.', status: 403 }

  if (challenge.community_id && content.community_id !== challenge.community_id) {
    return { error: 'Submit content from the challenge community.', status: 400 }
  }

  const duplicate = tables.findOne('challenge_submissions', {
    challenge_id: challenge.id,
    entity_type: entityType,
    entity_id: Number(entityId),
  })
  if (duplicate) return { error: 'This post is already submitted.', status: 409 }

  const result = tables.insert('challenge_submissions', {
    challenge_id: challenge.id,
    user_id: user.id,
    entity_type: entityType,
    entity_id: Number(entityId),
    submitted_at: new Date().toISOString(),
  })

  tables.update('challenge_entries', { id: entry.id }, { status: 'submitted' })

  const bonus = challenge.submission_reward ?? 25
  const points = awardPoints(user.id, bonus, { challengeId: challenge.id, submissionId: result.lastInsertRowid })

  addNotification(user.id, 'challenge', 'Entry submitted', `Your submission for "${challenge.title}" is live. Collect community votes!`, {
    challengeId: challenge.id,
    href: `/challenges/${challenge.id}`,
  })

  const submission = formatSubmission(
    tables.findOne('challenge_submissions', { id: result.lastInsertRowid }),
    user.id,
  )

  return {
    ok: true,
    submission,
    points,
    challenge: formatChallengeRow(challenge, user.id),
    message: `Submitted! +${bonus} creator points.`,
  }
}

export function toggleSubmissionVote(user, submissionId) {
  const submission = tables.findOne('challenge_submissions', { id: Number(submissionId) })
  if (!submission) return { error: 'Submission not found.', status: 404 }

  const challenge = tables.findOne('challenges', { id: submission.challenge_id })
  if (!challenge || !isChallengeActive(challenge)) {
    return { error: 'Voting is closed for this challenge.', status: 400 }
  }

  if (submission.user_id === user.id) {
    return { error: 'You cannot vote on your own submission.', status: 400 }
  }

  const existing = tables.findOne('challenge_votes', {
    user_id: user.id,
    submission_id: submission.id,
  })

  if (existing) {
    tables.delete('challenge_votes', { id: existing.id })
    return {
      voted: false,
      voteCount: countSubmissionVotes(submission.id),
      submission: formatSubmission(submission, user.id),
    }
  }

  tables.insert('challenge_votes', {
    user_id: user.id,
    submission_id: submission.id,
  })

  const author = tables.findOne('users', { id: submission.user_id })
  if (author && author.id !== user.id) {
    addNotification(
      author.id,
      'challenge',
      'New vote on your entry',
      `${user.name} voted for your "${challenge.title}" submission.`,
      { challengeId: challenge.id, href: `/challenges/${challenge.id}` },
    )
  }

  return {
    voted: true,
    voteCount: countSubmissionVotes(submission.id),
    submission: formatSubmission(submission, user.id),
  }
}

export function getMyChallenges(userId) {
  return tables
    .find('challenge_entries', { user_id: userId })
    .map((entry) => {
      const challenge = tables.findOne('challenges', { id: entry.challenge_id })
      if (!challenge) return null
      const formatted = formatChallengeRow(challenge, userId)
      return { ...formatted, enteredAt: entry.entered_at, entryStatus: entry.status }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.enteredAt) - new Date(a.enteredAt))
}

export function maybeAutoSubmit(user, challengeId, entityType, entityId) {
  if (!challengeId) return null
  const entry = getChallengeEntry(user.id, Number(challengeId))
  if (!entry) return null
  const result = submitToChallenge(user, Number(challengeId), entityType, entityId)
  if (result.error) return { error: result.error }
  return result
}
