'use client'

import { useEffect } from 'react'
import ShareButton from './ShareButton'
import MascotCharacter from './MascotCharacter'

const VARIANTS = {
  stars: { emoji: '⭐', effect: 'confetti' },
  badge: { emoji: '🏅', effect: 'confetti' },
  trophy: { emoji: '🏆', effect: 'fireworks' },
  champagne: { emoji: '🥂', effect: 'sparkle' },
  mascot: { emoji: null, effect: 'mascot' },
}

export default function CelebrateOverlay({ title, message, badges, shareText, variant = 'stars', onDismiss }) {
  useEffect(() => {
    if (!title) return undefined
    const timer = window.setTimeout(() => onDismiss?.(), 6000)
    return () => window.clearTimeout(timer)
  }, [title, onDismiss])

  if (!title) return null

  const badge = badges?.[0]
  const body = message ?? badge?.description ?? 'Keep creating and sharing on Lyfstyl.'
  const style = VARIANTS[variant] ?? VARIANTS.stars
  const emoji = style.emoji ?? (badge ? '🏅' : '⭐')

  return (
    <div className={`celebrate celebrate--${style.effect}`} role="dialog" aria-live="polite" aria-label={title}>
      <div className="celebrate__backdrop" onClick={onDismiss} aria-hidden="true" />
      {style.effect === 'confetti' || style.effect === 'fireworks' ? (
        <div className="celebrate__confetti" aria-hidden="true">
          {Array.from({ length: style.effect === 'fireworks' ? 36 : 24 }, (_, i) => (
            <span key={i} className="celebrate__piece" style={{ '--i': i }} />
          ))}
        </div>
      ) : null}
      {style.effect === 'mascot' ? (
        <div className="celebrate__mascot" aria-hidden="true">
          <MascotCharacter type="dancer" size="lg" animate />
        </div>
      ) : null}
      <div className="celebrate__card">
        {style.effect !== 'mascot' ? (
          <span className="celebrate__emoji" aria-hidden="true">{emoji}</span>
        ) : null}
        <h2>{title}</h2>
        {badge ? <p className="celebrate__badge-name">{badge.name}</p> : null}
        <p>{body}</p>
        <div className="celebrate__actions">
          {shareText ? <ShareButton title={title} text={shareText} label="Share achievement" /> : null}
          <button type="button" className="btn btn--primary" onClick={onDismiss}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  )
}
