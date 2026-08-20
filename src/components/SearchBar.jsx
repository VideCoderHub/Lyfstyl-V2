import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const FILTERS = {
  discover: [
    { id: 'all', label: 'For you' },
    { id: 'recipe', label: 'Food' },
    { id: 'move', label: 'Dance' },
    { id: 'story', label: 'Stories' },
  ],
  recipes: [
    { id: 'all', label: 'Popular' },
    { id: 'quick', label: 'Quick' },
    { id: 'weekend', label: 'Weekend' },
    { id: 'street food', label: 'Street food' },
  ],
  moves: [
    { id: 'all', label: 'Trending' },
    { id: 'freestyle', label: 'Freestyle' },
    { id: 'battle', label: 'Battle' },
    { id: 'tutorials', label: 'Tutorials' },
  ],
}

export default function FilterChips({ page, active, onChange }) {
  const options = FILTERS[page] ?? []
  return (
    <div className="filter-row" aria-label="Filters">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`chip ${active === option.id ? 'chip--active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SearchBar({ placeholder = 'Search recipes, moves, communities…' }) {
  const [query, setQuery] = useState('')
  const [fuzziness, setFuzziness] = useState(0.5)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runSearch(event) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.search({ q: query.trim(), fuzziness: String(fuzziness) })
      setResults(data.results ?? [])
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="search-panel">
      <form className="search-form" onSubmit={runSearch}>
        <label className="search-form__field">
          <span className="sr-only">Search Lyfstyl</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
        </label>
        <label className="search-form__fuzz">
          <span>Fuzziness</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={fuzziness}
            onChange={(e) => setFuzziness(Number(e.target.value))}
          />
          <span>{fuzziness.toFixed(1)}</span>
        </label>
        <button type="submit" className="btn btn--primary">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error ? <p className="form-message form-message--error">{error}</p> : null}

      {results.length ? (
        <div className="search-results">
          {results.map((item) => {
            const to =
              item.detailUrl ??
              (item.kind === 'recipe'
                ? `/recipes/${item.id}`
                : item.kind === 'move'
                  ? `/moves/${item.id}`
                  : item.kind === 'story'
                    ? `/discover/${item.id}`
                    : item.kind === 'community'
                      ? `/community/${item.communitySlug}`
                      : null)
            const inner = (
              <>
                {item.image ? (
                  <div className="search-result__image" style={{ backgroundImage: `url(${item.image})` }} />
                ) : (
                  <div className="search-result__image search-result__image--empty">{item.kind}</div>
                )}
                <div>
                  <span className="tag">{item.tag || item.kind}</span>
                  <h3>{item.title}</h3>
                  <p>
                    {item.meta}
                    {item.communityName ? ` · ${item.communityName}` : ''}
                    {item.country ? ` · ${item.country}` : ''}
                  </p>
                </div>
              </>
            )
            return to ? (
              <Link key={`${item.kind}-${item.id}`} to={to} className="search-result search-result--link">
                {inner}
              </Link>
            ) : (
              <article key={`${item.kind}-${item.id}`} className="search-result">
                {inner}
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export function useFilteredFetch(fetcher, filterKey = 'filter') {
  const [active, setActive] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(filter = active) {
    setLoading(true)
    setError('')
    try {
      const params = filter === 'all' ? {} : { [filterKey]: filter }
      const data = await fetcher(params)
      setItems(data.recipes ?? data.moves ?? data.items ?? [])
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function onChange(next) {
    setActive(next)
    load(next)
  }

  useEffect(() => {
    load(active)
  }, [])

  return { active, onChange, items, loading, error, reload: () => load(active) }
}
