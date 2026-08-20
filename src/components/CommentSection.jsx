import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CommentSection({ type, id }) {
  const { isAuthenticated, setMessage } = useAuth()
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await api.getComments(type, id)
    setComments(data.comments ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load().catch(() => setLoading(false))
  }, [type, id])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!body.trim()) return
    try {
      await api.postComment(type, id, body.trim())
      setBody('')
      setMessage('Comment posted — +5 points')
      await load()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className="comments">
      <h2>Discussion</h2>
      {loading ? <p className="page-status">Loading comments…</p> : null}

      <ul className="comments__list">
        {comments.map((comment) => (
          <li key={comment.id} className="comments__item">
            <div className="comments__avatar" aria-hidden="true">
              {(comment.author?.name ?? 'U').slice(0, 1)}
            </div>
            <div>
              <strong>{comment.author?.name ?? 'Creator'}</strong>
              <p>{comment.body}</p>
            </div>
          </li>
        ))}
        {!loading && !comments.length ? <p className="page-status">Be the first to comment.</p> : null}
      </ul>

      {isAuthenticated ? (
        <form className="comments__form" onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share feedback, tips, or hype…"
            rows={3}
          />
          <button type="submit" className="btn btn--primary">
            Post comment
          </button>
        </form>
      ) : (
        <p className="page-status">Log in to join the discussion.</p>
      )}
    </section>
  )
}
