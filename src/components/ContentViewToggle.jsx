import { VIEW_STYLES } from '../hooks/useContentViewStyle'

function ViewIcon({ id }) {
  if (id === 'gallery') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (id === 'compact') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (id === 'list') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function ContentViewToggle({ value, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label="View style">
      {VIEW_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          className={`view-toggle__btn ${value === style.id ? 'is-active' : ''}`}
          title={style.title}
          aria-pressed={value === style.id}
          onClick={() => onChange(style.id)}
        >
          <ViewIcon id={style.id} />
          <span className="view-toggle__label">{style.label}</span>
        </button>
      ))}
    </div>
  )
}
