import Link from 'next/link'

export default function CommunityHubHero({
  pillar = 'food',
  breadcrumbs = [],
  eyebrow,
  title,
  headlineAccent,
  tagline,
  lede,
  heroImage,
  features = [],
  actions,
  avatars,
}) {
  return (
    <section className={`comm-hub-hero comm-hub-hero--${pillar}`}>
      {heroImage ? (
        <div className="comm-hub-hero__media" aria-hidden="true">
          <img src={heroImage} alt="" />
          <div className="comm-hub-hero__overlay" />
        </div>
      ) : null}

      <div className="comm-hub-hero__inner content-wrap">
        {breadcrumbs.length ? (
          <nav className="comm-hub-hero__crumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {index > 0 ? <span className="comm-hub-hero__crumb-sep" aria-hidden="true">›</span> : null}
                {crumb.to ? (
                  <Link href={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        {eyebrow ? <p className="comm-hub-hero__eyebrow">{eyebrow}</p> : null}

        <h1 className="comm-hub-hero__title">
          {title}
          {headlineAccent ? (
            <>
              {' '}
              <span className="comm-hub-hero__title-accent">{headlineAccent}</span>
            </>
          ) : null}
        </h1>

        {tagline ? <p className="comm-hub-hero__tagline">{tagline}</p> : null}
        {lede ? <p className="comm-hub-hero__lede">{lede}</p> : null}

        {features.length ? (
          <ul className="comm-hub-hero__features">
            {features.map((feature) => (
              <li key={feature.title}>
                <span className="comm-hub-hero__feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {avatars ? <div className="comm-hub-hero__social">{avatars}</div> : null}

        {actions ? <div className="comm-hub-hero__actions">{actions}</div> : null}
      </div>
    </section>
  )
}

export function ComingSoonCard({ title, description, image }) {
  return (
    <article className="comm-soon-card">
      <div className="comm-soon-card__media">
        {image ? <img src={image} alt="" /> : null}
        <div className="comm-soon-card__veil" />
        <span className="comm-soon-card__badge">Coming Soon</span>
      </div>
      <div className="comm-soon-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  )
}

export function ExploreCategoryCard({ title, description, icon, to, active, comingSoon }) {
  const className = [
    'comm-explore-card',
    active ? 'is-active' : '',
    comingSoon ? 'is-soon' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span className="comm-explore-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="comm-explore-card__text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      {comingSoon ? (
        <span className="comm-explore-card__soon">Soon</span>
      ) : (
        <span className="comm-explore-card__chev" aria-hidden="true">›</span>
      )}
    </>
  )

  if (to && !comingSoon) {
    return (
      <Link href={to} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={className} aria-disabled={comingSoon ? 'true' : undefined}>
      {inner}
    </div>
  )
}
