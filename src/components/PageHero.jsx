import Link from 'next/link'

export default function PageHero({ eyebrow, title, lede, actions }) {
  return (
    <section className="page-hero">
      <div className="page-hero__glow page-hero__glow--1" aria-hidden="true" />
      <div className="page-hero__glow page-hero__glow--2" aria-hidden="true" />
      <div className="page-hero__inner">
        {eyebrow ? <p className="page-hero__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lede ? <p className="page-hero__lede">{lede}</p> : null}
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </div>
    </section>
  )
}

export function PageCta({ title, text, to = '/join', label = 'Join the Community' }) {
  return (
    <section className="cta-band page-cta">
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="btn btn--primary btn--lg" to={to}>
        {label}
      </Link>
    </section>
  )
}
