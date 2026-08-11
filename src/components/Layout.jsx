import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV } from '../data'

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/join'

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page">
      <header className={`nav ${scrolled || !isHome || isAuth ? 'nav--solid' : ''}`}>
        <Link className="brand" to="/" aria-label="Lyfstyl home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 22c2.2-6 4.4-9 6-9s3.8 3 6 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M14 14c2.5 1.5 5.5 1.5 8 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand__name">Lyfstyl</span>
        </Link>

        <nav className={`nav__links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              end={item.path === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <Link to="/login" className="btn btn--ghost">
            Log in
          </Link>
          <Link to="/join" className="btn btn--primary">
            Join Now
          </Link>
          <button
            type="button"
            className="nav__burger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <Outlet />

      <footer className="footer">
        <Link to="/" className="brand__name">
          Lyfstyl
        </Link>
        <p>Food & dance social · MVP preview for client review</p>
      </footer>
    </div>
  )
}
