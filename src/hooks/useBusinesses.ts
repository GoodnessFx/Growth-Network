import { useState, useEffect } from 'react'
import { fetchBusinesses, type ApiBusiness } from '../lib/api'

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<ApiBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      const res = await fetchBusinesses()
      setBusinesses(res.businesses)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { businesses, loading, error, refresh }
}
