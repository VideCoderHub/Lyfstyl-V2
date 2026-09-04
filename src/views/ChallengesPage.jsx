import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ChallengeMascotPanel, { challengeCategory, useChallengeTabs } from '../components/ChallengeMascotPanel'
import PageHero, { PageCta } from '../components/PageHero'
import UserBadgePanel from '../components/UserBadgePanel'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'all', label: 'All challenges' },
  { id: 'cooking', label: 'Cooking battles', emoji: '👨‍🍳' },
  { id: 'dance', label: 'Dance battles', emoji: '💃' },
  { id: 'fusion', label: 'Food × Dance', emoji: '✨' },
]

export default function ChallengesPage() {
  const [searchParams] = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enteringId, setEnteringId] = useState(null)
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [mascotPhase, setMascotPhase] = useState('idle')
  const { tab, setTab, filtered } = useChallengeTabs(challenges)

  function loadChallenges() {
    return api.getChallenges().then((data) => setChallenges(data.challenges ?? []))
  }

  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && TABS.some((t) => t.id === urlTab)) setTab(urlTab)
  }, [searchParams, setTab])

  useEffect(() => {
    loadChallenges()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleEnter(challenge) {
    if (!isAuthenticated) {
      router.push('/join')
      return
    }
    if (challenge.entered || challenge.status === 'closed') return

    setActiveChallenge(challenge)
    setMascotPhase('entering')
    setEnteringId(challenge.id)
    try {
      const data = await api.enterChallenge(challenge.id)
      setMessage(data.message)
      await refresh()
      await loadChallenges()
      setMascotPhase('idle')
    } catch (err) {
      setMessage(err.message)
      setMascotPhase('idle')
    } finally {
      setEnteringId(null)
    }
  }

  return (
    <main className="subpage subpage--challenges">
      <PageHero
        eyebrow="Challenges"
        title="Cook-offs & dance battles — clearly split"
        lede="Cooking battles live in food communities. Dance battles live in movement communities. Pick your arena."
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
          <div className="feed-tabs challenge-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`feed-tabs__btn ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => {
                  setTab(t.id)
                  setActiveChallenge(null)
                }}
              >
                {t.emoji ? `${t.emoji} ` : ''}{t.label}
              </button>
            ))}
          </div>

          {activeChallenge ? (
            <ChallengeMascotPanel challenge={activeChallenge} phase={mascotPhase} />
          ) : null}

          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {loading ? <p className="page-status">Loading challenges…</p> : null}

          <div className="challenge-list">
            {filtered.map((item) => (
              <article
                key={item.id}
                className={`challenge-card challenge-card--${item.tone} ${activeChallenge?.id === item.id ? 'is-focused' : ''}`}
                onMouseEnter={() => {
                  setActiveChallenge(item)
                  setMascotPhase('idle')
                }}
              >
                <div>
                  <div className="challenge-card__tags">
                    <span className={`tag ${challengeCategory(item.type) === 'cooking' ? 'tag--food' : challengeCategory(item.type) === 'dance' ? 'tag--dance' : 'tag--fusion'}`}>
                      {challengeCategory(item.type) === 'cooking' ? 'Cooking battle' : challengeCategory(item.type) === 'dance' ? 'Dance battle' : 'Fusion'}
                    </span>
                    <span className="tag">{item.type}</span>
                    <span className={`tag ${item.status === 'closed' ? 'tag--muted' : 'tag--food'}`}>
                      {item.status === 'closed' ? 'Closed' : 'Active'}
                    </span>
                  </div>
                  <h2>
                    <Link href={`/challenges/${item.id}`} className="challenge-card__title">
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
                  <Link href={`/challenges/${item.id}`} className="btn btn--outline">
                    View details
                  </Link>
                  {item.hasSubmitted ? (
                    <Link href={`/challenges/${item.id}`} className="btn btn--primary">
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
                      {item.status === 'closed' ? 'Closed' : enteringId === item.id ? 'Entering…' : 'Enter battle'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {!loading && !filtered.length ? (
            <p className="page-status">No {tab === 'all' ? '' : tab} challenges right now. Check back soon!</p>
          ) : null}
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
