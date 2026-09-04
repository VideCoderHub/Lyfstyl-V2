'use client'

import { Suspense } from 'react'
import JoinPage from '../../../views/JoinPage'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinPage />
    </Suspense>
  )
}
