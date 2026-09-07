import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import ApplauseButton from '../components/ApplauseButton'
import ShareButton from '../components/ShareButton'
import StarRating from '../components/StarRating'
import CommentSection from '../components/CommentSection'
import DetailBreadcrumb from '../components/DetailBreadcrumb'
import RelatedCards from '../components/RelatedCards'
import ReviewSection from '../components/ReviewSection'
import { Skeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCelebrate } from '../context/CelebrateContext'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, setMessage, refresh } = useAuth()
  const { celebrate } = useCelebrate()
  const [recipe, setRecipe] = useState(null)
  const [related, setRelated] = useState([])
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getRecipe(id)
      .then((data) => {
        setRecipe(data.recipe)
        setRelated(data.related ?? [])
        setReviewStats(data.reviewStats ?? { count: 0, average: 0 })
      })
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleSave() {
    if (!isAuthenticated) return router.push('/login')
    const data = await api.toggleSave('recipe', id)
    setRecipe((r) => ({ ...r, saved: data.saved }))
    setMessage(data.saved ? 'Saved to your library' : 'Removed from library')
  }

  async function handleRate(rating) {
    if (!isAuthenticated) return router.push('/login')
    const data = await api.starContent('recipe', id, rating)
    const earnedPoints = data.newBadges?.length || !recipe?.starred
    setRecipe((r) => ({
      ...r,
      starred: true,
      rating: data.rating,
      starStats: data.starStats ?? r.starStats,
    }))
    setMessage(
      `Rated ${rating} star${rating === 1 ? '' : 's'}${earnedPoints ? ' — +10 points' : ''}`,
    )
    if (data.newBadges?.length) {
      celebrate({
        title: 'Badge unlocked!',
        badges: data.newBadges,
        variant: 'trophy',
        shareText: `I just earned ${data.newBadges[0].name} on Lyfstyl!`,
      })
      await refresh()
    } else if (rating === 5) {
      celebrate({
        title: 'Five stars!',
        message: 'You loved this recipe — share the vibe with friends.',
        shareText: `I gave 5 stars to "${recipe.title}" on Lyfstyl`,
      })
    }
  }

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><Skeleton className="skeleton--detail" /></div>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Recipe not found.</p>
          <Link href="/recipes" className="btn btn--outline">Back to recipes</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="subpage">
      <article className="detail">
        <div className="detail__hero" style={{ backgroundImage: `url(${recipe.image})` }} />
        <div className="content-wrap detail__body">
          <DetailBreadcrumb
            items={[
              { label: 'Recipes', to: '/recipes' },
              { label: recipe.title },
            ]}
          />

          <div className="detail__head">
            <span className="tag tag--coral">Recipe</span>
            <h1>{recipe.title}</h1>
            <p className="detail__meta">
              {recipe.time} · {recipe.level} · {recipe.saves} saves
              {recipe.communityName ? ` · ${recipe.communityName}` : ''}
              {recipe.country ? ` · ${recipe.country}` : ''}
            </p>
            {recipe.creatorId ? (
              <Link href={`/creators/${recipe.creatorId}`} className="detail__creator">
                By {recipe.creatorName}
              </Link>
            ) : null}
            <p className="detail__lede">{recipe.description}</p>
            <StarRating
              value={recipe.rating ?? 0}
              average={recipe.starStats?.average ?? 0}
              count={recipe.starStats?.count ?? 0}
              interactive={isAuthenticated}
              onRate={handleRate}
            />
            <div className="detail__actions">
              <ApplauseButton
                type="recipe"
                id={id}
                initialCount={recipe.applauseCount}
                initialApplauded={recipe.applauded}
              />
              <ShareButton title={recipe.title} text={recipe.description} />
              <button type="button" className="btn btn--outline" onClick={toggleSave}>
                {recipe.saved ? 'Saved' : 'Save'}
              </button>
              {recipe.communitySlug ? (
                <Link href={`/community/${recipe.communitySlug}`} className="btn btn--ghost">
                  View community
                </Link>
              ) : null}
            </div>
          </div>

          <div className="detail__grid">
            <section>
              <h2>Ingredients</h2>
              <ul className="detail__list">
                {(recipe.ingredients ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Steps</h2>
              <ol className="detail__steps">
                {(recipe.steps ?? []).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>

          <CommentSection type="recipe" id={id} />
          <ReviewSection type="recipe" id={id} initialStats={reviewStats} />
          <RelatedCards title="More from this community" items={related} />
        </div>
      </article>
    </main>
  )
}
