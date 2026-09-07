'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import CelebrateOverlay from '../components/CelebrateOverlay'

const CelebrateContext = createContext(null)

export function CelebrateProvider({ children }) {
  const [celebration, setCelebration] = useState(null)

  const celebrate = useCallback((payload) => {
    setCelebration(payload)
  }, [])

  const dismiss = useCallback(() => setCelebration(null), [])

  const value = useMemo(() => ({ celebrate, dismiss }), [celebrate, dismiss])

  return (
    <CelebrateContext.Provider value={value}>
      {children}
      <CelebrateOverlay {...(celebration ?? {})} onDismiss={dismiss} />
    </CelebrateContext.Provider>
  )
}

export function useCelebrate() {
  const context = useContext(CelebrateContext)
  if (!context) throw new Error('useCelebrate must be used within CelebrateProvider')
  return context
}
