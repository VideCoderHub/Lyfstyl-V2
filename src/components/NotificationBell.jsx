import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    function load() {
      api.getUnreadCount().then((data) => setUnread(data.unread ?? 0)).catch(() => {})
    }

    load()
    const timer = window.setInterval(load, 45000)
    return () => window.clearInterval(timer)
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <Link href="/notifications" className="nav__bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3a5 5 0 0 0-5 5v2.5c0 .6-.2 1.2-.6 1.7L4.5 14.5h15l-1.9-2.3c-.4-.5-.6-1.1-.6-1.7V8a5 5 0 0 0-5-5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {unread > 0 ? <span className="nav__bell-badge">{unread > 9 ? '9+' : unread}</span> : null}
    </Link>
  )
}
