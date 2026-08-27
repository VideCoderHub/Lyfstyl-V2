import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FOOTER_LINKS, NAV } from '../data'
import { LOOP_VIDEOS } from '../data/media'
import NotificationBell from './NotificationBell'
import VideoPortal from './VideoPortal'
import { useAuth } from '../context/AuthContext'

const NAV_VIDEOS = {
  cooking: LOOP_VIDEOS.cooking,
  dance: LOOP_VIDEOS.dance,
}

function userInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, message, setMessage, isAuthenticated } = useAuth()
  const isHome = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/join'

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/join')) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen)
    return () => document.body.classList.remove('nav-open')
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(() => setMessage(''), 4500)
    return () => window.clearTimeout(timer)
  }, [message, setMessage])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="page">
      {message ? (
        <div className="toast" role="status">
          <span className="toast__icon" aria-hidden="true">✓</span>
          <span className="toast__text">{message}</span>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss notification"
            onClick={() => setMessage('')}
          >
            ×
          </button>
        </div>
      ) : null}

      {menuOpen ? (
        <button
          type="button"
          className="nav__overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header className={`nav ${scrolled || !isHome || isAuth ? 'nav--solid' : ''}`}>
        <Link className="brand" to="/" aria-label="Lyfstyl home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" />
              <path d="M12 22c2.2-6 4.4-9 6-9s3.8 3 6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 14c2.5 1.5 5.5 1.5 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand__name">Lyfstyl</span>
        </Link>

        <nav
          className={`nav__links ${menuOpen ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          {NAV.filter((item) => !item.auth || isAuthenticated).map((item) =>
            item.navVideo ? (
              <VideoPortal
                key={item.path}
                to={item.path}
                video={NAV_VIDEOS[item.navVideo]}
                title={item.label}
                accent={item.navVideo === 'dance' ? 'dance' : 'food'}
                compact
                className="nav__video-portal"
              />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                end={item.path === '/'}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="nav__actions">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link to="/create" className="btn btn--ghost nav__create">
                Create
              </Link>
              <Link to="/messages" className="btn btn--ghost nav__messages">
                Messages
              </Link>
              <Link to="/dashboard" className="btn btn--ghost">
                Dashboard
              </Link>
              <Link to="/profile" className="nav__user-link">
                <span className="nav__user-avatar" aria-hidden="true">
                  {userInitials(user?.name)}
                </span>
                {user.name?.split(' ')[0]}
              </Link>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Log in
              </Link>
              <Link to="/join" className="btn btn--primary">
                Join Now
              </Link>
            </>
          )}
          <button
            type="button"
            className={`nav__burger ${menuOpen ? 'is-active' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div key={location.pathname} className="page-enter">
        <Outlet />
      </div>

      <footer className="footer footer--product">
        <div className="footer__grid">
          <div>
            <Link to="/" className="brand__name">
              Lyfstyl
            </Link>
            <p className="footer__tagline">
              AI-powered food & dance communities. Where passions become collaboration.
            </p>
          </div>
          <div>
            <p className="footer__label">Platform</p>
            <ul className="footer__links">
              {FOOTER_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__label">Communities</p>
            <ul className="footer__links">
              <li><Link to="/community/street-food">Street Food</Link></li>
              <li><Link to="/community/hip-hop">Hip-hop</Link></li>
              <li><Link to="/community/soul-food">Soul Food</Link></li>
              <li><Link to="/community/battle">Battle</Link></li>
            </ul>
          </div>
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} Lyfstyl — From Food & Dance to the World&apos;s Lifestyle Platform</p>
      </footer>
    </div>
  )
}
