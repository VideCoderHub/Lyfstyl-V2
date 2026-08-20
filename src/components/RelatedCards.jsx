import MediaCard from './MediaCard'

export default function RelatedCards({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="related">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      <div className="card-grid">
        {items.map((item) => {
          const isRecipe = Boolean(item.time)
          const to = isRecipe ? `/recipes/${item.id}` : `/moves/${item.id}`
          return (
            <MediaCard
              key={item.id}
              to={to}
              image={item.image}
              tag={isRecipe ? 'Recipe' : 'Move'}
              tagClass={isRecipe ? 'tag--coral' : 'tag--lime'}
              title={item.title}
              meta={isRecipe ? `${item.time} · ${item.level}` : `${item.style} · ${item.length}`}
              portrait={!isRecipe}
              play={!isRecipe}
            />
          )
        })}
      </div>
    </section>
  )
}
