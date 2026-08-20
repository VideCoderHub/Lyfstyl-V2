import { Router } from 'express'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import {
  enterChallenge,
  getChallengeDetail,
  getMyChallenges,
  submitToChallenge,
  toggleSubmissionVote,
} from '../services/challenges.js'
import { formatChallengeRow } from '../services/challenges.js'
import { tables } from '../db.js'
import { logActivity } from '../services/personalization.js'

const router = Router()

router.get('/', optionalAuth, (req, res) => {
  const { status = 'all' } = req.query
  let rows = tables.find('challenges')

  if (status === 'active') {
    rows = rows.filter((c) => formatChallengeRow(c, req.user?.id).status === 'active')
  }

  const challenges = rows
    .map((c) => formatChallengeRow(c, req.user?.id))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1
      return new Date(a.endsAt ?? 0) - new Date(b.endsAt ?? 0)
    })

  res.json({ challenges })
})

router.get('/mine', requireAuth, (req, res) => {
  res.json({ entries: getMyChallenges(req.user.id) })
})

router.get('/:id', optionalAuth, (req, res) => {
  const detail = getChallengeDetail(Number(req.params.id), req.user?.id)
  if (!detail) return res.status(404).json({ error: 'Challenge not found.' })
  res.json(detail)
})

router.post('/:id/enter', requireAuth, (req, res) => {
  const result = enterChallenge(req.user, Number(req.params.id))
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })

  logActivity(req.user.id, 'enter_challenge', 'challenge', Number(req.params.id), {
    title: result.challenge.title,
  })

  res.status(201).json(result)
})

router.post('/:id/submit', requireAuth, (req, res) => {
  const { entityType, entityId } = req.body ?? {}
  if (!entityType || !entityId) {
    return res.status(400).json({ error: 'entityType and entityId are required.' })
  }

  const result = submitToChallenge(req.user, Number(req.params.id), entityType, entityId)
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })

  logActivity(req.user.id, 'submit_challenge', 'challenge', Number(req.params.id), {
    entityType,
    entityId,
  })

  res.status(201).json(result)
})

router.post('/submissions/:submissionId/vote', requireAuth, (req, res) => {
  const result = toggleSubmissionVote(req.user, Number(req.params.submissionId))
  if (result.error) return res.status(result.status ?? 400).json({ error: result.error })
  res.json(result)
})

export default router
