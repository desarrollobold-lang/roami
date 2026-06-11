import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

/* ── Types ─────────────────────────────────────────────── */
export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  /** true when user chose "Continue as guest" without creating an account */
  guestMode: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: string | null }>
  enterGuestMode: () => void
  /** Display name — real name, email prefix, or "Viajero" in guest mode */
  displayName: string
  /** First letter of display name for avatars */
  initial: string
}

const AuthContext = createContext<AuthContextType | null>(null)

/* ── Provider ──────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(() =>
    localStorage.getItem('roami_guest') === '1'
  )

  /* ── Bootstrap: restore existing session ────────────── */
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, s: Session | null) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Actions ─────────────────────────────────────────── */
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no configurado. Ingresá las credenciales en el .env' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    localStorage.removeItem('roami_guest')
    setGuestMode(false)
    return { error: null }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) return { error: 'Supabase no configurado. Ingresá las credenciales en el .env' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) return { error: error.message }
    localStorage.removeItem('roami_guest')
    setGuestMode(false)
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem('roami_guest')
    setGuestMode(false)
    setUser(null)
    setSession(null)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Supabase no configurado.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const enterGuestMode = useCallback(() => {
    localStorage.setItem('roami_guest', '1')
    setGuestMode(true)
  }, [])

  /* ── Derived display info ────────────────────────────── */
  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? (guestMode ? 'Viajero' : 'Viajero')

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <AuthContext.Provider
      value={{
        user, session, loading, guestMode,
        signIn, signUp, signOut, signInWithGoogle, enterGuestMode,
        displayName, initial,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ── Hook ──────────────────────────────────────────────── */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Returns true when the user is authenticated (real account, not just guest) */
export function useIsAuthenticated(): boolean {
  const { user } = useAuth()
  return user !== null
}
