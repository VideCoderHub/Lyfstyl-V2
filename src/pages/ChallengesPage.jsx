import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import UserBadgePanel from '../components/UserBadgePanel'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ChallengesPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enteringId, setEnteringId] = useState(null)

  function loadChallenges() {
    return api.getChallenges().then((data) => setChallenges(data.challenges ?? []))
  }

  useEffect(() => {
    loadChallenges()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleEnter(challenge) {
    if (!isAuthenticated) {
      navigate('/join')
      return
    }
    if (challenge.entered || challenge.status === 'closed') return

    setEnteringId(challenge.id)
    try {
      const data = await api.enterChallenge(challenge.id)
      setMessage(data.message)
      await refresh()
      await loadChallenges()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setEnteringId(null)
    }
  }

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Challenges"
        title="Cook-offs, battles, weekly drops"
        lede="Enter, submit your best recipe or move, collect community votes, and climb the leaderboard."
        actions={
          isAuthenticated ? (
            <Link className="btn btn--primary" to="/create">
              Create entry
            </Link>
          ) : (
            <Link className="btn btn--primary" to="/join">
              Join to enter
            </Link>
          )
        }
      />

      <section className="content-wrap content-wrap--with-panel">
        <div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {loading ? <p className="page-status">Loading challenges…</p> : null}

          <div className="challenge-list">
            {challenges.map((item) => (
              <article key={item.id} className={`challenge-card challenge-card--${item.tone}`}>
                <div>
                  <div className="challenge-card__tags">
                    <span className="tag">{item.type}</span>
                    <span className={`tag ${item.status === 'closed' ? 'tag--muted' : 'tag--food'}`}>
                      {item.status === 'closed' ? 'Closed' : 'Active'}
                    </span>
                    {item.hasSubmitted ? <span className="tag tag--dance">Submitted</span> : null}
                    {item.entered && !item.hasSubmitted ? <span className="tag">Entered</span> : null}
                  </div>
                  <h2>
                    <Link to={`/challenges/${item.id}`} className="challenge-card__title">
                      {item.title}
                    </Link>
                  </h2>
                  <p>
                    {item.ends} · Prize: {item.prize}
                    {item.communityName ? ` · ${item.communityName}` : ''}
                  </p>
                  <p className="challenge-card__points">
                    +{item.pointsReward} to enter · +{item.submissionReward ?? 25} to submit · {item.submissionCount ?? 0} submissions
                  </p>
                </div>
                <div className="challenge-card__actions">
                  <Link to={`/challenges/${item.id}`} className="btn btn--outline">
                    View details
                  </Link>
                  {item.hasSubmitted ? (
                    <Link to={`/challenges/${item.id}`} className="btn btn--primary">
                      View leaderboard
                    </Link>
                  ) : item.entered ? (
                    <Link
                      to={`/create?challenge=${item.id}&type=${item.submissionKind === 'move' ? 'move' : 'recipe'}`}
                      className="btn btn--primary"
                    >
                      Submit entry
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={enteringId === item.id || item.status === 'closed'}
                      onClick={() => handleEnter(item)}
                    >
                      {item.status === 'closed' ? 'Closed' : enteringId === item.id ? 'Entering…' : 'Enter'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
        <UserBadgePanel />
      </section>

      <PageCta
        title="New challenges every week"
        text="Enter, submit, and vote — structured competition inside Lyfstyl communities."
        label={isAuthenticated ? 'Open dashboard' : 'Create account'}
        to={isAuthenticated ? '/dashboard' : '/join'}
      />
    </main>
  )
}
