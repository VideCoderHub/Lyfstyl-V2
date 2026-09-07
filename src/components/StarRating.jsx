'use client'

import { useState } from 'react'

const STARS = [1, 2, 3, 4, 5]

export default function StarRating({
  value = 0,
  average = 0,
  count = 0,
  interactive = false,
  size = 'md',
  onRate,
  disabled = false,
}) {
  const [hover, setHover] = useState(0)
  const active = interactive ? hover || value || 0 : Math.round(average)

  return (
    <div className={`star-rating star-rating--${size}${interactive ? ' star-rating--interactive' : ''}`}>
      <div
        className="star-rating__stars"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={
          interactive
            ? value
              ? `Your rating: ${value} out of 5 stars`
              : 'Rate from 1 to 5 stars'
            : `${average} out of 5 stars, ${count} ratings`
        }
        onMouseLeave={() => interactive && setHover(0)}
      >
        {STARS.map((star) => {
          const filled = star <= active
          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                className={`star-rating__star${filled ? ' star-rating__star--filled' : ''}`}
                onClick={() => !disabled && onRate?.(star)}
                onMouseEnter={() => !disabled && setHover(star)}
                disabled={disabled}
                role="radio"
                aria-checked={value === star}
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
              >
                ★
              </button>
            )
          }
          return (
            <span
              key={star}
              className={`star-rating__star${filled ? ' star-rating__star--filled' : ''}`}
              aria-hidden="true"
            >
              ★
            </span>
          )
        })}
      </div>
      {count > 0 ? (
        <span className="star-rating__meta">
          {average.toFixed(1)} · {count} {count === 1 ? 'rating' : 'ratings'}
        </span>
      ) : interactive ? (
        <span className="star-rating__meta star-rating__meta--hint">Tap to rate</span>
      ) : null}
    </div>
  )
}
