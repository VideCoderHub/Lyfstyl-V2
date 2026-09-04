import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ContentViewToggle from '../components/ContentViewToggle'
import MediaCard from '../components/MediaCard'
import PageHero, { PageCta } from '../components/PageHero'
import FilterChips, { useFilteredFetch } from '../components/SearchBar'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useContentViewStyle, viewGridClass, viewWrapClass } from '../hooks/useContentViewStyle'

export default function RecipesPage() {
  const [searchParams] = useSearchParams()
  const community = searchParams.get('community')
  const { isAuthenticated } = useAuth()
  const [view, setView] = useContentViewStyle('recipes')
  const { active, onChange, items, loading, error, reload } = useFilteredFetch(
    (params) => api.getRecipes(community ? { ...params, community } : params),
  )

  useEffect(() => {
    reload()
  }, [isAuthenticated, community])

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Recipes"
        title="Dishes worth sharing"
        lede="Structured food communities — Recipes, Healthy Eating, Soul Food, Street Food, and more."
        actions={
          <Link className="btn btn--primary" href={isAuthenticated ? '/create?type=recipe' : '/join'}>
            Share a recipe
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="content-toolbar">
          <FilterChips page="recipes" active={active} onChange={onChange} />
          <ContentViewToggle value={view} onChange={setView} />
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {loading ? <CardGridSkeleton count={6} /> : null}

        {!loading ? (
          <div className={viewWrapClass(view)}>
            <div className={viewGridClass(view)}>
              {items.map((recipe) => (
                <MediaCard
                  key={recipe.id}
                  variant={view}
                  to={`/recipes/${recipe.id}`}
                  image={recipe.image}
                  tag="Recipe"
                  tagClass="tag--food"
                  title={recipe.title}
                  meta={`${recipe.time} · ${recipe.level} · ${recipe.saves} saves${recipe.communityName ? ` · ${recipe.communityName}` : ''}`}
                  socialStats={
                    view !== 'compact'
                      ? { applause: recipe.applauseCount, comments: recipe.commentCount }
                      : undefined
                  }
                />
              ))}
            </div>
            {!items.length ? <p className="page-status">No recipes match this filter.</p> : null}
          </div>
        ) : null}
      </section>

      <PageCta
        title="Got a plate to share?"
        text="Upload photos, steps, and the story behind the dish."
        label="Post your recipe"
        to={isAuthenticated ? '/create?type=recipe' : '/join'}
      />
    </main>
  )
}
