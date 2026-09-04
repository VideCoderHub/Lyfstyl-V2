import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import CommunityDiscussion from '../components/CommunityDiscussion'
import CommunityHubHero, { ExploreCategoryCard } from '../components/CommunityHubHero'
import MediaCard from '../components/MediaCard'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import {
  COMMUNITY_DETAIL_THEMES,
  DANCE_HUB_SLUG,
  DANCE_STYLE_SLUGS,
  ENTERTAINMENT_HUB,
  FOOD_HUB,
  isDanceStyleSlug,
  isFoodLiveSlug,
} from '../data/communities'
import { useAuth } from '../context/AuthContext'

function buildBreadcrumbs(slug, communityName) {
  if (slug === DANCE_HUB_SLUG) {
    return [
      { label: 'Communities', to: '/community?tab=entertainment' },
      { label: 'Entertainment', to: '/community?tab=entertainment' },
      { label: 'Dance' },
    ]
  }
  if (isDanceStyleSlug(slug)) {
    return [
      { label: 'Communities', to: '/community?tab=entertainment' },
      { label: 'Entertainment', to: '/community?tab=entertainment' },
      { label: 'Dance', to: `/community/${DANCE_HUB_SLUG}` },
      { label: communityName },
    ]
  }
  if (isFoodLiveSlug(slug)) {
    return [
      { label: 'Communities', to: '/community?tab=food' },
      { label: 'Food Community', to: '/community?tab=food' },
      { label: communityName },
    ]
  }
  return [{ label: 'Communities', to: '/community' }, { label: communityName }]
}

