import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [badges, setBadges] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await api.me()
      setUser(data.user)
      setBadges(data.badges ?? [])
      setCommunities(data.communities ?? [])
    } catch {
      setUser(null)
      setBadges([])
      setCommunities([])
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('lyfstyl_token')) refresh()
    else setLoading(false)
  }, [refresh])

  const login = useCallback(async (payload) => {
    const data = await api.login(payload)
    setToken(data.token)
    setUser(data.user)
    setBadges(data.badges ?? [])
    setMessage('Welcome back!')
    await refresh()
    return data
  }, [refresh])

  const register = useCallback(async (payload) => {
    const data = await api.register(payload)
    setToken(data.token)
    setUser(data.user)
    setBadges(data.badges ?? [])
    setMessage(data.message ?? 'Account created.')
    await refresh()
    return data
  }, [refresh])

  const socialLogin = useCallback(async (provider, profile) => {
    const data = await api.socialLogin({ provider, ...profile })
    setToken(data.token)
    setUser(data.user)
    setBadges(data.badges ?? [])
    setMessage(data.message ?? `Signed in with ${provider}.`)
    await refresh()
    return data
  }, [refresh])

  const completeOnboarding = useCallback(async (payload) => {
    const data = await api.completeOnboarding(payload)
    setUser(data.user)
    setBadges(data.badges ?? [])
    setMessage('Profile personalized. Your feed is ready.')
    await refresh()
    return data
  }, [refresh])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setBadges([])
    setCommunities([])
    setMessage('Signed out.')
  }, [])

  const value = useMemo(
    () => ({
      user,
      badges,
      communities,
      loading,
      message,
      setMessage,
      login,
      register,
      socialLogin,
      completeOnboarding,
      logout,
      refresh,
      isAuthenticated: Boolean(user),
    }),
    [user, badges, communities, loading, message, login, register, socialLogin, completeOnboarding, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
