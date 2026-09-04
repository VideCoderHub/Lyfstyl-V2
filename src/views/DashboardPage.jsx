import { useEffect, useState } from 'react'
import Link from 'next/link'
import MediaCard from '../components/MediaCard'
import PageHero from '../components/PageHero'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, refresh } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [])

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><Skeleton className="skeleton--hero" /></div>
      </main>
    )
  }

  const stats = dashboard?.stats ?? {}

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Your Lyfstyl"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Creator'}`}
        lede="Your points, badges, saved library, and active challenges — all in one place."
        actions={
          <>
            <Link href="/create" className="btn btn--primary">Create post</Link>
            <Link href="/discover" className="btn btn--outline">Explore feed</Link>
          </>
        }
      />

      <section className="content-wrap">
        <div className="dash-stats">
          <div className="dash-stat"><strong>{stats.points ?? 0}</strong><span>Creator points</span></div>
          <div className="dash-stat"><strong>{stats.badges ?? 0}</strong><span>Badges</span></div>
          <div className="dash-stat"><strong>{stats.communities ?? 0}</strong><span>Communities</span></div>
          <div className="dash-stat"><strong>{stats.saved ?? 0}</strong><span>Saved</span></div>
          <div className="dash-stat"><strong>{stats.challenges ?? 0}</strong><span>Challenges</span></div>
          <div className="dash-stat"><strong>{stats.posts ?? 0}</strong><span>Your posts</span></div>
        </div>

        <div className="dash-grid">
          <section className="dash-panel">
            <div className="section-head">
              <h2>Your communities</h2>
              <Link href="/community">Browse all</Link>
            </div>
            {(dashboard?.communities ?? []).length ? (
              <ul className="profile-community-list">
                {dashboard.communities.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/community/${c.slug}`}>{c.name}</Link>
                    <span>{c.vertical} · {c.memberCount} members</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-status">Join food and dance communities to unlock discussion and scoped challenges.</p>
            )}
          </section>

          <section className="dash-panel">
            <div className="section-head">
              <h2>Badges & achievements</h2>
              <p>Gamified milestones from the Lyfstyl product vision.</p>
            </div>
            <ul className="badge-list">
              {(dashboard?.badges ?? []).map((badge) => (
                <li key={badge.slug} className="badge-list__item">
                  <span>{badge.name}</span>
                  <small>{badge.description}</small>
                </li>
              ))}
              {!dashboard?.badges?.length ? (
                <p className="page-status">Join communities and enter challenges to earn your first badge.</p>
              ) : null}
            </ul>
          </section>

          <section className="dash-panel">
            <div className="section-head">
              <h2>Notifications</h2>
            </div>
            <ul className="notif-list">
              {(dashboard?.notifications ?? []).slice(0, 5).map((n) => (
                <li key={n.id} className="notif-list__item">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </li>
              ))}
              {!dashboard?.notifications?.length ? (
                <p className="page-status">No notifications yet.</p>
              ) : null}
            </ul>
          </section>
        </div>

        <div className="section-head">
          <h2>Saved library</h2>
          <p>Recipes and moves you starred or saved for later.</p>
        </div>
        <div className="card-grid">
          {(dashboard?.saved ?? []).map((item) => (
            <MediaCard
              key={`${item.kind}-${item.id}`}
              to={item.kind === 'recipe' ? `/recipes/${item.id}` : `/moves/${item.id}`}
              image={item.image}
              tag={item.kind === 'recipe' ? 'Recipe' : 'Move'}
              tagClass={item.kind === 'recipe' ? 'tag--coral' : 'tag--lime'}
              title={item.title}
              meta={item.kind === 'recipe' ? item.time : `${item.style} · ${item.length}`}
              portrait={item.kind === 'move'}
              play={item.kind === 'move'}
            />
          ))}
          {!dashboard?.saved?.length ? (
            <p className="page-status">Save recipes and moves from detail pages to build your library.</p>
          ) : null}
        </div>

        {(dashboard?.challenges ?? []).length ? (
          <>
            <div className="section-head"><h2>Your challenges</h2></div>
            <div className="challenge-list">
              {dashboard.challenges.map((c) => (
                <article key={c.id} className={`challenge-card challenge-card--${c.tone ?? 'lime'}`}>
                  <div>
                    <span className="tag">{c.type}</span>
                    <h2>
                      <Link href={`/challenges/${c.id}`} className="challenge-card__title">{c.title}</Link>
                    </h2>
                    <p className="challenge-card__points">
                      {c.hasSubmitted ? 'Submitted' : 'Entered — submit your entry'}
                      {c.status === 'closed' ? ' · Challenge closed' : ''}
                    </p>
                  </div>
                  <div className="challenge-card__actions">
                    <Link href={`/challenges/${c.id}`} className="btn btn--outline">View</Link>
                    {!c.hasSubmitted && c.status === 'active' ? (
                      <Link
                        to={`/create?challenge=${c.id}&type=${c.submissionKind === 'move' ? 'move' : 'recipe'}`}
                        className="btn btn--primary"
                      >
                        Submit
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}
