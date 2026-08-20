import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ReviewSection({ type, id, initialStats }) {
  const { isAuthenticated, setMessage } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(initialStats ?? { count: 0, average: 0 })
  const [userReview, setUserReview] = useState(null)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const data = await api.getReviews(type, id)
    setReviews(data.reviews ?? [])
    setStats(data.stats ?? { count: 0, average: 0 })
    setUserReview(data.userReview ?? null)
    if (data.userReview) {
      setRating(data.userReview.rating)
      setBody(data.userReview.body)
    }
    setLoading(false)
  }

  useEffect(() => {
    load().catch(() => setLoading(false))
  }, [type, id])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const data = await api.postReview(type, id, { rating, body: body.trim() })
      setUserReview(data.review)
      setStats(data.stats)
      setMessage(userReview ? 'Review updated' : 'Review posted')
      await load()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="reviews">
      <div className="reviews__head">
        <h2>Reviews</h2>
        {stats.count ? (
          <p className="reviews__stats">
            <strong>{stats.average}</strong> / 5 · {stats.count} review{stats.count === 1 ? '' : 's'}
          </p>
        ) : (
          <p className="reviews__stats">No reviews yet</p>
        )}
      </div>

      {loading ? <p className="page-status">Loading reviews…</p> : null}

      <ul className="reviews__list">
        {reviews.map((review) => (
          <li key={review.id} className="reviews__item">
            <div className="reviews__avatar" aria-hidden="true">
              {(review.author?.name ?? 'U').slice(0, 1)}
            </div>
            <div>
              <div className="reviews__meta">
                <strong>{review.author?.name ?? 'Creator'}</strong>
                <span className="reviews__stars" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              <p>{review.body}</p>
            </div>
          </li>
        ))}
        {!loading && !reviews.length ? <p className="page-status">Be the first to review.</p> : null}
      </ul>

      {isAuthenticated ? (
        <form className="reviews__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Your rating</span>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{userReview ? 'Update your review' : 'Write a review'}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What did you love? Tips for others?"
              required
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : userReview ? 'Update review' : 'Post review'}
          </button>
        </form>
      ) : (
        <p className="page-status">Log in to leave a review.</p>
      )}
    </section>
  )
}
