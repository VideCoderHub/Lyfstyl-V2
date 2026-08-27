import { NavLink } from 'react-router-dom'

function NavLinkItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          'nav__link',
          isActive ? 'is-active' : '',
          item.accent ? `nav__link--${item.accent}` : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
      end={item.path === '/'}
      onClick={onNavigate}
    >
      {item.accent ? <span className="nav__link-dot" aria-hidden="true" /> : null}
      {item.label}
    </NavLink>
  )
}

export default function NavLinks({ items, onNavigate }) {
  const groups = items.reduce((acc, item) => {
    const key = item.group ?? 'main'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const groupOrder = ['explore', 'create', 'social']
  const orderedGroups = groupOrder.filter((g) => groups[g]?.length)

  return (
    <div className="nav__groups">
      {orderedGroups.map((groupId, index) => (
        <div key={groupId} className="nav__group" data-group={groupId}>
          {index > 0 ? <span className="nav__divider" aria-hidden="true" /> : null}
          {groups[groupId].map((item) => (
            <NavLinkItem key={item.path} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </div>
  )
}
