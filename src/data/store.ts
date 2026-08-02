import { businesses as seedBusinesses, formatCurrency, type Business, type HealthStatus } from "./mockData"

const STORAGE_KEY = "gn_businesses_v2"

function load(): Business[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [...seedBusinesses]
}

function save(list: Business[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

let cache: Business[] | null = null

export function getBusinesses(): Business[] {
  if (!cache) cache = load()
  return cache
}

export function addBusiness(biz: Business): void {
  const list = getBusinesses()
  list.unshift(biz)
  save(list)
  cache = list
}

export function removeBusiness(id: string): void {
  const list = getBusinesses().filter((b) => b.id !== id)
  save(list)
  cache = list
}

export function updateBusiness(id: string, updates: Partial<Business>): void {
  const list = getBusinesses().map((b) => (b.id === id ? { ...b, ...updates } : b))
  save(list)
  cache = list
}

export function getNextId(): string {
  const list = getBusinesses()
  const maxId = list.reduce((max, b) => {
    const match = b.id.match(/^b(\d+)$/)
    const num = match ? parseInt(match[1], 10) : 0
    return num > max ? num : max
  }, 0)
  return `b${maxId + 1}`
}

export function generateMonthlyData(base: number, trend: number = 1) {
  return seedBusinesses[0].monthlyData.map((m) => ({
    month: m.month,
    revenue: 0,
    clients: 0,
  }))
}

export { type Business, type HealthStatus, formatCurrency }
