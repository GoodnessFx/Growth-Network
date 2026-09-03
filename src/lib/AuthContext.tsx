import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { AuthUser } from "./api"

// Dummy user for local development / demo access
const DUMMY_USER: AuthUser = {
  id: "dummy-123",
  email: "admin@growthnetwork.io",
  name: "Goodness Iyamah",
  role: "owner"
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInDummy: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function toAuthUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): Promise<AuthUser> {
  const rawName = u.user_metadata?.full_name
  
  let role = "client"
  try {
    const { data } = await supabase.from('profiles').select('role').eq('id', u.id).single()
    if (data?.role) role = data.role
  } catch (err) {}

  return {
    id: u.id,
    email: u.email ?? "",
    name: typeof rawName === "string" && rawName ? rawName : (u.email ?? "User"),
    role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured (no env vars set on this host),
    // auto sign-in as the dummy operator so the app is immediately usable.
    if (!isSupabaseConfigured) {
      setUser(DUMMY_USER)
      setLoading(false)
      return
    }

    let active = true

    const restore = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      if (data.session?.user) {
        const u = await toAuthUser(data.session.user)
        if (active) setUser(u)
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    restore()

    // Single source of truth: every sign-in/out/token refresh flows through
    // Supabase, and this subscription keeps the app's user state in sync. No
    // custom session storage is used.
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (session?.user) {
        const u = await toAuthUser(session.user)
        if (active) setUser(u)
      } else {
        setUser(null)
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  const signInDummy = async () => {
    setUser(DUMMY_USER)
    setLoading(false)
  }

  const logout = async () => {
    if (user?.id === DUMMY_USER.id) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInDummy, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
