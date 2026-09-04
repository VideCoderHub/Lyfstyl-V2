import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ApplauseButton({ type, id, initialCount = 0, initialApplauded = false }) {
  const { isAuthenticated, setMessage } = useAuth()
  const router = useRouter()
  const [count, setCount] = useState(initialCount)
  const [applauded, setApplauded] = useState(initialApplauded)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const data = await api.toggleApplause(type, id)
      setCount(data.applauseCount)
      setApplauded(data.applauded)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`social-action ${applauded ? 'social-action--active' : ''}`}
      disabled={loading}
      onClick={toggle}
      aria-pressed={applauded}
    >
      <span className="social-action__icon" aria-hidden="true">👏</span>
      <span>{count || 'Applaud'}</span>
    </button>
  )
}
