import { useEffect, useState } from 'react'

const MESSAGES = [
  { text: 'Dance community is live — cyphers heating up', accent: 'entertainment' },
  { text: 'New recipe drop in Street Food', accent: 'food' },
  { text: 'Soul Food Sunday thread trending', accent: 'food' },
  { text: '18.9K movers in Entertainment', accent: 'entertainment' },
  { text: 'Cook-off challenge ends tonight', accent: 'food' },
]

export default function LandingActivityTicker() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhase('out')
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length)
        setPhase('in')
      }, 320)
    }, 4200)
    return () => window.clearInterval(interval)
  }, [])

  const item = MESSAGES[index]

  return (
    <div className="landing-ticker" aria-live="polite">
      <span className="landing-ticker__dot" aria-hidden="true" />
      <span className={`landing-ticker__text landing-ticker__text--${phase} landing-ticker__text--${item.accent}`}>
        {item.text}
      </span>
    </div>
  )
}
