import { Link } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import { MOVES } from '../data'

export default function MovesPage() {
  return (
    <main className="subpage">
      <PageHero
        eyebrow="Moves"
        title="Clips that hit different"
        lede="Short dance drops, kitchen freestyles, and battle moments made for the Lyfstyl feed."
        actions={
          <Link className="btn btn--primary" to="/challenges">
            Join a dance challenge
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="filter-row" aria-label="Move filters">
          <button type="button" className="chip chip--active">
            Trending
          </button>
          <button type="button" className="chip">
            Freestyle
          </button>
          <button type="button" className="chip">
            Battle
          </button>
          <button type="button" className="chip">
            Tutorials
          </button>
        </div>

        <div className="card-grid card-grid--portrait">
          {MOVES.map((move) => (
            <article key={move.title} className="media-card media-card--portrait">
              <div
                className="media-card__image"
                style={{ backgroundImage: `url(${move.image})` }}
              >
                <span className="media-card__play" aria-hidden="true" />
              </div>
              <div className="media-card__body">
                <span className="tag tag--lime">Move</span>
                <h2>{move.title}</h2>
                <p>
                  {move.style} · {move.length} · {move.views} views
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title="Drop your next move"
        text="Film a clip, tag the track, and get discovered by dancers worldwide."
        to="/challenges"
        label="Enter a challenge"
      />
    </main>
  )
}
