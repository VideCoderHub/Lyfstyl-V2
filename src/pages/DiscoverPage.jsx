import { Link } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import { DISCOVER_ITEMS } from '../data'

export default function DiscoverPage() {
  return (
    <main className="subpage">
      <PageHero
        eyebrow="Discover"
        title="A feed of flavour and footwork"
        lede="Browse trending recipes, dance clips, and creator stories in one mixed stream."
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

      <section className="content-wrap">
        <div className="filter-row" aria-label="Filters">
          <button type="button" className="chip chip--active">
            For you
          </button>
          <button type="button" className="chip">
            Food
          </button>
          <button type="button" className="chip">
            Dance
          </button>
          <button type="button" className="chip">
            Stories
          </button>
        </div>

        <div className="card-grid">
          {DISCOVER_ITEMS.map((item) => (
            <article key={item.title} className="media-card">
              <div
                className="media-card__image"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="media-card__body">
                <span className="tag">{item.tag}</span>
                <h2>{item.title}</h2>
                <p>{item.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title="Follow what moves you"
        text="Save creators, remix recipes, and jump into challenges from Discover."
      />
    </main>
  )
}
