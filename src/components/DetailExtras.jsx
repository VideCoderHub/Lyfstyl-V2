import Link from 'next/link'

export default function DetailBreadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 ? <span className="breadcrumb__sep">/</span> : null}
          {item.to ? (
            <Link href={item.to}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function RelatedContent({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="related">
      <h2>{title}</h2>
      <div className="related__grid">
        {items.map((item) => {
          const isRecipe = Boolean(item.time)
          const to = isRecipe ? `/recipes/${item.id}` : `/moves/${item.id}`
          return (
            <Link key={to} to={to} className="related__card">
              <div className="related__image" style={{ backgroundImage: `url(${item.image})` }} />
              <div>
                <strong>{item.title}</strong>
                <p>{isRecipe ? `${item.time} · ${item.level}` : `${item.style} · ${item.length}`}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
