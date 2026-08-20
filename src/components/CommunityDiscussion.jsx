import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CommunityDiscussion({ slug, posts: initialPosts = [], joined }) {
  const { isAuthenticated, setMessage } = useAuth()
  const [posts, setPosts] = useState(initialPosts)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!body.trim()) return
    setPosting(true)
    try {
      const data = await api.postCommunityDiscussion(slug, body.trim())
      setPosts((list) => [data.post, ...list])
      setBody('')
      setMessage(data.message ?? 'Posted to discussion')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <section className="comments community-discussion" id="discussion">
      <h2>Community discussion</h2>
      <p className="section-lede">Forum-style conversation — learning, collaboration, and hype inside this community.</p>

      <ul className="comments__list">
        {posts.map((post) => (
          <li key={post.id} className="comments__item">
            <div className="comments__avatar" aria-hidden="true">
              {(post.author?.name ?? 'U').slice(0, 1)}
            </div>
            <div>
              {post.author?.id ? (
                <Link to={`/creators/${post.author.id}`}><strong>{post.author.name}</strong></Link>
              ) : (
                <strong>{post.author?.name ?? 'Creator'}</strong>
              )}
              <p>{post.body}</p>
              <time dateTime={post.createdAt} className="community-discussion__time">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </li>
        ))}
        {!posts.length ? <p className="page-status">Start the conversation — ask a question or share a tip.</p> : null}
      </ul>

      {!isAuthenticated ? (
        <p className="page-status">Log in to join the discussion.</p>
      ) : !joined ? (
        <p className="page-status">Join this community to post in discussion.</p>
      ) : (
        <form className="comments__form" onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a question, share a tip, or hype a creator…"
            rows={3}
          />
          <button type="submit" className="btn btn--primary" disabled={posting}>
            {posting ? 'Posting…' : 'Post to community'}
          </button>
        </form>
      )}
    </section>
  )
}
