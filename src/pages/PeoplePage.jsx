import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConnectButton from '../components/ConnectButton'
import FollowButton from '../components/FollowButton'
import PageHero from '../components/PageHero'
import { api } from '../api/client'

const FILTERS = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'following', label: 'Following' },
]

export default function PeoplePage() {
  const [filter, setFilter] = useState('suggested')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .getPeople(filter)
      .then((data) => setPeople(data.people ?? []))
      .catch(() => setPeople([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <main className="subpage">
      <PageHero
        eyebrow="People"
        title="Creators to follow & connect"
        lede="Follow for discovery. Connect for DMs and collaboration — the Lyfstyl social graph."
        actions={
          <Link to="/feed" className="btn btn--outline">
            Back to feed
          </Link>
        }
      />

      <section className="content-wrap">
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

        {loading ? <p className="page-status">Loading…</p> : null}

        {!loading && !people.length ? (
          <p className="page-status">
            {filter === 'following'
              ? 'You are not following anyone yet.'
              : 'No suggestions right now. Complete your profile and join communities for better matches.'}
          </p>
        ) : null}

        <div className="people-grid">
          {people.map((person) => (
            <article key={person.id} className="people-card">
              <Link to={`/creators/${person.id}`} className="people-card__name">
                {person.name}
              </Link>
              <p className="people-card__meta">
                {person.country}
                {person.followers != null ? ` · ${person.followers} followers` : ''}
                {person.recipeCount != null ? ` · ${person.recipeCount} recipes` : ''}
                {person.moveCount != null ? ` · ${person.moveCount} moves` : ''}
              </p>
              <div className="people-card__actions">
                <FollowButton userId={person.id} initialFollowing={person.isFollowing} />
                <ConnectButton userId={person.id} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
