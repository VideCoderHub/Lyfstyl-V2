import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommunityDiscussion from '../components/CommunityDiscussion'
import MediaCard from '../components/MediaCard'
import PageHero from '../components/PageHero'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CommunityDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  function loadCommunity() {
    return api.getCommunity(slug).then(setData)
  }

  useEffect(() => {
    loadCommunity()
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [slug])

  async function toggleJoin() {
    if (!isAuthenticated) return navigate('/join')
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
          <Link to="/community" className="btn btn--outline">All communities</Link>
        </div>
      </main>
    )
  }

  const { community, feed, members, topCreators, posts, activity } = data
  const createType = community.vertical === 'dance' ? 'move' : 'recipe'
  const createUrl = `/create?community=${community.slug}&type=${createType}`

  return (
    <main className="subpage">
      <PageHero
        eyebrow={community.vertical}
        title={community.name}
        lede={community.description}
        actions={
          <>
            <button
              type="button"
              className={`btn ${community.joined ? 'btn--outline' : 'btn--primary'}`}
              onClick={toggleJoin}
              disabled={joining}
            >
              {joining ? 'Updating…' : community.joined ? 'Leave community' : 'Join community'}
            </button>
            <Link to={createUrl} className="btn btn--outline">
              Create post
            </Link>
          </>
        }
      />

      <section className="content-wrap">
        <div className="community-stats">
          <div><strong>{community.memberCount}</strong><span>Members</span></div>
          <div><strong>{community.recipeCount}</strong><span>Recipes</span></div>
          <div><strong>{community.moveCount}</strong><span>Moves</span></div>
          <div><strong>{community.challengeCount ?? feed.challenges?.length ?? 0}</strong><span>Challenges</span></div>
        </div>

        {activity?.length ? (
          <section className="community-activity">
            <div className="section-head"><h2>Recent activity</h2></div>
            <ul className="activity-feed">
              {activity.map((item) => (
                <li key={item.id} className="activity-feed__item">
                  {item.href ? (
                    <Link to={item.href} className="activity-feed__label">{item.label}</Link>
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
              <Link to={`/recipes?community=${community.slug}`}>View all</Link>
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

        {feed.moves?.length ? (
          <>
            <div className="section-head">
              <h2>Dance clips</h2>
              <Link to={`/moves?community=${community.slug}`}>View all</Link>
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
                      <Link to={`/challenges/${c.id}`} className="challenge-card__title">{c.title}</Link>
                    </h2>
                    <p>{c.ends} · Prize: {c.prize}</p>
                  </div>
                  <Link to={`/challenges/${c.id}`} className="btn btn--primary">
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
