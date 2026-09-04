import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import CommentSection from '../components/CommentSection'
import DetailBreadcrumb from '../components/DetailBreadcrumb'
import MediaCard from '../components/MediaCard'
import RelatedCards from '../components/RelatedCards'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function DiscoverDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, setMessage } = useAuth()
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

  async function starLinked() {
    if (!linked || !isAuthenticated) return router.push('/login')
    const type = linked.kind === 'recipe' ? 'recipe' : 'move'
    await api.starContent(type, linked.id)
    setMessage('Starred — +10 points')
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
                  <button type="button" className="btn btn--ghost" onClick={starLinked}>
                    Star featured content
                  </button>
                ) : null}
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
