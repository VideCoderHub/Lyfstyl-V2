import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function MessagesPage() {
  const { userId } = useParams()
  const { user, isAuthenticated, setMessage } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) return
    api
      .getConversations()
      .then((data) => setConversations(data.conversations ?? []))
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!userId || !isAuthenticated) return
    loadThread(Number(userId))
    const timer = window.setInterval(() => loadThread(Number(userId), true), 5000)
    return () => window.clearInterval(timer)
  }, [userId, isAuthenticated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadThread(id, quiet = false) {
    try {
      const msgData = await api.getMessages(id)
      setMessages(msgData.messages ?? [])
      const conv = conversations.find((c) => c.user?.id === id)
      if (conv?.user) {
        setActiveUser(conv.user)
      } else {
        const memberData = await api.getMember(id).catch(() => null)
        setActiveUser(memberData?.member ?? { id, name: `User ${id}` })
      }
      if (!quiet) {
        const refreshed = await api.getConversations()
        setConversations(refreshed.conversations ?? [])
      }
    } catch (err) {
      if (!quiet) setMessage(err.message)
    }
  }

  async function handleSend(event) {
    event.preventDefault()
    if (!body.trim() || !userId) return
    setSending(true)
    try {
      await api.sendMessage(userId, body.trim())
      setBody('')
      await loadThread(Number(userId), true)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="page-status">Log in to use messages.</p>
          <Link to="/login" className="btn btn--primary">Log in</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="subpage">
      <PageHero eyebrow="Messages" title="Chat with your connections" lede="Connect with creators first, then message them here." />

      <section className="content-wrap chat-layout">
        <aside className="chat-sidebar">
          <h2>Conversations</h2>
          {loading ? <p className="page-status">Loading…</p> : null}
          <ul className="chat-conversations">
            {conversations.map((conv) => (
              <li key={conv.user.id}>
                <Link
                  to={`/messages/${conv.user.id}`}
                  className={`chat-conversation ${Number(userId) === conv.user.id ? 'is-active' : ''}`}
                >
                  <span className="chat-conversation__avatar">{(conv.user.name ?? 'U').slice(0, 1)}</span>
                  <span>
                    <strong>{conv.user.name}</strong>
                    <small>{conv.lastMessage?.body?.slice(0, 48)}</small>
                  </span>
                  {conv.unread ? <span className="chat-conversation__badge">{conv.unread}</span> : null}
                </Link>
              </li>
            ))}
            {!loading && !conversations.length ? (
              <p className="page-status">Connect with creators to start chatting.</p>
            ) : null}
          </ul>
        </aside>

        <div className="chat-thread">
          {userId ? (
            <>
              <div className="chat-thread__head">
                <h2>{activeUser?.name ?? 'Chat'}</h2>
                <Link to={`/creators/${userId}`} className="btn btn--ghost">View profile</Link>
              </div>
              <div className="chat-thread__messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${msg.senderId === user?.id ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}
                  >
                    <p>{msg.body}</p>
                    <time>{new Date(msg.createdAt).toLocaleString()}</time>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="chat-thread__form" onSubmit={handleSend}>
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message…"
                  maxLength={1000}
                />
                <button type="submit" className="btn btn--primary" disabled={sending}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="chat-thread__empty">
              <p>Select a conversation or open a profile and tap Message.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
