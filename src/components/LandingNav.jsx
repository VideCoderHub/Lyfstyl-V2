import { Link, NavLink } from 'react-router-dom'
import { LANDING_NAV } from '../data'

export default function LandingNav({ onNavigate }) {
  return (
    <div className="landing-nav">
      {LANDING_NAV.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) => `landing-nav__link ${isActive ? 'is-active' : ''}`}
          end={item.path === '/'}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
