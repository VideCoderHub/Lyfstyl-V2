export function IconDiscover() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 8c-7.2 0-13 5.8-13 13 0 9.8 13 19 13 19s13-9.2 13-19c0-7.2-5.8-13-13-13z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="24" cy="21" r="4.5" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  )
}

export function IconCreate() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M16 34V18c0-4.4 3.6-8 8-8s8 3.6 8 8v16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M14 34h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 10v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M18 40c2 2 4 3 6 3s4-1 6-3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconConnect() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="30" cy="18" r="5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M10 36c1.5-5 4.8-8 8-8s6.5 3 8 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M22 36c1.5-5 4.8-8 8-8s6.5 3 8 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconChallenge() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M16 14h16v6c0 4.4-3.6 8-8 8s-8-3.6-8-8v-6z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M16 16H10c0 4 2.5 7 6 8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M32 16h6c0 4-2.5 7-6 8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 28v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 38h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export const FEATURE_ICONS = {
  Discover: IconDiscover,
  Create: IconCreate,
  Connect: IconConnect,
  Challenge: IconChallenge,
}
