import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function FollowButton({ userId, initialFollowing = false, onChange }) {
  const { isAuthenticated, setMessage } = useAuth()
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggleFollow() {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const data = following ? await api.unfollowUser(userId) : await api.followUser(userId)
      setFollowing(data.following)
      onChange?.(data.following, data.followers)
      setMessage(data.following ? 'Now following' : 'Unfollowed')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={following ? 'btn btn--outline' : 'btn btn--primary'}
      disabled={loading}
      onClick={toggleFollow}
    >
      {loading ? '…' : following ? 'Following' : 'Follow'}
    </button>
  )
}
