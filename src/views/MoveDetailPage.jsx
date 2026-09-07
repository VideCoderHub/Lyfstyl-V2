import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import ApplauseButton from '../components/ApplauseButton'
import ShareButton from '../components/ShareButton'
import StarRating from '../components/StarRating'
import CommentSection from '../components/CommentSection'
import DetailBreadcrumb from '../components/DetailBreadcrumb'
import RelatedCards from '../components/RelatedCards'
import ReviewSection from '../components/ReviewSection'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCelebrate } from '../context/CelebrateContext'

export default function MoveDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const { celebrate } = useCelebrate()
  const [move, setMove] = useState(null)
  const [related, setRelated] = useState([])
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getMove(id)
      .then((data) => {
        setMove(data.move)
        setRelated(data.related ?? [])
        setReviewStats(data.reviewStats ?? { count: 0, average: 0 })
      })
      .catch(() => setMove(null))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleSave() {
    if (!isAuthenticated) return router.push('/login')
    const data = await api.toggleSave('move', id)
    setMove((m) => ({ ...m, saved: data.saved }))
    setMessage(data.saved ? 'Saved to your library' : 'Removed from library')
  }

  async function handleRate(rating) {
    if (!isAuthenticated) return router.push('/login')
    const data = await api.starContent('move', id, rating)
    const earnedPoints = data.newBadges?.length || !move?.starred
    setMove((m) => ({
      ...m,
      starred: true,
      rating: data.rating,
      starStats: data.starStats ?? m.starStats,
    }))
    setMessage(
      `Rated ${rating} star${rating === 1 ? '' : 's'}${earnedPoints ? ' — +10 points' : ''}`,
    )
    if (data.newBadges?.length) {
      celebrate({
        title: 'Badge unlocked!',
        badges: data.newBadges,
        variant: 'trophy',
        shareText: `I just earned ${data.newBadges[0].name} on Lyfstyl!`,
      })
      await refresh()
    } else if (rating === 5) {
      celebrate({
        title: 'Five stars!',
        message: 'You loved this move — share the vibe with friends.',
        shareText: `I gave 5 stars to "${move.title}" on Lyfstyl`,
      })
    }
  }

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><Skeleton className="skeleton--detail" /></div>
      </main>
    )
  }

  if (!move) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Move not found.</p>
          <Link href="/moves" className="btn btn--outline">Back to moves</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="subpage">
      <article className="detail detail--move">
        <div className="detail__media">
          {move.videoUrl ? (
            <video className="detail__video" controls poster={move.image} src={move.videoUrl}>
              <track kind="captions" />
            </video>
          ) : (
            <div className="detail__hero" style={{ backgroundImage: `url(${move.image})` }} />
          )}
        </div>
        <div className="content-wrap detail__body">
          <DetailBreadcrumb
            items={[
              { label: 'Moves', to: '/moves' },
              { label: move.title },
            ]}
          />

          <div className="detail__head">
            <span className="tag tag--lime">Move</span>
            <h1>{move.title}</h1>
            <p className="detail__meta">
              {move.style} · {move.length} · {move.views} views
              {move.communityName ? ` · ${move.communityName}` : ''}
            </p>
            {move.creatorId ? (
              <Link href={`/creators/${move.creatorId}`} className="detail__creator">
                By {move.creatorName}
              </Link>
            ) : null}
            <p className="detail__lede">{move.description}</p>
            <StarRating
              value={move.rating ?? 0}
              average={move.starStats?.average ?? 0}
              count={move.starStats?.count ?? 0}
              interactive={isAuthenticated}
              onRate={handleRate}
            />
            <div className="detail__actions">
              <ApplauseButton
                type="move"
                id={id}
                initialCount={move.applauseCount}
                initialApplauded={move.applauded}
              />
              <ShareButton title={move.title} text={move.description} />
              <button type="button" className="btn btn--outline" onClick={toggleSave}>
                {move.saved ? 'Saved' : 'Save'}
              </button>
              <Link href="/challenges" className="btn btn--ghost">
                Enter challenge
              </Link>
            </div>
          </div>

          <CommentSection type="move" id={id} />
          <ReviewSection type="move" id={id} initialStats={reviewStats} />
          <RelatedCards title="More moves in this community" items={related} />
        </div>
      </article>
    </main>
  )
}
