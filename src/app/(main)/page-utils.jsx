'use client'

import { Suspense } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'

export function withProtected(PageComponent) {
  return function ProtectedPage() {
    return (
      <ProtectedRoute>
        <PageComponent />
      </ProtectedRoute>
    )
  }
}

export function withSuspense(PageComponent) {
  return function SuspensePage() {
    return (
      <Suspense fallback={null}>
        <PageComponent />
      </Suspense>
    )
  }
}

export function withProtectedSuspense(PageComponent) {
  return function ProtectedSuspensePage() {
    return (
      <ProtectedRoute>
        <Suspense fallback={null}>
          <PageComponent />
        </Suspense>
      </ProtectedRoute>
    )
  }
}
