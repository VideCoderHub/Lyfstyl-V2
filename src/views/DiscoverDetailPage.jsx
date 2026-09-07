import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import CommentSection from '../components/CommentSection'
import DetailBreadcrumb from '../components/DetailBreadcrumb'
import MediaCard from '../components/MediaCard'
import RelatedCards from '../components/RelatedCards'
import StarRating from '../components/StarRating'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCelebrate } from '../context/CelebrateContext'

export default function DiscoverDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const { celebrate } = useCelebrate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDiscoverItem(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><Skeleton className="skeleton--detail" /></div>
      </main>
    )
  }

  if (!data?.item) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Story not found.</p>
          <Link href="/discover" className="btn btn--outline">Back to Discover</Link>
        </div>
      </main>
    )
  }

  const { item, linked, related } = data

  async function handleLinkedRate(rating) {
    if (!linked || !isAuthenticated) return router.push('/login')
    const type = linked.kind === 'recipe' ? 'recipe' : 'move'
    const starData = await api.starContent(type, linked.id, rating)
    const earnedPoints = starData.newBadges?.length || !linked.starred
    setData((current) => ({
      ...current,
      linked: {
        ...current.linked,
        starred: true,
        rating: starData.rating,
        starStats: starData.starStats ?? current.linked.starStats,
      },
    }))
    setMessage(
      `Rated ${rating} star${rating === 1 ? '' : 's'}${earnedPoints ? ' — +10 points' : ''}`,
    )
    if (starData.newBadges?.length) {
      celebrate({
        title: 'Badge unlocked!',
        badges: starData.newBadges,
        shareText: `I just earned ${starData.newBadges[0].name} on Lyfstyl!`,
      })
      await refresh()
    } else if (rating === 5) {
      celebrate({
        title: 'Five stars!',
        message: 'You loved this — share the vibe with friends.',
        shareText: `I gave 5 stars to "${linked.title}" on Lyfstyl`,
      })
    }
  }

  return (
    <main className="subpage">
      <article className="detail">
        <div className="detail__hero" style={{ backgroundImage: `url(${item.image})` }} />
        <div className="content-wrap detail__body">
          <DetailBreadcrumb
            items={[
              { label: 'Discover', to: '/discover' },
              { label: item.title },
            ]}
          />

          <div className="detail__head">
            <span className="tag">{item.tag}</span>
            <h1>{item.title}</h1>
            <p className="detail__meta">
              {item.meta}
              {item.communityName ? ` · ${item.communityName}` : ''}
              {item.country ? ` · ${item.country}` : ''}
            </p>
            <p className="detail__lede">{item.body}</p>
            {item.communitySlug ? (
              <Link href={`/community/${item.communitySlug}`} className="btn btn--outline">
                View {item.communityName} community
              </Link>
            ) : null}
          </div>

          {linked ? (
            <section className="detail__linked">
              <h2>Featured content</h2>
              <div className="detail__linked-card">
                <MediaCard
                  to={linked.kind === 'recipe' ? `/recipes/${linked.id}` : `/moves/${linked.id}`}
                  image={linked.image}
                  tag={linked.kind === 'recipe' ? 'Recipe' : 'Move'}
                  tagClass={linked.kind === 'recipe' ? 'tag--coral' : 'tag--lime'}
                  title={linked.title}
                  meta={linked.kind === 'recipe' ? `${linked.time} · ${linked.level}` : `${linked.style} · ${linked.length}`}
                  portrait={linked.kind === 'move'}
                  play={linked.kind === 'move'}
                />
                {isAuthenticated ? (
                  <StarRating
                    value={linked.rating ?? 0}
                    average={linked.starStats?.average ?? 0}
                    count={linked.starStats?.count ?? 0}
                    interactive
                    size="sm"
                    onRate={handleLinkedRate}
                  />
                ) : (
                  <StarRating
                    average={linked.starStats?.average ?? 0}
                    count={linked.starStats?.count ?? 0}
                    size="sm"
                  />
                )}
              </div>
            </section>
          ) : null}

          <CommentSection type="discover" id={id} />

          {related?.length ? (
            <section className="related">
              <div className="section-head"><h2>More from this community</h2></div>
              <div className="card-grid">
                {related.map((rel) => (
                  <MediaCard
                    key={rel.id}
                    to={rel.detailUrl}
                    image={rel.image}
                    tag={rel.tag}
                    title={rel.title}
                    meta={rel.meta}
                    portrait={rel.kind === 'move'}
                    play={rel.kind === 'move'}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </main>
  )
}
