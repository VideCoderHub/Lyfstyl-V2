import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ContentViewToggle from '../components/ContentViewToggle'
import MediaCard from '../components/MediaCard'
import PageHero, { PageCta } from '../components/PageHero'
import FilterChips, { useFilteredFetch } from '../components/SearchBar'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useContentViewStyle, viewGridClass, viewWrapClass } from '../hooks/useContentViewStyle'

export default function MovesPage() {
  const [searchParams] = useSearchParams()
  const community = searchParams.get('community')
  const { isAuthenticated } = useAuth()
  const [view, setView] = useContentViewStyle('moves')
  const { active, onChange, items, loading, error, reload } = useFilteredFetch(
    (params) => api.getMoves(community ? { ...params, community } : params),
  )

  useEffect(() => {
    reload()
  }, [isAuthenticated, community])

  const portrait = view !== 'list'

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Moves"
        title="Clips that hit different"
        lede="Freestyle, hip-hop, house, battle, and social dance communities — watch, save, and enter challenges."
        actions={
          <Link className="btn btn--primary" to="/challenges">
            Join a dance challenge
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="content-toolbar">
          <FilterChips page="moves" active={active} onChange={onChange} />
          <ContentViewToggle value={view} onChange={setView} />
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {loading ? <CardGridSkeleton count={6} portrait /> : null}

        {!loading ? (
          <div className={viewWrapClass(view)}>
            <div className={viewGridClass(view, { portrait })}>
              {items.map((move) => (
                <MediaCard
                  key={move.id}
                  variant={view}
                  to={`/moves/${move.id}`}
                  image={move.image}
                  tag="Move"
                  tagClass="tag--dance"
                  title={move.title}
                  meta={`${move.style} · ${move.length} · ${move.views} views${move.communityName ? ` · ${move.communityName}` : ''}`}
                  portrait={portrait}
                  play
                  socialStats={
                    view !== 'compact'
                      ? { applause: move.applauseCount, comments: move.commentCount }
                      : undefined
                  }
                />
              ))}
            </div>
            {!items.length ? <p className="page-status">No moves match this filter.</p> : null}
          </div>
        ) : null}
      </section>

      <PageCta
        title="Drop your next move"
        text="Film a clip, tag the track, and get discovered by dancers worldwide."
        to={isAuthenticated ? '/create?type=move' : '/join'}
        label={isAuthenticated ? 'Upload a clip' : 'Create account'}
      />
    </main>
  )
}
