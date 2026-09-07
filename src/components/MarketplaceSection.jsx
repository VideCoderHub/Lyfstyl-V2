export default function MarketplaceSection({ listings = [] }) {
  if (!listings.length) return null

  return (
    <section className="marketplace-section" id="marketplace">
      <div className="section-head comm-section-head">
        <div>
          <p className="section-eyebrow">Community marketplace</p>
          <h2>Shop inside this community</h2>
        </div>
      </div>
      <div className="marketplace-grid">
        {listings.map((item) => (
          <article key={item.id} className="marketplace-card">
            <div className="marketplace-card__image" style={{ backgroundImage: `url(${item.image})` }} />
            <div className="marketplace-card__body">
              <div className="marketplace-card__meta">
                {item.verified ? <span className="tag tag--food">Verified merchant</span> : null}
                {item.featured ? <span className="tag">Featured</span> : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className="marketplace-card__price">
                {item.price ? `$${item.price} ${item.currency}` : 'Free'}
              </p>
              <button type="button" className="btn btn--outline btn--sm">View listing</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
