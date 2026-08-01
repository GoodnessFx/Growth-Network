import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type AuthUser, login as apiLogin, register as apiRegister, fetchMe, setToken, clearToken, ApiError } from "./api"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const restore = async () => {
      try {
        const { user } = await fetchMe()
        if (active) setUser(user)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) clearToken()
      } finally {
        if (active) setLoading(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await apiRegister(name, email, password)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