export default function CommunityDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [data, setData] = useState(null)
  const [danceStyles, setDanceStyles] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const theme = COMMUNITY_DETAIL_THEMES[slug]
  const isDanceHub = slug === DANCE_HUB_SLUG
  const isRichLayout = Boolean(theme) || isDanceStyleSlug(slug)

  function loadCommunity() {
    return api.getCommunity(slug).then(setData)
  }

  useEffect(() => {
    setLoading(true)
    const requests = [loadCommunity()]
    if (isDanceHub) {
      requests.push(api.getCommunities({ vertical: 'dance' }).then((res) => setDanceStyles(res.communities ?? [])))
    }
    Promise.all(requests)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [slug])

  async function toggleJoin() {
    if (!isAuthenticated) return router.push('/join')
    setJoining(true)
    try {
      if (data.community.joined) {
        const result = await api.leaveCommunity(slug)
        setMessage(result.message ?? `Left ${data.community.name}`)
      } else {
        const result = await api.joinCommunity(slug)
        setMessage(result.message ?? `Joined ${data.community.name}!`)
        await refresh()
      }
      await loadCommunity()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><CardGridSkeleton count={4} /></div>
      </main>
    )
  }

  if (!data?.community) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Community not found.</p>
          <Link href="/community" className="btn btn--outline">All communities</Link>
        </div>
      </main>
    )
  }

  const { community, feed, members, topCreators, posts, activity } = data
  const createType = community.vertical === 'dance' ? 'move' : 'recipe'
  const createUrl = `/create?community=${community.slug}&type=${createType}`
  const breadcrumbs = buildBreadcrumbs(slug, community.name)
  const pillar = theme?.pillar ?? (community.vertical === 'dance' ? 'entertainment' : 'food')

  const heroTitle = theme?.headline ?? community.name
  const heroAccent = theme?.headlineAccent ?? ''
  const heroTagline = theme?.tagline ?? community.description
  const heroLede = isDanceStyleSlug(slug)
    ? community.description
    : theme?.tagline && theme?.headlineAccent
      ? community.description
      : community.description
  const heroImage = theme?.heroImage ?? null
  const heroFeatures = isDanceHub
    ? ENTERTAINMENT_HUB.features
    : isFoodLiveSlug(slug)
      ? FOOD_HUB.features
      : []

  const heroActions = (
    <>
      <button
        type="button"
        className={`btn ${pillar === 'entertainment' ? 'btn--entertainment' : 'btn--food'} ${community.joined ? 'btn--outline' : ''}`}
        onClick={toggleJoin}
        disabled={joining}
      >
        {joining ? 'Updating…' : community.joined ? 'Joined' : (theme?.cta ?? 'Join community')}
      </button>
      <Link href={createUrl} className="btn btn--outline">
        {theme?.secondaryCta ?? 'Create post'}
      </Link>
    </>
  )

  return (
    <main className={`subpage ${isRichLayout ? 'comm-detail-page' : ''}`}>
      {isRichLayout ? (
        <>
          <CommunityHubHero
            pillar={pillar}
            breadcrumbs={breadcrumbs}
            eyebrow={theme?.pillarLabel ?? (pillar === 'entertainment' ? 'Entertainment Community' : 'Food Community')}
            title={heroTitle}
            headlineAccent={heroAccent}
            tagline={isFoodLiveSlug(slug) || isDanceHub ? heroTagline : undefined}
            lede={heroLede}
            heroImage={heroImage}
            features={heroFeatures}
            actions={heroActions}
            avatars={
              isFoodLiveSlug(slug) ? (
                <p className="comm-hub-hero__avatars-copy">Join a community that cooks from the heart.</p>
              ) : null
            }
          />

          {isDanceHub ? (
            <section className="content-wrap comm-explore-section">
              <div className="section-head comm-section-head">
                <div>
                  <p className="section-eyebrow">Explore Dance</p>
                  <h2>Pick your style</h2>
                </div>
              </div>
              <div className="comm-explore-grid">
                {ENTERTAINMENT_HUB.danceStyles.map((style) => (
                  <ExploreCategoryCard
                    key={style.slug}
                    title={style.title}
                    description={danceStyles.find((s) => s.slug === style.slug)?.memberCount
                      ? `${danceStyles.find((s) => s.slug === style.slug).memberCount} members`
                      : 'Join the cypher'}
                    icon={style.icon}
                    to={`/community/${style.slug}`}
                    active={false}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {isFoodLiveSlug(slug) ? (
            <section className="content-wrap comm-explore-section">
              <div className="section-head comm-section-head">
                <div>
                  <p className="section-eyebrow">Explore {community.name}</p>
                  <h2>Everything in one place</h2>
                </div>
              </div>
              <div className="comm-explore-grid comm-explore-grid--food">
                {FOOD_HUB.exploreSections.map((section) => (
                  <ExploreCategoryCard
                    key={section.id}
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    to={section.id === 'recipes' ? `/recipes?community=${slug}` : `#${section.id}`}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className="page-hero">
          <div className="page-hero__inner content-wrap">
            <nav className="comm-hub-hero__crumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.label}>
                  {index > 0 ? <span className="comm-hub-hero__crumb-sep" aria-hidden="true">›</span> : null}
                  {crumb.to ? <Link href={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                </span>
              ))}
            </nav>
            <h1>{community.name}</h1>
            <p className="page-hero__lede">{community.description}</p>
            <div className="page-hero__actions">{heroActions}</div>
          </div>
        </section>
      )}

      <section className="content-wrap">
        <div className="community-stats">
          <div><strong>{community.memberCount}</strong><span>Members</span></div>
          <div><strong>{community.recipeCount}</strong><span>Recipes</span></div>
          <div><strong>{community.moveCount}</strong><span>Moves</span></div>
          <div><strong>{community.challengeCount ?? feed.challenges?.length ?? 0}</strong><span>Challenges</span></div>
        </div>

        {isDanceHub && feed.moves?.length ? (
          <>
            <div className="section-head comm-section-head">
              <div>
                <p className="section-eyebrow">What&apos;s trending</p>
                <h2>Hot moves</h2>
              </div>
              <Link href="/moves" className="comm-view-all">View all →</Link>
            </div>
            <div className="card-grid card-grid--portrait card-grid--stagger">
              {feed.moves.map((move) => (
                <MediaCard
                  key={move.id}
                  to={`/moves/${move.id}`}
                  image={move.image}
                  tag="Move"
                  tagClass="tag--dance"
                  title={move.title}
                  meta={`${move.style} · ${move.length}`}
                  portrait
                  play
                  socialStats={{ applause: move.applauseCount, comments: move.commentCount }}
                />
              ))}
            </div>
          </>
        ) : null}

        {activity?.length ? (
          <section className="community-activity">
            <div className="section-head"><h2>Recent activity</h2></div>
            <ul className="activity-feed">
              {activity.map((item) => (
                <li key={item.id} className="activity-feed__item">
                  {item.href ? (
                    <Link href={item.href} className="activity-feed__label">{item.label}</Link>
                  ) : (
                    <span className="activity-feed__label">{item.label}</span>
                  )}
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {topCreators?.length ? (
          <section>
            <div className="section-head"><h2>Top creators</h2></div>
            <div className="people-grid people-grid--compact">
              {topCreators.map((creator) => (
                <Link key={creator.id} to={`/creators/${creator.id}`} className="people-card people-card--compact">
                  <span className="people-card__name">{creator.name}</span>
                  <span className="people-card__meta">{creator.posts} posts · {creator.country}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {feed.recipes?.length ? (
          <>
            <div className="section-head">
              <h2>Recipes in this community</h2>
              <Link href={`/recipes?community=${community.slug}`}>View all</Link>
            </div>
            <div className="card-grid card-grid--stagger">
              {feed.recipes.map((recipe) => (
                <MediaCard
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  image={recipe.image}
                  tag="Recipe"
                  tagClass="tag--food"
                  title={recipe.title}
                  meta={`${recipe.time} · ${recipe.level}`}
                  socialStats={{ applause: recipe.applauseCount, comments: recipe.commentCount }}
                />
              ))}
            </div>
          </>
        ) : null}

        {!isDanceHub && feed.moves?.length ? (
          <>
            <div className="section-head">
              <h2>Dance clips</h2>
              <Link href={`/moves?community=${community.slug}`}>View all</Link>
            </div>
            <div className="card-grid card-grid--portrait card-grid--stagger">
              {feed.moves.map((move) => (
                <MediaCard
                  key={move.id}
                  to={`/moves/${move.id}`}
                  image={move.image}
                  tag="Move"
                  tagClass="tag--dance"
                  title={move.title}
                  meta={`${move.style} · ${move.length}`}
                  portrait
                  play
                  socialStats={{ applause: move.applauseCount, comments: move.commentCount }}
                />
              ))}
            </div>
          </>
        ) : null}

        {feed.challenges?.length ? (
          <>
            <div className="section-head"><h2>Active challenges</h2></div>
            <div className="challenge-list">
              {feed.challenges.map((c) => (
                <article key={c.id} className={`challenge-card challenge-card--${c.tone}`}>
                  <div>
                    <span className="tag">{c.type}</span>
                    <h2>
                      <Link href={`/challenges/${c.id}`} className="challenge-card__title">{c.title}</Link>
                    </h2>
                    <p>{c.ends} · Prize: {c.prize}</p>
                  </div>
                  <Link href={`/challenges/${c.id}`} className="btn btn--primary">
                    {c.entered ? 'View' : 'Enter'}
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : null}

        <CommunityDiscussion slug={slug} posts={posts ?? []} joined={community.joined} />

        {members?.length ? (
          <section>
            <div className="section-head"><h2>Members</h2></div>
            <div className="people-grid people-grid--compact">
              {members.map((member) => (
                <Link key={member.id} to={`/creators/${member.id}`} className="people-card people-card--compact">
                  <span className="people-card__name">{member.name}</span>
                  <span className="people-card__meta">{member.country} · {member.points} pts</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}
