import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MascotCharacter from '../components/MascotCharacter'
import MediaCard from '../components/MediaCard'
import VideoPortal from '../components/VideoPortal'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { FEATURES } from '../data'
import { COMMUNITY_PORTALS, LOOP_VIDEOS } from '../data/media'
import { FEATURE_ICONS } from '../components/Icons'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState([
    { value: '40K+', label: 'Creators' },
    { value: '18K+', label: 'Recipes Shared' },
    { value: '12K+', label: 'Dance Clips' },
    { value: '90+', label: 'Countries' },
  ])
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    api.getStats().then((data) => {
      const s = data.stats
      setStats([
        { value: s.creators, label: 'Creators' },
        { value: s.recipesShared, label: 'Recipes Shared' },
        { value: s.danceClips, label: 'Dance Clips' },
        { value: s.countries, label: 'Countries' },
      ])
    }).catch(() => {})
    api.getRecommendations().then((data) => setRecommendations(data.items?.slice(0, 4) ?? [])).catch(() => {})
  }, [isAuthenticated])

  return (
    <main>
      <section className="hero hero--motion">
        <div className="hero__media" aria-hidden="true">
          <video className="hero__video hero__video--food" autoPlay muted loop playsInline>
            <source src={LOOP_VIDEOS.kitchen} type="video/mp4" />
          </video>
          <video className="hero__video hero__video--dance" autoPlay muted loop playsInline>
            <source src={LOOP_VIDEOS.dance} type="video/mp4" />
          </video>
          <div className="hero__panel hero__panel--food" />
          <div className="hero__panel hero__panel--dance" />
          <div className="hero__veil" />
          <div className="hero__mascots">
            <MascotCharacter type="chef" size="sm" />
            <MascotCharacter type="dancer" size="sm" />
          </div>
        </div>

        <div className="hero__content">
          <p className="hero__brand">Lyfstyl</p>
          <h1 className="hero__title">
            Where flavour meets <em>movement</em>
          </h1>
          <p className="hero__lede">
            Two worlds, one platform — tap a cooking or dance portal below and jump into structured communities.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary btn--lg" to={isAuthenticated ? '/dashboard' : '/join'}>
              {isAuthenticated ? 'Go to dashboard' : 'Join the Community'}
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn--outline btn--lg" to="/discover">
              <span className="play" aria-hidden="true" />
              Explore feed
            </Link>
          </div>
        </div>
      </section>

      <section className="portal-strip" aria-label="Community portals">
        <div className="portal-strip__inner">
          {COMMUNITY_PORTALS.map((portal) => (
            <VideoPortal key={portal.id} {...portal} />
          ))}
        </div>
      </section>

      <section className="features features--motion" aria-label="Platform features">
        <div className="features__rail">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.title]
            return (
              <Link
                key={feature.title}
                to={feature.to}
                className={`feature feature--${feature.accent}`}
              >
                {feature.mascot ? (
                  <div className="feature__mascot">
                    <MascotCharacter type={feature.mascot} size="sm" animate />
                  </div>
                ) : (
                  <div className="feature__icon">{Icon ? <Icon /> : null}</div>
                )}
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="stats stats--pulse" aria-label="Community stats">
        <div className="stats__inner">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {recommendations.length ? (
        <section className="content-wrap home-recs">
          <div className="section-head">
            <h2>Recommended for you</h2>
            <p>Personalized picks from Lyfstyl communities — food, dance, and creators near you.</p>
          </div>
          <div className="card-grid card-grid--stagger">
            {recommendations.map((item) => (
              <MediaCard
                key={`${item.id}-${item.title}`}
                to={item.time ? `/recipes/${item.id}` : `/moves/${item.id}`}
                image={item.image}
                tag={item.time ? 'Recipe' : 'Move'}
                tagClass={item.time ? 'tag--food' : 'tag--dance'}
                title={item.title}
                meta={item.time ? `${item.time} · ${item.level}` : `${item.style} · ${item.length}`}
                portrait={!item.time}
                play={!item.time}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="pillars pillars--video">
        <div className="pillars__intro">
          <h2>Food and dance — clearly separated, beautifully connected</h2>
          <p>Tap a looping preview to enter the community you want. No more guessing which battle is which.</p>
        </div>
        <div className="pillars__grid pillars__grid--video">
          {COMMUNITY_PORTALS.map((portal) => (
            <VideoPortal key={portal.id} {...portal} className="video-portal--pillar" />
          ))}
        </div>
      </section>

      <section className="cta-band cta-band--motion">
        <div className="cta-band__mascots" aria-hidden="true">
          <MascotCharacter type="duo" size="sm" />
        </div>
        <div className="cta-band__stamp" aria-hidden="true">
          Good food
          <br />
          Good moves
          <br />
          Great community
        </div>
        <h2>Ready to taste the rhythm?</h2>
        <p>Free to join. Personalized by country, language, and passions.</p>
        <Link className="btn btn--primary btn--lg" to="/join">
          Sign up — it&apos;s free
        </Link>
      </section>
    </main>
  )
}
