import { useEffect, useState } from 'react'

function parseStatValue(value) {
  const raw = String(value ?? '')
  const match = raw.match(/^([\d,.]+)\s*(K\+|M\+|\+)?$/i)
  if (!match) return { num: 0, suffix: raw, decimals: 0 }

  let num = parseFloat(match[1].replace(/,/g, ''))
  let suffix = match[2] ?? ''
  if (suffix.toUpperCase() === 'K') suffix = 'K+'
  if (suffix.toUpperCase() === 'M') suffix = 'M+'

  return { num, suffix, decimals: match[1].includes('.') ? 1 : 0 }
}

export function useCountUp(value, { duration = 1400, active = true } = {}) {
  const [display, setDisplay] = useState(String(value ?? ''))

  useEffect(() => {
    if (!active) {
      setDisplay(String(value ?? ''))
      return undefined
    }

    const { num, suffix, decimals } = parseStatValue(value)
    if (num === 0 && !suffix) {
      setDisplay('0')
      return undefined
    }
    if (!num) {
      setDisplay(String(value ?? ''))
      return undefined
    }

    let frame = 0
    const start = performance.now()

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      const current = num * eased
      setDisplay(`${decimals ? current.toFixed(decimals) : Math.round(current)}${suffix}`)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, active])

  return display
}
