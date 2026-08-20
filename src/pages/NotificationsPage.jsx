import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

function notificationLink(n) {
  if (n.meta?.href) return n.meta.href
  if (n.meta?.userId) return `/creators/${n.meta.userId}`
  if (n.meta?.entityType && n.meta?.entityId) {
    return n.meta.entityType === 'recipe' ? `/recipes/${n.meta.entityId}` : `/moves/${n.meta.entityId}`
  }
  return null
}

export default function NotificationsPage() {
  const { setMessage } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getNotifications()
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!notifications.some((n) => !n.read)) return
    api.markNotificationsRead().catch(() => {})
  }, [notifications])

  async function markAllRead() {
    try {
      await api.markNotificationsRead()
      setNotifications((list) => list.map((n) => ({ ...n, read: true })))
      setMessage('All notifications marked read')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Notifications"
        title="Your Lyfstyl updates"
        lede="Follows, connections, comments, reviews, and applause from your community."
        actions={
          notifications.some((n) => !n.read) ? (
            <button type="button" className="btn btn--outline" onClick={markAllRead}>
              Mark all read
            </button>
          ) : null
        }
      />

      <section className="content-wrap">
        {loading ? <p className="page-status">Loading…</p> : null}
        {!loading && !notifications.length ? (
          <p className="page-status">No notifications yet. Engage with creators and communities to see updates here.</p>
        ) : null}

        <ul className="notification-list">
          {notifications.map((n) => {
            const href = notificationLink(n)
            const content = (
              <>
                <div className="notification-list__head">
                  <strong>{n.title}</strong>
                  {!n.read ? <span className="notification-list__dot" aria-label="Unread" /> : null}
                </div>
                <p>{n.body}</p>
                <time dateTime={n.createdAt}>
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </>
            )

            return (
              <li key={n.id} className={`notification-list__item ${n.read ? '' : 'is-unread'}`}>
                {href ? <Link to={href}>{content}</Link> : content}
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
