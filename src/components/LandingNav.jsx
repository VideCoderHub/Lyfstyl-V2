import ActiveLink from './ActiveLink'
import { LANDING_NAV } from '../data'

export default function LandingNav({ onNavigate }) {
  return (
    <div className="landing-nav">
      {LANDING_NAV.map((item) => (
        <ActiveLink
          key={item.label}
          href={item.path}
          className={({ isActive }) => `landing-nav__link ${isActive ? 'is-active' : ''}`}
          end={item.path === '/'}
          onClick={onNavigate}
        >
          {item.label}
        </ActiveLink>
      ))}
    </div>
  )
}
