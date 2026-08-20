export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function CardGridSkeleton({ count = 6, portrait = false }) {
  return (
    <div className={`card-grid ${portrait ? 'card-grid--portrait' : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="media-card media-card--skeleton">
          <Skeleton className="skeleton--image" />
          <div className="media-card__body">
            <Skeleton className="skeleton--tag" />
            <Skeleton className="skeleton--title" />
            <Skeleton className="skeleton--meta" />
          </div>
        </div>
      ))}
    </div>
  )
}
