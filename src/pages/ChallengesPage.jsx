import { Link } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import { CHALLENGES } from '../data'

export default function ChallengesPage() {
  return (
    <main className="subpage">
      <PageHero
        eyebrow="Challenges"
        title="Cook-offs, battles, weekly drops"
        lede="Compete for features, badges, and creator funds — alone or as a food × dance duo."
        actions={
          <Link className="btn btn--primary" to="/join">
            Join to enter
          </Link>
        }
      />

      <section className="content-wrap">
        <div className="challenge-list">
          {CHALLENGES.map((item) => (
            <article key={item.title} className={`challenge-card challenge-card--${item.tone}`}>
              <div>
                <span className="tag">{item.type}</span>
                <h2>{item.title}</h2>
                <p>
                  {item.ends} · Prize: {item.prize}
                </p>
              </div>
              <button type="button" className="btn btn--primary">
                Enter
              </button>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title="New challenges every week"
        text="Set a reminder, team up with a creator, and put your flavour or footwork on the board."
        label="Create account"
        to="/join"
      />
    </main>
  )
}
