import Link from 'next/link'

export default function MediaCard({
  to,
  image,
  tag,
  tagClass = '',
  title,
  meta,
  portrait = false,
  play = false,
  actions,
  socialStats,
  variant = 'tiles',
}) {
  const cardClass = [
    'media-card',
    to ? 'media-card--link' : '',
    portrait ? 'media-card--portrait' : '',
    variant !== 'tiles' ? `media-card--${variant}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const imageBlock = (
    <div className="media-card__image-wrap">
      <div className="media-card__image" style={{ backgroundImage: `url(${image})` }} />
      <div className="media-card__overlay" aria-hidden="true" />
      {play ? <span className="media-card__play" aria-hidden="true" /> : null}
    </div>
  )

  const body = (
    <>
      {imageBlock}
      <div className="media-card__body">
        {tag ? <span className={`tag ${tagClass}`}>{tag}</span> : null}
        <h2>{title}</h2>
        {meta ? <p>{meta}</p> : null}
        {socialStats ? (
          <div className="media-card__social">
            {socialStats.applause != null ? <span>👏 {socialStats.applause}</span> : null}
            {socialStats.comments != null ? <span>💬 {socialStats.comments}</span> : null}
          </div>
        ) : null}
        {actions}
      </div>
    </>
  )

  if (to) {
    return (
      <Link href={to} className={cardClass}>
        {body}
      </Link>
    )
  }

  return <article className={cardClass}>{body}</article>
}
