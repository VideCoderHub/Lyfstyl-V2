import { Link } from 'react-router-dom'
import { FEATURES, STATS } from '../data'
import { FEATURE_ICONS } from '../components/Icons'

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <div className="hero__panel hero__panel--food" />
          <div className="hero__panel hero__panel--dance" />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p className="hero__brand">Lyfstyl</p>
          <h1 className="hero__title">
            Where flavour meets <em>movement</em>
          </h1>
          <p className="hero__lede">
            The social space for food creators and dancers to share, challenge, and grow together.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary btn--lg" to="/join">
              Join the Community
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn--outline btn--lg" to="/discover">
              <span className="play" aria-hidden="true" />
              Watch the vibe
            </Link>
          </div>
        </div>
      </section>

      <section className="features" aria-label="Platform features">
        <div className="features__rail">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.title]
            return (
              <Link
                key={feature.title}
                to={feature.to}
                className={`feature feature--${feature.accent}`}
              >
                <div className="feature__icon">{Icon ? <Icon /> : null}</div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="stats" aria-label="Community stats">
        <div className="stats__inner">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pillars">
        <div className="pillars__intro">
          <h2>Two cultures. One feed.</h2>
          <p>Scroll recipes beside dance clips — built for creators who cook and move.</p>
        </div>
        <div className="pillars__grid">
          <Link to="/recipes" className="pillar pillar--food">
            <div className="pillar__visual" />
            <div className="pillar__copy">
              <h3>Food stories</h3>
              <p>Plate, shoot, and share recipes with the people behind every dish.</p>
            </div>
          </Link>
          <Link to="/moves" className="pillar pillar--dance">
            <div className="pillar__visual" />
            <div className="pillar__copy">
              <h3>Dance energy</h3>
              <p>Drop clips, join battles, and get discovered by a global dance crowd.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band__stamp" aria-hidden="true">
          Good food
          <br />
          Good moves
          <br />
          Great community
        </div>
        <h2>Ready to taste the rhythm?</h2>
        <p>Free to join. Built for creators who live between the kitchen and the floor.</p>
        <Link className="btn btn--primary btn--lg" to="/join">
          Sign up — it&apos;s free
        </Link>
      </section>
    </main>
  )
}
