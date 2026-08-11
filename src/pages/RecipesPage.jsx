import { Link } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import { RECIPES } from '../data'

export default function RecipesPage() {
  return (
    <main className="subpage">
      <PageHero
        eyebrow="Recipes"
        title="Dishes worth sharing"
        lede="Step-by-step plates from home cooks and pros — shot for the feed, cooked for real life."
        actions={
          <Link className="btn btn--primary" to="/join">
            Share a recipe
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="filter-row" aria-label="Recipe filters">
          <button type="button" className="chip chip--active">
            Popular
          </button>
          <button type="button" className="chip">
            Quick
          </button>
          <button type="button" className="chip">
            Weekend
          </button>
          <button type="button" className="chip">
            Street food
          </button>
        </div>

        <div className="card-grid">
          {RECIPES.map((recipe) => (
            <article key={recipe.title} className="media-card">
              <div
                className="media-card__image"
                style={{ backgroundImage: `url(${recipe.image})` }}
              />
              <div className="media-card__body">
                <span className="tag tag--coral">Recipe</span>
                <h2>{recipe.title}</h2>
                <p>
                  {recipe.time} · {recipe.level} · {recipe.saves} saves
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title="Got a plate to share?"
        text="Upload photos, steps, and the story behind the dish."
        label="Post your recipe"
      />
    </main>
  )
}
