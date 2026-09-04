import { useState } from 'react'
import Link from 'next/link'
import { enrichSubcommunity, HOME_PILLARS } from '../data/communities'

function SubCommunityCard({ item, variant, index, visible }) {
  const inner = (
    <>
      <div className="landing-sub__media">
        <img src={item.image} alt="" loading="lazy" />
        {item.comingSoon ? (
          <span className="landing-sub__soon">
            <span className="landing-sub__soon-label">Coming Soon</span>
          </span>
        ) : null}
        {item.live ? <span className="landing-sub__live"><span /> Live</span> : null}
      </div>
      <div className="landing-sub__body">
        <div className="landing-sub__title-row">
          <span className="landing-sub__icon" aria-hidden="true">{item.icon}</span>
          <h4>{item.title}</h4>
        </div>
        <p>{item.description}</p>
        {item.membersLabel ? <span className="landing-sub__meta">{item.membersLabel}</span> : null}
        {!item.comingSoon ? (
          <span className="landing-sub__enter">Enter →</span>
        ) : null}
      </div>
    </>
  )

  const className = [
    'landing-sub',
    `landing-sub--${variant}`,
    item.comingSoon ? 'landing-sub--soon' : '',
    'landing-reveal',
    visible ? 'is-visible' : '',
  ].filter(Boolean).join(' ')

  const style = { '--reveal-delay': `${0.15 + index * 0.1}s` }

  if (item.to && !item.comingSoon) {
    return (
      <Link href={item.to} className={className} style={style}>
        {inner}
      </Link>
    )
  }

  return (
    <article className={className} style={style} aria-disabled="true">
      {inner}
    </article>
  )
}

function PillarCard({ variant, visible, delay = 0, communityMap = {} }) {
  const config = HOME_PILLARS[variant]
  const subcommunities = config.subcommunities.map((item) => enrichSubcommunity(item, communityMap))
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function onMove(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8
    setTilt({ x, y })
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <article
      id={`pillar-${variant}`}
      className={`landing-pillar landing-pillar--${variant} landing-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        '--reveal-delay': `${delay * 0.12}s`,
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="landing-pillar__top">
        <div className="landing-pillar__top-copy">
          <div className="landing-pillar__title-row">
            <span className="landing-pillar__icon" aria-hidden="true">{config.icon}</span>
            <h3>{config.title}</h3>
          </div>
          <p className="landing-pillar__lede">{config.lede}</p>
          <Link href={config.to} className={`landing-pillar__cta landing-pillar__cta--${variant}`}>
            <span>{config.cta}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="landing-pillar__top-media">
          <img src={config.image} alt="" loading="lazy" />
        </div>
      </div>

      <div className="landing-pillar__subs">
        <p className="landing-pillar__subs-label">Top sub-communities</p>
        <div className="landing-pillar__subs-grid">
          {subcommunities.map((item, index) => (
            <SubCommunityCard
              key={item.slug ?? item.id}
              item={item}
              variant={variant}
              index={index}
              visible={visible}
            />
          ))}
        </div>
        <Link href={config.to} className={`landing-pillar__foot landing-pillar__foot--${variant}`}>
          View all {variant === 'food' ? 'Food' : 'Entertainment'} communities →
        </Link>
      </div>
    </article>
  )
}

export { PillarCard, SubCommunityCard }
