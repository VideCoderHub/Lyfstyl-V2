import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ChallengeSubmissionRow from '../components/ChallengeSubmissionRow'
import DetailBreadcrumb from '../components/DetailBreadcrumb'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

function createTypeForChallenge(challenge) {
  if (challenge.submissionKind === 'move') return 'move'
  return 'recipe'
}

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [eligiblePosts, setEligiblePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [submittingId, setSubmittingId] = useState(null)
  const [votingId, setVotingId] = useState(null)

  function loadDetail() {
    return api.getChallenge(id).then((data) => {
      setChallenge(data.challenge)
      setSubmissions(data.submissions ?? data.leaderboard ?? [])
      setEligiblePosts(data.eligiblePosts ?? [])
    })
  }

  useEffect(() => {
    loadDetail()
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleEnter() {
    if (!isAuthenticated) return navigate('/join')
    setEntering(true)
    try {
      const data = await api.enterChallenge(id)
      setMessage(data.message)
      await loadDetail()
      await refresh()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setEntering(false)
    }
  }

  async function handleSubmitPost(post) {
    setSubmittingId(`${post.entityType}-${post.entityId}`)
    try {
      const data = await api.submitChallengeEntry(id, {
        entityType: post.entityType,
        entityId: post.entityId,
      })
      setMessage(data.message)
      await loadDetail()
      await refresh()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleVote(submissionId) {
    setVotingId(submissionId)
    try {
      const data = await api.voteChallengeSubmission(submissionId)
      setSubmissions((list) =>
        list.map((s) =>
          s.id === submissionId ? { ...s, voteCount: data.voteCount, voted: data.voted } : s,
        ),
      )
    } catch (err) {
      setMessage(err.message)
    } finally {
      setVotingId(null)
    }
  }

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><Skeleton className="skeleton--detail" /></div>
      </main>
    )
  }

  if (!challenge) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Challenge not found.</p>
          <Link to="/challenges" className="btn btn--outline">Back to challenges</Link>
        </div>
      </main>
    )
  }

  const isClosed = challenge.status === 'closed'
  const createType = createTypeForChallenge(challenge)
  const createUrl = `/create?type=${createType}&challenge=${challenge.id}`

  return (
    <main className="subpage">
      <article className={`detail detail--challenge challenge-card challenge-card--${challenge.tone}`}>
        <div className="content-wrap detail__body">
          <DetailBreadcrumb
            items={[
              { label: 'Challenges', to: '/challenges' },
              { label: challenge.title },
            ]}
          />

          <div className="detail__head">
            <div className="challenge-detail__tags">
              <span className="tag">{challenge.type}</span>
              <span className={`tag ${isClosed ? 'tag--muted' : 'tag--food'}`}>
                {isClosed ? 'Closed' : 'Active'}
              </span>
              {challenge.hasSubmitted ? <span className="tag tag--dance">Submitted</span> : null}
            </div>
            <h1>{challenge.title}</h1>
            <p className="detail__meta">
              {challenge.ends} · Prize: {challenge.prize}
              {challenge.communityName ? ` · ${challenge.communityName}` : ''}
            </p>
            <p className="detail__lede">{challenge.description}</p>

            <div className="challenge-detail__stats">
              <div><strong>{challenge.entryCount ?? 0}</strong><span>Entered</span></div>
              <div><strong>{challenge.submissionCount ?? 0}</strong><span>Submissions</span></div>
              <div><strong>+{challenge.pointsReward}</strong><span>Enter bonus</span></div>
              <div><strong>+{challenge.submissionReward ?? 25}</strong><span>Submit bonus</span></div>
            </div>

            <div className="detail__actions">
              {!challenge.entered ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleEnter}
                  disabled={entering || isClosed}
                >
                  {isClosed ? 'Challenge ended' : entering ? 'Entering…' : 'Enter challenge'}
                </button>
              ) : (
                <span className="tag">You&apos;re in</span>
              )}
              {challenge.entered && !isClosed ? (
                <Link to={createUrl} className="btn btn--primary">
                  Create {createType === 'move' ? 'move' : 'recipe'} entry
                </Link>
              ) : null}
              {challenge.communitySlug ? (
                <Link to={`/community/${challenge.communitySlug}`} className="btn btn--outline">
                  View community
                </Link>
              ) : null}
            </div>
          </div>

          {challenge.rules?.length ? (
            <section>
              <h2>Rules</h2>
              <ul className="detail__list">
                {challenge.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {challenge.entered && eligiblePosts.length ? (
            <section>
              <h2>Submit from your posts</h2>
              <p className="section-lede">Use an existing recipe or move from the {challenge.communityName} community.</p>
              <ul className="challenge-eligible-list">
                {eligiblePosts.map((post) => (
                  <li key={`${post.entityType}-${post.entityId}`}>
                    <Link to={post.detailUrl}>{post.title}</Link>
                    <span>{post.meta}</span>
                    <button
                      type="button"
                      className="btn btn--outline"
                      disabled={submittingId === `${post.entityType}-${post.entityId}`}
                      onClick={() => handleSubmitPost(post)}
                    >
                      {submittingId === `${post.entityType}-${post.entityId}` ? 'Submitting…' : 'Submit'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2>Leaderboard</h2>
            {submissions.length ? (
              <div className="challenge-submission-list">
                {submissions.map((submission) => (
                  <ChallengeSubmissionRow
                    key={submission.id}
                    submission={submission}
                    votingId={votingId}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <p className="page-status">No submissions yet. Be the first to enter and post.</p>
            )}
          </section>
        </div>
      </article>
    </main>
  )
}
