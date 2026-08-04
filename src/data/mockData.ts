export type HealthStatus = 'growing' | 'flat' | 'declining'

export interface Business {
  id: string
  name: string
  owner: string
  industry: string
  city: string
  country: string
  status: HealthStatus
  revenue: number
  revenueChange: number
  clients: number
  clientsChange: number
  pipeline: number
  lastActivity: string
  avatar: string
  socialFollowers: number
  socialGrowth: number
  activeCampaigns: number
  openTasks: number
  monthlyData: { month: string; revenue: number; clients: number }[]
  socialData: { platform: string; followers: number; growth: number; engagement: number }[]
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'prospect' | 'churned'
  value: number
  lastContact: string
  tags: string[]
  notes: string
}

export interface Campaign {
  id: string
  name: string
  business: string
  platform: string
  status: 'active' | 'paused' | 'completed'
  spend: number
  clicks: number
  conversions: number
  roas: number
  startDate: string
  endDate: string
}

export interface Alert {
  id: string
  type: 'warning' | 'success' | 'danger' | 'info'
  business: string
  message: string
  time: string
  read: boolean
}

export interface Prospect {
  name: string
  city: string
  value: number
  contact: string
}

export interface PipelineStage {
  id: string
  label: string
  color: string
  prospects: Prospect[]
}

const ZERO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const zeroMonthly = ZERO_MONTHS.map((month) => ({ month, revenue: 0, clients: 0 }))

export const businesses: Business[] = [
  {
    id: '60f1434e-220f-4417-98f0-5683bf3df00e',
    name: 'BuySmart Procurement Limited',
    owner: '',
    industry: 'Procurement',
    city: '',
    country: '',
    status: 'flat',
    revenue: 0,
    revenueChange: 0,
    clients: 0,
    clientsChange: 0,
    pipeline: 0,
    lastActivity: 'Awaiting data',
    avatar: 'BP',
    socialFollowers: 0,
    socialGrowth: 0,
    activeCampaigns: 0,
    openTasks: 0,
    monthlyData: zeroMonthly,
    socialData: [],
  },
  {
    id: '15e7d817-faef-4551-aa17-26053116169d',
    name: 'Goodman & Goldsmith',
    owner: '',
    industry: 'Trading',
    city: '',
    country: '',
    status: 'flat',
    revenue: 0,
    revenueChange: 0,
    clients: 0,
    clientsChange: 0,
    pipeline: 0,
    lastActivity: 'Awaiting data',
    avatar: 'GG',
    socialFollowers: 0,
    socialGrowth: 0,
    activeCampaigns: 0,
    openTasks: 0,
    monthlyData: zeroMonthly,
    socialData: [],
  },
  {
    id: 'da56fb84-ddc7-4789-9c41-011bca3492e3',
    name: 'OPES (Oguntimehin Procurement & Energy Services)',
    owner: '',
    industry: 'Procurement & Energy',
    city: '',
    country: '',
    status: 'flat',
    revenue: 0,
    revenueChange: 0,
    clients: 0,
    clientsChange: 0,
    pipeline: 0,
    lastActivity: 'Awaiting data',
    avatar: 'OP',
    socialFollowers: 0,
    socialGrowth: 0,
    activeCampaigns: 0,
    openTasks: 0,
    monthlyData: zeroMonthly,
    socialData: [],
  },
  {
    id: 'a98c48ec-06cf-4a49-a0eb-0ee279f02418',
    name: 'Export Trade',
    owner: '',
    industry: 'Export / Trade',
    city: '',
    country: '',
    status: 'flat',
    revenue: 0,
    revenueChange: 0,
    clients: 0,
    clientsChange: 0,
    pipeline: 0,
    lastActivity: 'Awaiting data',
    avatar: 'ET',
    socialFollowers: 0,
    socialGrowth: 0,
    activeCampaigns: 0,
    openTasks: 0,
    monthlyData: zeroMonthly,
    socialData: [],
  },
]

export const clients: Client[] = []

export const campaigns: Campaign[] = []

export const alerts: Alert[] = []

export const pipelineStages: PipelineStage[] = [
  {
    id: 'prospect',
    label: 'Prospect',
    color: '#6B7E99',
    prospects: [],
  },
  {
    id: 'discovery',
    label: 'Discovery Call',
    color: '#F5A623',
    prospects: [],
  },
  {
    id: 'proposal',
    label: 'Proposal Sent',
    color: '#F2E20C',
    prospects: [],
  },
  {
    id: 'negotiation',
    label: 'Negotiating',
    color: '#1EFFA8',
    prospects: [],
  },
  {
    id: 'onboarded',
    label: 'Onboarded',
    color: '#1EFFA8',
    prospects: [],
  },
]

export const formatCurrency = (value: number, currency = '₦') => {
  if (value >= 1_000_000) return `${currency}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${currency}${(value / 1_000).toFixed(0)}K`
  return `${currency}${value}`
}
