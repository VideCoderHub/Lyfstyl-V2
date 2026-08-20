import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import UserBadgePanel from '../components/UserBadgePanel'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'dance', label: 'Dance' },
  { id: 'joined', label: 'Joined' },
]

export default function CommunityPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [stats, setStats] = useState([])
  const [members, setMembers] = useState([])
  const [communities, setCommunities] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function loadCommunities(activeFilter = filter) {
    const params = {}
    if (activeFilter === 'food') params.vertical = 'food'
    if (activeFilter === 'dance') params.vertical = 'dance'
    if (activeFilter === 'joined') params.joined = 'true'
    return api.getCommunities(params).then((data) => setCommunities(data.communities ?? []))
  }

  useEffect(() => {
    Promise.all([api.getStats(), api.getMembers(), loadCommunities()])
      .then(([statsData, membersData]) => {
        const s = statsData.stats
        setStats([
          { value: s.creators, label: 'Creators' },
          { value: s.recipesShared, label: 'Recipes Shared' },
          { value: s.danceClips, label: 'Dance Clips' },
          { value: s.countries, label: 'Countries' },
        ])
        setMembers(membersData.members ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (filter === 'joined' && !isAuthenticated) return
    setLoading(true)
    loadCommunities(filter)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [filter, isAuthenticated])

  async function handleJoin(slug, joined) {
    if (!isAuthenticated) return navigate('/join')
    try {
      if (joined) {
        const result = await api.leaveCommunity(slug)
        setCommunities((list) =>
          list.map((c) =>
            c.slug === slug ? { ...c, joined: false, memberCount: Math.max(0, c.memberCount - 1) } : c,
          ),
        )
        setMessage(result.message ?? 'Left community')
      } else {
        const result = await api.joinCommunity(slug)
        setCommunities((list) =>
          list.map((c) =>
            c.slug === slug ? { ...c, joined: true, memberCount: c.memberCount + 1 } : c,
          ),
        )
        setMessage(result.message ?? 'Joined community — +15 points')
        await refresh()
      }
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Community"
        title="Creators who cook and move"
        lede="Structured communities for discussion, learning, collaboration, marketplace, and competitions."
        actions={
          <>
            <Link className="btn btn--primary" to={isAuthenticated ? '/create' : '/join'}>
              {isAuthenticated ? 'Create post' : 'Create free account'}
            </Link>
            <Link className="btn btn--outline" to="/feed">
              Your feed
            </Link>
          </>
        }
      />

      <section className="stats stats--flush" aria-label="Community stats">
        <div className="stats__inner">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-wrap content-wrap--with-panel">
        <div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}

          <div className="feed-tabs" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`feed-tabs__btn ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? <CardGridSkeleton count={4} /> : null}

          {!loading ? (
            <>
              <div className="section-head">
                <h2>Structured communities</h2>
                <p>Join to unlock discussion, community-scoped challenges, and personalized discovery.</p>
              </div>

              {!communities.length ? (
                <p className="page-status">
                  {filter === 'joined'
                    ? 'You have not joined any communities yet.'
                    : 'No communities match this filter.'}
                </p>
              ) : null}

              <div className="community-grid">
                {communities.map((community) => (
                  <article key={community.slug} className="community-card">
                    <span className={`tag ${community.vertical === 'food' ? 'tag--food' : 'tag--dance'}`}>
                      {community.vertical}
                    </span>
                    <Link to={`/community/${community.slug}`}>
                      <h3>{community.name}</h3>
                    </Link>
                    <p>{community.description}</p>
                    <p className="community-card__meta">
                      {community.memberCount} members · {community.recipeCount} recipes · {community.moveCount} moves
                    </p>
                    <div className="community-card__actions">
                      <Link to={`/community/${community.slug}`} className="btn btn--ghost">
                        Explore
                      </Link>
                      <button
                        type="button"
                        className={`btn ${community.joined ? 'btn--outline' : 'btn--primary'}`}
                        onClick={() => handleJoin(community.slug, community.joined)}
                      >
                        {community.joined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="section-head">
                <h2>Featured creators</h2>
                <p>Meet the people behind the plates and the cyphers.</p>
              </div>

              <div className="people-grid">
                {members.map((person) => (
                  <Link key={person.id} to={`/creators/${person.id}`} className="person-card person-card--link">
                    <img src={person.avatar} alt={person.name} />
                    <div>
                      <h3>{person.name}</h3>
                      <p className="person-card__role">{person.role}</p>
                      <p>{person.blurb}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <UserBadgePanel />
      </section>

      <PageCta
        title="Your seat at the table is open"
        text="Join communities, post in discussion, and enter scoped challenges."
        label={isAuthenticated ? 'Go to dashboard' : "Join Now — it's free"}
        to={isAuthenticated ? '/dashboard' : '/join'}
      />
    </main>
  )
}
