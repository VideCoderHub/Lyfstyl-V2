import { Link } from 'react-router-dom'

export default function DetailBreadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 ? <span className="breadcrumb__sep">/</span> : null}
          {item.to && index < items.length - 1 ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
