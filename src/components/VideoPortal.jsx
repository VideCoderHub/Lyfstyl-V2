import { Link } from 'react-router-dom'

export default function VideoPortal({
  to,
  video,
  title,
  subtitle,
  accent = 'food',
  compact = false,
  className = '',
}) {
  return (
    <Link
      to={to}
      className={`video-portal video-portal--${accent} ${compact ? 'video-portal--compact' : ''} ${className}`.trim()}
    >
      <div className="video-portal__media">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster=""
          aria-hidden="true"
        >
          <source src={video} type="video/mp4" />
        </video>
        <div className="video-portal__overlay" />
        <span className="video-portal__play" aria-hidden="true" />
      </div>
      <div className="video-portal__copy">
        <strong>{title}</strong>
        {!compact && subtitle ? <span>{subtitle}</span> : null}
      </div>
    </Link>
  )
}
