'use client'

import { useEffect } from 'react'
import ShareButton from './ShareButton'

export default function CelebrateOverlay({ title, message, badges, shareText, onDismiss }) {
  useEffect(() => {
    if (!title) return undefined
    const timer = window.setTimeout(() => onDismiss?.(), 6000)
    return () => window.clearTimeout(timer)
  }, [title, onDismiss])

  if (!title) return null

  const badge = badges?.[0]
  const body = message ?? badge?.description ?? 'Keep creating and sharing on Lyfstyl.'

  return (
    <div className="celebrate" role="dialog" aria-live="polite" aria-label={title}>
      <div className="celebrate__backdrop" onClick={onDismiss} aria-hidden="true" />
      <div className="celebrate__confetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="celebrate__piece" style={{ '--i': i }} />
        ))}
      </div>
      <div className="celebrate__card">
        <span className="celebrate__emoji" aria-hidden="true">
          {badge ? '🏅' : '⭐'}
        </span>
        <h2>{title}</h2>
        {badge ? <p className="celebrate__badge-name">{badge.name}</p> : null}
        <p>{body}</p>
        <div className="celebrate__actions">
          {shareText ? (
            <ShareButton title={title} text={shareText} label="Share achievement" />
          ) : null}
          <button type="button" className="btn btn--primary" onClick={onDismiss}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  )
}
