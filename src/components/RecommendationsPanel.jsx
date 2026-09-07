'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MediaCard from './MediaCard'
import { CardGridSkeleton } from './Skeleton'
import { api } from '../api/client'

export default function RecommendationsPanel({ title = 'Picked for you', limit = 6 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getRecommendations()
      .then((data) => setItems((data.items ?? []).slice(0, limit)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [limit])

  if (loading) return <CardGridSkeleton count={3} />

  if (!items.length) {
    return <p className="page-status">Join communities to unlock AI-personalized picks.</p>
  }

  return (
    <section className="recommendations-panel">
      <div className="section-head">
        <div>
          <p className="section-eyebrow">AI Personalized</p>
          <h2>{title}</h2>
        </div>
        <Link href="/discover" className="comm-view-all">See more →</Link>
      </div>
      <div className="card-grid">
        {items.map((item) => (
          <MediaCard
            key={`${item.kind ?? 'item'}-${item.id}`}
            to={item.kind === 'recipe' ? `/recipes/${item.id}` : `/moves/${item.id}`}
            image={item.image}
            tag={item.kind === 'recipe' ? 'Recipe' : 'Move'}
            tagClass={item.kind === 'recipe' ? 'tag--food' : 'tag--dance'}
            title={item.title}
            meta={item.kind === 'recipe' ? `${item.time} · ${item.level}` : `${item.style} · ${item.length}`}
            portrait={item.kind === 'move'}
            play={item.kind === 'move'}
            socialStats={{
              stars: item.starStats?.count ? item.starStats.average.toFixed(1) : undefined,
            }}
          />
        ))}
      </div>
    </section>
  )
}
