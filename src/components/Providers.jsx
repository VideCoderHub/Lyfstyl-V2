'use client'

import { AuthProvider } from '../context/AuthContext'
import { CelebrateProvider } from '../context/CelebrateContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CelebrateProvider>{children}</CelebrateProvider>
    </AuthProvider>
  )
}
