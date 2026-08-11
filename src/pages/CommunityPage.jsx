import { Link } from 'react-router-dom'
import PageHero, { PageCta } from '../components/PageHero'
import { COMMUNITY, STATS } from '../data'

export default function CommunityPage() {
  return (
    <main className="subpage">
      <PageHero
        eyebrow="Community"
        title="Creators who cook and move"
        lede="Meet the people behind the plates and the cyphers — then join the conversation."
        actions={
          <>
            <Link className="btn btn--primary" to="/join">
              Create free account
            </Link>
            <Link className="btn btn--outline" to="/discover">
              Explore first
            </Link>
          </>
        }
      />

      <section className="stats stats--flush" aria-label="Community stats">
        <div className="stats__inner">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-wrap">
        <div className="section-head">
          <h2>Featured members</h2>
          <p>A quick look at the mix of food and dance energy on Lyfstyl.</p>
        </div>

        <div className="people-grid">
          {COMMUNITY.map((person) => (
            <article key={person.name} className="person-card">
              <img src={person.avatar} alt="" />
              <div>
                <h3>{person.name}</h3>
                <p className="person-card__role">{person.role}</p>
                <p>{person.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title="Your seat at the table is open"
        text="Follow creators, post your first recipe or clip, and jump into Challenges."
        label="Join Now — it's free"
        to="/join"
      />
    </main>
  )
}
