import { useEffect } from 'react'
import Link from 'next/link'
import ContentViewToggle from '../components/ContentViewToggle'
import MediaCard from '../components/MediaCard'
import PageHero, { PageCta } from '../components/PageHero'
import FilterChips, { SearchBar, useFilteredFetch } from '../components/SearchBar'
import UserBadgePanel from '../components/UserBadgePanel'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useContentViewStyle, viewGridClass, viewWrapClass } from '../hooks/useContentViewStyle'

function discoverTagClass(item) {
  if (item.kind === 'recipe') return 'tag--food'
  if (item.kind === 'move') return 'tag--dance'
  if (item.kind === 'story' || item.tag?.includes('×')) return 'tag--fusion'
  return ''
}

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth()
  const [view, setView] = useContentViewStyle('discover')
  const { active, onChange, items, loading, error, reload } = useFilteredFetch(
    (params) => api.getDiscover({ ...params, personalized: 'true' }),
    'kind',
  )

  useEffect(() => {
    reload()
  }, [isAuthenticated])

  const hasPortraitItems = items.some((item) => item.kind === 'move')

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Discover"
        title="A feed of flavour and footwork"
        lede="AI-personalized stream based on your country, language, and joined communities."
        actions={
          <>
            <Link className="btn btn--primary" to="/recipes">
              Browse recipes
            </Link>
            <Link className="btn btn--outline" to="/moves">
              Browse moves
            </Link>
          </>
        }
      />

      <section className="content-wrap content-wrap--with-panel">
        <div>
          <SearchBar />
          <div className="content-toolbar">
            <FilterChips page="discover" active={active} onChange={onChange} />
            <ContentViewToggle value={view} onChange={setView} />
          </div>

          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {loading ? <CardGridSkeleton count={6} portrait={hasPortraitItems} /> : null}

          {!loading ? (
            <div className={viewWrapClass(view)}>
              <div className={viewGridClass(view, { portrait: hasPortraitItems && view !== 'list' })}>
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    variant={view}
                    to={item.detailUrl ?? `/discover/${item.id}`}
                    image={item.image}
                    tag={item.tag}
                    tagClass={discoverTagClass(item)}
                    title={item.title}
                    meta={`${item.meta}${item.communityName ? ` · ${item.communityName}` : ''}`}
                    portrait={item.kind === 'move' && view !== 'list'}
                    play={item.kind === 'move'}
                  />
                ))}
              </div>
              {!items.length ? <p className="page-status">Nothing to discover yet. Try another filter.</p> : null}
            </div>
          ) : null}
        </div>
        <UserBadgePanel />
      </section>

      <PageCta
        title="Follow what moves you"
        text="Save creators, remix recipes, and jump into challenges from Discover."
      />
    </main>
  )
}
