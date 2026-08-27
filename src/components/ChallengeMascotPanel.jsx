import { useMemo, useState } from 'react'
import MascotCharacter from './MascotCharacter'

function challengeMascot(challenge) {
  const type = (challenge?.type ?? '').toLowerCase()
  if (type.includes('recipe') || type.includes('food') && !type.includes('dance')) return 'chef'
  if (type.includes('dance') && !type.includes('food')) return 'dancer'
  if (type.includes('×') || type.includes('fusion')) return 'duo'
  if (challenge?.submissionKind === 'move') return 'dancer'
  if (challenge?.submissionKind === 'recipe') return 'chef'
  return 'duo'
}

function challengeSpeech(challenge, phase) {
  if (phase === 'entering') {
    return challengeMascot(challenge) === 'chef'
      ? 'Fire up the stove — your cook-off entry is loading!'
      : challengeMascot(challenge) === 'dancer'
        ? 'Hit the beat — battle mode activated!'
        : 'Food and footwork — let us go!'
  }
  if (challengeMascot(challenge) === 'chef') {
    return `Welcome to ${challenge.title}! Ready to plate something legendary?`
  }
  if (challengeMascot(challenge) === 'dancer') {
    return `${challenge.title} — drop your best moves and climb the board!`
  }
  return `${challenge.title} — fuse flavour and footwork in one entry.`
}

export function challengeCategory(type) {
  const t = (type ?? '').toLowerCase()
  if (t.includes('recipe') || (t.includes('food') && !t.includes('dance') && !t.includes('×'))) return 'cooking'
  if (t.includes('dance') || t === 'live') return 'dance'
  return 'fusion'
}

export default function ChallengeMascotPanel({ challenge, phase = 'idle' }) {
  if (!challenge) return null
  const mascot = challengeMascot(challenge)
  const speech = challengeSpeech(challenge, phase)

  return (
    <div className={`challenge-mascot challenge-mascot--${phase}`}>
      <MascotCharacter type={mascot} size="md" speech={speech} />
    </div>
  )
}

export function useChallengeTabs(challenges) {
  const [tab, setTab] = useState('all')

  const filtered = useMemo(() => {
    if (tab === 'all') return challenges
    return challenges.filter((c) => challengeCategory(c.type) === tab)
  }, [challenges, tab])

  return { tab, setTab, filtered }
}

export { challengeMascot }
