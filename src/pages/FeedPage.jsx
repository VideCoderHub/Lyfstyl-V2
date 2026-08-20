import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FollowButton from '../components/FollowButton'
import MediaCard from '../components/MediaCard'
import PageHero from '../components/PageHero'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'following', label: 'Following' },
  { id: 'activity', label: 'Your activity' },
  { id: 'suggestions', label: 'Discover creators' },
]

export default function FeedPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('following')
  const [items, setItems] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .getFeed(tab)
      .then((data) => {
        setItems(data.items ?? [])
        setSuggestions(data.suggestions ?? [])
      })
      .catch(() => {
        setItems([])
        setSuggestions([])
      })
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Social feed"
        title="From creators you follow"
        lede="Recipes, moves, and activity from your Lyfstyl graph — structured discovery, not noise."
        actions={
          <Link to="/people" className="btn btn--outline">
            Browse people
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="feed-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`feed-tabs__btn ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : tab === 'activity' ? (
          items.length ? (
            <ul className="activity-feed">
              {items.map((entry) => (
                <li key={entry.id} className="activity-feed__item">
                  <span className="activity-feed__label">{entry.label}</span>
                  <time dateTime={entry.createdAt}>
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="page-status">No activity yet. Explore recipes, moves, and communities to build your feed.</p>
          )
        ) : tab === 'suggestions' ? (
          suggestions.length ? (
            <div className="people-grid">
              {suggestions.map((entry) => (
                <article key={entry.user.id} className="people-card">
                  <Link to={`/creators/${entry.user.id}`} className="people-card__name">
                    {entry.user.name}
                  </Link>
                  <p className="people-card__meta">
                    {entry.user.country} · {entry.recipeCount} recipes · {entry.moveCount} moves
                  </p>
                  <FollowButton userId={entry.user.id} />
                </article>
              ))}
            </div>
          ) : (
            <p className="page-status">You&apos;re following plenty of creators. Check back later for more suggestions.</p>
          )
        ) : items.length ? (
          <>
            <div className="card-grid card-grid--stagger">
              {items.map((item) => (
                <MediaCard
                  key={`${item.kind}-${item.id}`}
                  to={item.detailUrl}
                  image={item.image}
                  tag={item.tag}
                  tagClass={item.tagClass}
                  title={item.title}
                  meta={`${item.creator?.name ?? 'Creator'} · ${item.meta}`}
                  portrait={item.portrait}
                  play={item.play}
                  socialStats={{ applause: item.applauseCount, comments: item.commentCount }}
                />
              ))}
            </div>
            {suggestions.length ? (
              <>
                <div className="section-head">
                  <h2>Suggested creators</h2>
                  <Link to="/people">See all</Link>
                </div>
                <div className="people-grid people-grid--compact">
                  {suggestions.slice(0, 4).map((entry) => (
                    <article key={entry.user.id} className="people-card people-card--compact">
                      <Link to={`/creators/${entry.user.id}`}>{entry.user.name}</Link>
                      <FollowButton userId={entry.user.id} />
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="feed-empty">
            <p className="page-status">
              {user?.name ? `${user.name}, your feed is empty.` : 'Your feed is empty.'} Follow creators to see their latest recipes and moves here.
            </p>
            <Link to="/people" className="btn btn--primary">
              Find creators to follow
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
