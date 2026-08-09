import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { AuthUser } from "./api"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): AuthUser {
  const rawName = u.user_metadata?.full_name
  return {
    id: u.id,
    email: u.email ?? "",
    name: typeof rawName === "string" && rawName ? rawName : (u.email ?? "Owner"),
    role: "owner",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    const restore = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setUser(data.session?.user ? toAuthUser(data.session.user) : null)
      setLoading(false)
    }
    restore()

    // Single source of truth: every sign-in/out/token refresh flows through
    // Supabase, and this subscription keeps the app's user state in sync. No
    // custom session storage is used.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ? toAuthUser(session.user) : null)
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

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
