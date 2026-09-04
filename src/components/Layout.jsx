'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FOOTER_LINKS, NAV } from '../data'
import LandingNav from './LandingNav'
import NavLinks from './NavLinks'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'

function userInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, message, setMessage, isAuthenticated } = useAuth()
  const isHome = pathname === '/'
  const isAuth = pathname === '/login' || pathname === '/join'

  const navItems = NAV.filter((item) => !item.auth || isAuthenticated)

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (isAuthenticated && (pathname === '/login' || pathname === '/join')) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, pathname, router])

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
    router.push('/')
  }

  function closeMenu() {
    setMenuOpen(false)
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
          onClick={closeMenu}
        />
      ) : null}

      <header className={`nav ${scrolled || !isHome || isAuth ? 'nav--solid' : ''} ${isHome ? 'nav--landing' : ''}`}>
        <Link className="brand" href="/" aria-label="Lyfstyl home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" />
              <path d="M12 22c2.2-6 4.4-9 6-9s3.8 3 6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 14c2.5 1.5 5.5 1.5 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand__name">
            L<span className="brand__accent">y</span>fstyl
          </span>
        </Link>

        <nav
          className={`nav__links ${menuOpen ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          {isHome ? (
            <LandingNav onNavigate={closeMenu} />
          ) : (
            <NavLinks items={navItems} onNavigate={closeMenu} />
          )}
        </nav>

        <div className="nav__actions">
          {isHome && !isAuthenticated ? (
            <>
              <Link href="/discover" className="nav__search" aria-label="Search" title="Search">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>
              <Link href="/login" className="btn btn--ghost nav__login">
                Log in
              </Link>
              <Link href="/join" className="btn btn--brand nav__join">
                Join Lyfstyl
              </Link>
            </>
          ) : isAuthenticated ? (
            <>
              <NotificationBell />
              <Link href="/create" className="btn btn--primary nav__create-btn">
                Create
              </Link>
              <Link href="/messages" className="btn btn--ghost nav__messages" title="Messages">
                Messages
              </Link>
              <Link href="/profile" className="nav__user-link" title="Your profile">
                <span className="nav__user-avatar" aria-hidden="true">
                  {userInitials(user?.name)}
                </span>
                <span className="nav__user-name">{user.name?.split(' ')[0]}</span>
              </Link>
              <button type="button" className="btn btn--ghost nav__logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost">
                Log in
              </Link>
              <Link href="/join" className="btn btn--primary">
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

      <div key={pathname} className="page-enter">
        {children}
      </div>

      <footer className="footer footer--product">
        <div className="footer__grid">
          <div>
            <Link href="/" className="brand__name">
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
                  <Link href={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__label">Food</p>
            <ul className="footer__links">
              <li><Link href="/community?tab=food">All food communities</Link></li>
              <li><Link href="/community/street-food">Street Food</Link></li>
              <li><Link href="/community/soul-food">Soul Food</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer__label">Entertainment</p>
            <ul className="footer__links">
              <li><Link href="/community?tab=entertainment">Entertainment hub</Link></li>
              <li><Link href="/community/dance">Dance</Link></li>
            </ul>
          </div>
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} Lyfstyl — From Food & Dance to the World&apos;s Lifestyle Platform</p>
      </footer>
    </div>
  )
}
