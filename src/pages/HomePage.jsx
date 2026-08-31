import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LandingActivityTicker from '../components/LandingActivityTicker'
import { PillarCard } from '../components/LandingPillars'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCountUp } from '../hooks/useCountUp'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { COMMUNITY_FEATURES, LANDING_HERO } from '../data/communities'
import { LOOP_VIDEOS } from '../data/media'

function StatItem({ value, label, active }) {
  const display = useCountUp(value, { active })
  return (
    <div className="landing-stat">
      <strong>{display}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const heroRef = useRef(null)
  const [heroOffset, setHeroOffset] = useState({ x: 0, y: 0 })
  const [stats, setStats] = useState([
    { value: '40K+', label: 'Creators' },
    { value: '18K+', label: 'Recipes' },
    { value: '12K+', label: 'Dance clips' },
    { value: '90+', label: 'Countries' },
  ])
  const [heroReady, setHeroReady] = useState(false)
  const [pillarsRef, pillarsVisible] = useScrollReveal({ threshold: 0.08 })
  const [valuesRef, valuesVisible] = useScrollReveal({ threshold: 0.2 })

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroReady(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    api.getStats().then((data) => {
      const s = data.stats
      setStats([
        { value: s.creators, label: 'Creators' },
        { value: s.recipesShared, label: 'Recipes' },
        { value: s.danceClips, label: 'Dance clips' },
        { value: s.countries, label: 'Countries' },
      ])
    }).catch(() => {})
  }, [])

  const onHeroMove = useCallback((event) => {
    const node = heroRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    setHeroOffset({ x: x * 18, y: y * 10 })
  }, [])

  function scrollToPillars(target) {
    const el = document.getElementById('landing-pillars')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (target) {
      window.setTimeout(() => {
        document.getElementById(`pillar-${target}`)?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
      }, 400)
    }
  }

  return (
    <main className="landing">
      <section
        ref={heroRef}
        className={`landing-hero ${heroReady ? 'is-ready' : ''}`}
        onMouseMove={onHeroMove}
      >
        <div
          className="landing-hero__scene"
          aria-hidden="true"
          style={{ transform: `translate3d(${heroOffset.x * 0.35}px, ${heroOffset.y * 0.35}px, 0)` }}
        >
          <div className="landing-hero__panel landing-hero__panel--left">
            <video autoPlay muted loop playsInline poster={LANDING_HERO.left}>
              <source src={LOOP_VIDEOS.kitchen} type="video/mp4" />
            </video>
            <img src={LANDING_HERO.left} alt="" className="landing-hero__fallback" />
          </div>
          <div className="landing-hero__panel landing-hero__panel--right">
            <video autoPlay muted loop playsInline poster={LANDING_HERO.right}>
              <source src={LOOP_VIDEOS.dance} type="video/mp4" />
            </video>
            <img src={LANDING_HERO.right} alt="" className="landing-hero__fallback" />
          </div>
          <div className="landing-hero__orbs">
            <span className="landing-hero__orb landing-hero__orb--brand" />
            <span className="landing-hero__orb landing-hero__orb--food" />
            <span className="landing-hero__orb landing-hero__orb--ent" />
          </div>
          <div className="landing-hero__veil" />
        </div>

        <div
          className="landing-hero__content"
          style={{ transform: `translate3d(${heroOffset.x * -0.15}px, ${heroOffset.y * -0.15}px, 0)` }}
        >
          <LandingActivityTicker />
          <h1 className="landing-hero__line landing-hero__line--1">Welcome to Lyfstyl</h1>
          <p className="landing-hero__gradient landing-hero__line landing-hero__line--2">
            Your lifestyle. Your communities. Your way.
          </p>
          <p className="landing-hero__lede landing-hero__line landing-hero__line--3">
            Join communities that inspire you. Explore. Connect. Share.
          </p>
          <div className="landing-hero__cta landing-hero__line landing-hero__line--4">
            <Link className="btn btn--brand btn--lg landing-btn-pulse" to={isAuthenticated ? '/dashboard' : '/join'}>
              {isAuthenticated ? 'Go to dashboard' : 'Join Lyfstyl!'}
            </Link>
            <button type="button" className="btn btn--outline btn--outline-light btn--lg" onClick={() => scrollToPillars()}>
              Explore Communities
            </button>
          </div>
          <div className="landing-hero__pills landing-hero__line landing-hero__line--5">
            <button type="button" className="landing-hero__pill landing-hero__pill--food" onClick={() => scrollToPillars('food')}>
              <span aria-hidden="true">🍴</span> Food
            </button>
            <button type="button" className="landing-hero__pill landing-hero__pill--ent" onClick={() => scrollToPillars('entertainment')}>
              <span aria-hidden="true">💃</span> Entertainment
            </button>
          </div>
        </div>

        <button type="button" className="landing-hero__scroll" onClick={() => scrollToPillars()} aria-label="Scroll to communities">
          <span className="landing-hero__scroll-icon" aria-hidden="true" />
        </button>
      </section>

      <section className="landing-stats landing-stats--live" aria-label="Platform stats">
        <div className="content-wrap landing-stats__inner">
          {stats.map((stat) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} active={heroReady} />
          ))}
        </div>
      </section>

      <section
        id="landing-pillars"
        ref={pillarsRef}
        className={`landing-pillars-wrap ${pillarsVisible ? 'is-visible' : ''}`}
        aria-labelledby="landing-pillars-title"
      >
        <div className="content-wrap">
          <div className="landing-pillars__head landing-reveal">
            <h2 id="landing-pillars-title">Explore Top Communities</h2>
          </div>

          <div className="landing-pillars__grid">
            <PillarCard variant="food" visible={pillarsVisible} delay={0} />
            <PillarCard variant="entertainment" visible={pillarsVisible} delay={1} />
          </div>
        </div>
      </section>

      <section
        ref={valuesRef}
        className={`landing-values ${valuesVisible ? 'is-visible' : ''}`}
        aria-label="Why Lyfstyl"
      >
        <div className="content-wrap landing-values__inner">
          {COMMUNITY_FEATURES.map((feature, index) => (
            <div
              key={feature.label}
              className={`landing-values__item landing-values__item--${feature.accent} landing-reveal`}
              style={{ '--reveal-delay': `${index * 0.08}s` }}
            >
              <span className="landing-values__icon" aria-hidden="true">{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
