import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ConnectButton({ userId, initialStatus, onStatusChange }) {
  const { isAuthenticated, setMessage } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus ?? 'none')
  const [loading, setLoading] = useState(false)

  async function sendRequest() {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await api.sendConnection(userId)
      setStatus(data.status ?? 'pending_sent')
      onStatusChange?.(data.status)
      setMessage('Connection request sent')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function acceptRequest() {
    setLoading(true)
    try {
      const data = await api.acceptConnection(userId)
      setStatus(data.status ?? 'connected')
      onStatusChange?.(data.status)
      setMessage('Connection accepted')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function declineRequest() {
    setLoading(true)
    try {
      await api.declineConnection(userId)
      setStatus('none')
      onStatusChange?.('none')
      setMessage('Request declined')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeConnection() {
    setLoading(true)
    try {
      await api.removeConnection(userId)
      setStatus('none')
      onStatusChange?.('none')
      setMessage('Connection removed')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'self') return null

  if (status === 'connected') {
    return (
      <div className="connect-actions">
        <Link href={`/messages/${userId}`} className="btn btn--primary">
          Message
        </Link>
        <button type="button" className="btn btn--outline" disabled={loading} onClick={removeConnection}>
          Connected
        </button>
      </div>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button type="button" className="btn btn--outline" disabled>
        Request sent
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="connect-actions">
        <button type="button" className="btn btn--primary" disabled={loading} onClick={acceptRequest}>
          Accept
        </button>
        <button type="button" className="btn btn--outline" disabled={loading} onClick={declineRequest}>
          Decline
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="btn btn--primary"
      disabled={loading}
      onClick={() => (isAuthenticated ? sendRequest() : router.push('/login'))}
    >
      {loading ? 'Sending…' : 'Connect'}
    </button>
  )
}
