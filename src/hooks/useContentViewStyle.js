import { useEffect, useState } from 'react'

export const VIEW_STYLES = [
  { id: 'tiles', label: 'Tiles', title: 'Standard card grid' },
  { id: 'gallery', label: 'Gallery', title: 'Large visual gallery' },
  { id: 'compact', label: 'Compact', title: 'Dense tile grid' },
  { id: 'list', label: 'List', title: 'List rows' },
]

export function useContentViewStyle(pageKey, defaultView = 'tiles') {
  const storageKey = `lyfstyl_view_${pageKey}`

  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return defaultView
    return localStorage.getItem(storageKey) || defaultView
  })

  useEffect(() => {
    localStorage.setItem(storageKey, view)
  }, [storageKey, view])

  return [view, setView]
}

export function viewGridClass(view, { portrait = false, stagger = true } = {}) {
  const classes = ['card-grid', 'content-view__grid']
  if (portrait) classes.push('card-grid--portrait')
  if (stagger) classes.push('card-grid--stagger')
  if (view !== 'tiles') classes.push(`card-grid--${view}`)
  return classes.join(' ')
}

export function viewWrapClass(view) {
  return `content-view content-view--${view}`
}
