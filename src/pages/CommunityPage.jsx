import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ComingSoonCard } from '../components/CommunityHubHero'
import MediaCard from '../components/MediaCard'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import {
  COMMUNITY_FEATURES,
  DANCE_HUB_SLUG,
  ENTERTAINMENT_HUB,
  FOOD_HUB,
  FOOD_LIVE_SLUGS,
  PILLAR_TABS,
} from '../data/communities'
import { useAuth } from '../context/AuthContext'

function formatMembers(count) {
  if (!count) return ''
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K members`
  return `${count} members`
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [communities, setCommunities] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const tab = searchParams.get('tab') === 'food' ? 'food' : 'entertainment'

  function setTab(nextTab) {
    setSearchParams({ tab: nextTab }, { replace: true })
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getCommunities(),
      api.getMoves({ limit: 5 }),
      api.getRecipes({ limit: 5 }),
    ])
      .then(([communityData, movesData, recipesData]) => {
        setCommunities(communityData.communities ?? [])
        const moves = (movesData.moves ?? []).map((item) => ({ ...item, kind: 'move' }))
        const recipes = (recipesData.recipes ?? []).map((item) => ({ ...item, kind: 'recipe' }))
        setTrending([...moves, ...recipes].slice(0, 5))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const communityMap = useMemo(
    () => Object.fromEntries(communities.map((c) => [c.slug, c])),
    [communities],
  )

  const foodLive = FOOD_HUB.live.map((item) => ({
    ...item,
    api: communityMap[item.slug],
    membersLabel: communityMap[item.slug]
      ? formatMembers(communityMap[item.slug].memberCount)
      : item.membersLabel,
  }))

  const danceHub = communityMap[DANCE_HUB_SLUG]

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
    <main className="subpage comm-hub-page">
      <section className="comm-welcome">
        <div className="comm-welcome__glow comm-welcome__glow--food" aria-hidden="true" />
        <div className="comm-welcome__glow comm-welcome__glow--ent" aria-hidden="true" />
        <div className="content-wrap comm-welcome__inner">
          <p className="comm-welcome__eyebrow">Lyfstyl Communities</p>
          <h1>Welcome to Lyfstyl</h1>
          <p className="comm-welcome__gradient">Your lifestyle. Your communities. Your way.</p>
          <p className="comm-welcome__lede">
            Join dedicated communities that inspire you. Explore. Connect. Share.
          </p>
          <div className="comm-welcome__actions">
            <Link className="btn btn--primary btn--lg" to={isAuthenticated ? '/dashboard' : '/join'}>
              {isAuthenticated ? 'Go to dashboard' : 'Join Lyfstyl'}
            </Link>
            <button type="button" className="btn btn--outline btn--lg" onClick={() => setTab(tab)}>
              Explore communities
            </button>
          </div>
        </div>
      </section>

      <section className="content-wrap comm-hub-body">
        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <div className="comm-pillar-tabs" role="tablist" aria-label="Community pillars">
          {PILLAR_TABS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              role="tab"
              aria-selected={tab === pillar.id}
              className={`comm-pillar-tabs__btn comm-pillar-tabs__btn--${pillar.id} ${tab === pillar.id ? 'is-active' : ''}`}
              onClick={() => setTab(pillar.id)}
            >
              {pillar.label}
            </button>
          ))}
        </div>

        {loading ? <CardGridSkeleton count={3} /> : null}

        {!loading && tab === 'entertainment' ? (
          <div className="comm-pillar comm-pillar--entertainment" role="tabpanel">
            <article className="comm-pillar-card comm-pillar-card--live">
              <div className="comm-pillar-card__media">
                <img src={ENTERTAINMENT_HUB.live.image} alt="" />
                <span className="comm-pillar-card__live-badge">Live now</span>
              </div>
              <div className="comm-pillar-card__body">
                <p className="comm-pillar-card__eyebrow">Entertainment</p>
                <h2>{ENTERTAINMENT_HUB.live.title}</h2>
                <p className="comm-pillar-card__tagline">{ENTERTAINMENT_HUB.live.tagline}</p>
                <p>{ENTERTAINMENT_HUB.live.description}</p>
                <p className="comm-pillar-card__meta">
                  {danceHub ? formatMembers(danceHub.memberCount) : 'Join the movement'}
                  {danceHub ? ` · ${danceHub.moveCount} moves` : null}
                </p>
                <div className="comm-pillar-card__actions">
                  <Link to={`/community/${DANCE_HUB_SLUG}`} className="btn btn--entertainment">
                    Explore Dance →
                  </Link>
                  {danceHub ? (
                    <button
                      type="button"
                      className={`btn ${danceHub.joined ? 'btn--outline' : 'btn--ghost'}`}
                      onClick={() => handleJoin(DANCE_HUB_SLUG, danceHub.joined)}
                    >
                      {danceHub.joined ? 'Joined' : 'Join'}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>

            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">More entertainment</p>
                <h2>Coming soon</h2>
                <p>We&apos;re building dedicated spaces — get ready for what&apos;s next.</p>
              </div>
            </div>

            <div className="comm-soon-grid">
              {ENTERTAINMENT_HUB.comingSoon.map((item) => (
                <ComingSoonCard key={item.id} {...item} />
              ))}
            </div>

            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">Inside Dance</p>
                <h2>Explore styles</h2>
              </div>
              <Link to={`/community/${DANCE_HUB_SLUG}`} className="comm-view-all">
                View all →
              </Link>
            </div>

            <div className="comm-style-row">
              {ENTERTAINMENT_HUB.danceStyles.map((style) => (
                <Link key={style.slug} to={`/community/${style.slug}`} className="comm-style-chip">
                  <span aria-hidden="true">{style.icon}</span>
                  {style.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && tab === 'food' ? (
          <div className="comm-pillar comm-pillar--food" role="tabpanel">
            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">{FOOD_HUB.eyebrow}</p>
                <h2>{FOOD_HUB.tagline}</h2>
                <p>{FOOD_HUB.lede}</p>
              </div>
            </div>

            <div className="comm-food-live-grid">
              {foodLive.map((item) => (
                <article key={item.slug} className="comm-food-card">
                  <Link to={`/community/${item.slug}`} className="comm-food-card__media">
                    <img src={item.image} alt="" />
                  </Link>
                  <div className="comm-food-card__body">
                    <span className="tag tag--food">Food</span>
                    <Link to={`/community/${item.slug}`}>
                      <h3>{item.title}</h3>
                    </Link>
                    <p className="comm-food-card__tagline">{item.tagline}</p>
                    <p>{item.description}</p>
                    <p className="comm-food-card__meta">{item.membersLabel}</p>
                    <div className="comm-food-card__actions">
                      <Link to={`/community/${item.slug}`} className="btn btn--food">
                        Explore {item.title} →
                      </Link>
                      {item.api ? (
                        <button
                          type="button"
                          className={`btn ${item.api.joined ? 'btn--outline' : 'btn--ghost'}`}
                          onClick={() => handleJoin(item.slug, item.api.joined)}
                        >
                          {item.api.joined ? 'Joined' : 'Join'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">More food communities</p>
                <h2>Coming soon</h2>
              </div>
            </div>

            <div className="comm-soon-grid comm-soon-grid--food">
              {FOOD_HUB.comingSoon.map((item) => (
                <ComingSoonCard key={item.id} {...item} />
              ))}
            </div>

            <p className="comm-food-footnote">
              Street Food and Soul Food are your dedicated food homes — not scattered categories.
              {' '}
              <Link to={`/community/${FOOD_LIVE_SLUGS[0]}`}>Start with Street Food</Link>
              {' '}
              or
              {' '}
              <Link to={`/community/${FOOD_LIVE_SLUGS[1]}`}>Soul Food</Link>.
            </p>
          </div>
        ) : null}

        {!loading && trending.length ? (
          <section className="comm-trending">
            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">Across Lyfstyl</p>
                <h2>What&apos;s trending</h2>
              </div>
              <Link to="/discover" className="comm-view-all">
                View all →
              </Link>
            </div>
            <div className="card-grid card-grid--stagger">
              {trending.map((item) => (
                <MediaCard
                  key={`${item.kind}-${item.id}`}
                  to={item.kind === 'move' ? `/moves/${item.id}` : `/recipes/${item.id}`}
                  image={item.image}
                  tag={item.kind === 'move' ? 'Move' : 'Recipe'}
                  tagClass={item.kind === 'move' ? 'tag--dance' : 'tag--food'}
                  title={item.title}
                  meta={
                    item.kind === 'move'
                      ? `${item.style} · ${item.views?.toLocaleString?.() ?? item.views} views`
                      : `${item.time} · ${item.level}`
                  }
                  portrait={item.kind === 'move'}
                  play={item.kind === 'move'}
                />
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <section className="comm-features-bar" aria-label="Community benefits">
        <div className="content-wrap comm-features-bar__inner">
          {COMMUNITY_FEATURES.map((feature) => (
            <div key={feature.label} className={`comm-features-bar__item comm-features-bar__item--${feature.accent}`}>
              <span className="comm-features-bar__icon" aria-hidden="true">
                {feature.icon}
              </span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
