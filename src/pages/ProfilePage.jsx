import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConnectButton from '../components/ConnectButton'
import PageHero from '../components/PageHero'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const AVATAR_OPTIONS = ['chef', 'dancer', 'duo', 'creator']

export default function ProfilePage() {
  const { user, refresh, setMessage } = useAuth()
  const [form, setForm] = useState({
    name: '',
    bio: '',
    country: '',
    language: '',
    avatarStyle: 'chef',
  })
  const [connections, setConnections] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name ?? '',
      bio: user.bio ?? '',
      country: user.country ?? '',
      language: user.language ?? 'en',
      avatarStyle: user.avatarStyle ?? 'chef',
    })
    api
      .getConnections()
      .then((data) => setConnections(data.connections ?? []))
      .catch(() => {})
    api
      .getMyCommunities()
      .then((data) => setCommunities(data.communities ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(form)
      await refresh()
      setMessage('Profile updated')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const accepted = connections.filter((c) => c.status === 'accepted')
  const pending = connections.filter((c) => c.status === 'pending' && c.direction === 'received')

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Your profile"
        title={user?.name ?? 'Profile'}
        lede="Manage how other creators see you on Lyfstyl."
        actions={
          <>
            <Link to="/create" className="btn btn--primary">Create post</Link>
            <Link to={`/creators/${user?.id}`} className="btn btn--outline">Public view</Link>
          </>
        }
      />

      <section className="content-wrap profile-layout">
        <form className="profile-form auth-form dash-panel" onSubmit={handleSubmit}>
          <h2>Edit profile</h2>

          <label className="field">
            <span>Display name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Bio</span>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell the community about your food or dance journey…"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Country</span>
              <input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>Language</span>
              <input
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
              />
            </label>
          </div>

          <div className="field">
            <span>Avatar style</span>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`avatar-card ${form.avatarStyle === style ? 'is-selected' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, avatarStyle: style }))}
                >
                  <strong>{style}</strong>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        <aside className="profile-side">
          <div className="dash-panel">
            <h2>Connections</h2>
            {loading ? <p className="page-status">Loading…</p> : null}
            <p className="profile-stat"><strong>{accepted.length}</strong> connected</p>

            {pending.length ? (
              <>
                <h3>Pending requests</h3>
                <ul className="profile-connect-list">
                  {pending.map((c) => (
                    <li key={c.id}>
                      <Link to={`/creators/${c.user.id}`}>{c.user.name}</Link>
                      <ConnectButton
                        userId={c.user.id}
                        initialStatus="pending_received"
                        onStatusChange={() => {
                          api.getConnections().then((data) => setConnections(data.connections ?? []))
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <Link to="/messages" className="btn btn--outline btn--block">Open messages</Link>
          </div>

          <div className="dash-panel">
            <h2>Your communities</h2>
            {communities.length ? (
              <ul className="profile-community-list">
                {communities.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/community/${c.slug}`}>{c.name}</Link>
                    <span>{c.memberCount} members</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-status">Join communities to personalize your feed.</p>
            )}
            <Link to="/community" className="btn btn--outline btn--block">Browse communities</Link>
          </div>

          <div className="dash-panel">
            <h2>Creator stats</h2>
            <p className="profile-stat"><strong>{user?.points ?? 0}</strong> creator points</p>
          </div>
        </aside>
      </section>
    </main>
  )
}
