import { useAuth } from '../context/AuthContext'

export default function UserBadgePanel() {
  const { user, badges } = useAuth()
  if (!user) return null

  return (
    <aside className="user-panel" aria-label="Your creator profile">
      <div className="user-panel__head">
        <div className="user-panel__avatar" aria-hidden="true">
          {(user.name ?? 'U').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <strong>{user.name}</strong>
          <p>
            {user.country ?? 'Global'} · {user.points ?? 0} points
          </p>
        </div>
      </div>
      {badges.length ? (
        <ul className="badge-list">
          {badges.map((badge) => (
            <li key={badge.slug} className="badge-list__item">
              <span>{badge.name}</span>
              <small>{badge.description}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="user-panel__hint">Join communities and enter challenges to earn badges.</p>
      )}
    </aside>
  )
}
