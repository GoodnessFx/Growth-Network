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

const generateMonthly = (base: number, trend: number) =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
    (month, i) => ({
      month,
      revenue: Math.round(base * (1 + trend * i * 0.08) + (Math.random() - 0.5) * base * 0.1),
      clients: Math.round(12 + i * (trend > 0 ? 2.1 : -0.5) + Math.random() * 3),
    })
  )

export const businesses: Business[] = [
  {
    id: 'b1',
    name: "Kemi's Logistics",
    owner: 'Oluwakemi Adeyemi',
    industry: 'Logistics & Delivery',
    city: 'Lagos',
    country: 'Nigeria',
    status: 'growing',
    revenue: 4_820_000,
    revenueChange: 31,
    clients: 84,
    clientsChange: 18,
    pipeline: 12_400_000,
    lastActivity: '2 hours ago',
    avatar: 'KA',
    socialFollowers: 18_400,
    socialGrowth: 14,
    activeCampaigns: 3,
    openTasks: 7,
    monthlyData: generateMonthly(3_200_000, 1),
    socialData: [
      { platform: 'Instagram', followers: 9_200, growth: 22, engagement: 4.8 },
      { platform: 'Facebook', followers: 6_800, growth: 8, engagement: 2.1 },
      { platform: 'TikTok', followers: 2_400, growth: 41, engagement: 9.3 },
    ],
  },
  {
    id: 'b2',
    name: 'Abena Fashion House',
    owner: 'Abena Asante',
    industry: 'Fashion & Retail',
    city: 'Accra',
    country: 'Ghana',
    status: 'growing',
    revenue: 2_940_000,
    revenueChange: 19,
    clients: 231,
    clientsChange: 34,
    pipeline: 6_800_000,
    lastActivity: '5 hours ago',
    avatar: 'AA',
    socialFollowers: 42_100,
    socialGrowth: 28,
    activeCampaigns: 5,
    openTasks: 12,
    monthlyData: generateMonthly(2_100_000, 0.8),
    socialData: [
      { platform: 'Instagram', followers: 28_400, growth: 31, engagement: 6.2 },
      { platform: 'TikTok', followers: 11_200, growth: 47, engagement: 12.4 },
      { platform: 'YouTube', followers: 2_500, growth: 18, engagement: 3.1 },
    ],
  },
  {
    id: 'b3',
    name: 'Nairobi Taxi Co.',
    owner: 'David Mwangi',
    industry: 'Transportation',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'flat',
    revenue: 1_650_000,
    revenueChange: 2,
    clients: 1_204,
    clientsChange: 1,
    pipeline: 2_100_000,
    lastActivity: '1 day ago',
    avatar: 'DM',
    socialFollowers: 5_800,
    socialGrowth: 3,
    activeCampaigns: 1,
    openTasks: 4,
    monthlyData: generateMonthly(1_600_000, 0.05),
    socialData: [
      { platform: 'Facebook', followers: 4_100, growth: 2, engagement: 1.4 },
      { platform: 'X', followers: 1_700, growth: 5, engagement: 0.9 },
    ],
  },
  {
    id: 'b4',
    name: "Ade's Tech Repair",
    owner: 'Adebayo Okafor',
    industry: 'Electronics & Repair',
    city: 'Lagos',
    country: 'Nigeria',
    status: 'growing',
    revenue: 980_000,
    revenueChange: 44,
    clients: 362,
    clientsChange: 52,
    pipeline: 3_200_000,
    lastActivity: '30 mins ago',
    avatar: 'AO',
    socialFollowers: 12_900,
    socialGrowth: 39,
    activeCampaigns: 2,
    openTasks: 9,
    monthlyData: generateMonthly(580_000, 1.4),
    socialData: [
      { platform: 'Instagram', followers: 7_200, growth: 44, engagement: 7.8 },
      { platform: 'Facebook', followers: 5_700, growth: 31, engagement: 3.2 },
    ],
  },
  {
    id: 'b5',
    name: 'Savanna Events Co.',
    owner: 'Grace Nakato',
    industry: 'Events & Entertainment',
    city: 'Nairobi',
    country: 'Kenya',
    status: 'declining',
    revenue: 1_200_000,
    revenueChange: -18,
    clients: 42,
    clientsChange: -21,
    pipeline: 800_000,
    lastActivity: '3 days ago',
    avatar: 'GN',
    socialFollowers: 21_000,
    socialGrowth: -8,
    activeCampaigns: 0,
    openTasks: 14,
    monthlyData: generateMonthly(1_800_000, -0.6),
    socialData: [
      { platform: 'Instagram', followers: 14_800, growth: -6, engagement: 2.2 },
      { platform: 'Facebook', followers: 6_200, growth: -12, engagement: 1.1 },
    ],
  },
  {
    id: 'b6',
    name: 'Amara Beauty Studio',
    owner: 'Amara Diallo',
    industry: 'Beauty & Wellness',
    city: 'Abuja',
    country: 'Nigeria',
    status: 'growing',
    revenue: 720_000,
    revenueChange: 67,
    clients: 189,
    clientsChange: 71,
    pipeline: 2_800_000,
    lastActivity: '1 hour ago',
    avatar: 'AD',
    socialFollowers: 31_400,
    socialGrowth: 58,
    activeCampaigns: 4,
    openTasks: 6,
    monthlyData: generateMonthly(380_000, 1.8),
    socialData: [
      { platform: 'Instagram', followers: 22_400, growth: 64, engagement: 9.1 },
      { platform: 'TikTok', followers: 8_100, growth: 82, engagement: 14.2 },
      { platform: 'YouTube', followers: 900, growth: 29, engagement: 4.4 },
    ],
  },
  {
    id: 'b7',
    name: 'CoLab Digital Agency',
    owner: 'Sipho Ndlovu',
    industry: 'Digital Marketing',
    city: 'Cape Town',
    country: 'South Africa',
    status: 'growing',
    revenue: 3_410_000,
    revenueChange: 23,
    clients: 58,
    clientsChange: 16,
    pipeline: 9_600_000,
    lastActivity: '4 hours ago',
    avatar: 'SN',
    socialFollowers: 8_600,
    socialGrowth: 11,
    activeCampaigns: 7,
    openTasks: 21,
    monthlyData: generateMonthly(2_400_000, 0.9),
    socialData: [
      { platform: 'LinkedIn', followers: 4_800, growth: 18, engagement: 5.6 },
      { platform: 'X', followers: 2_400, growth: 9, engagement: 2.3 },
      { platform: 'Instagram', followers: 1_400, growth: 7, engagement: 3.1 },
    ],
  },
  {
    id: 'b8',
    name: 'Mama Fresh Foods',
    owner: 'Yaa Mensah',
    industry: 'Food & Catering',
    city: 'Kumasi',
    country: 'Ghana',
    status: 'flat',
    revenue: 540_000,
    revenueChange: 4,
    clients: 94,
    clientsChange: 3,
    pipeline: 1_100_000,
    lastActivity: '2 days ago',
    avatar: 'YM',
    socialFollowers: 4_200,
    socialGrowth: 6,
    activeCampaigns: 1,
    openTasks: 3,
    monthlyData: generateMonthly(510_000, 0.08),
    socialData: [
      { platform: 'Facebook', followers: 3_100, growth: 4, engagement: 2.8 },
      { platform: 'Instagram', followers: 1_100, growth: 11, engagement: 5.2 },
    ],
  },
]

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Emeka Obi',
    email: 'emeka.obi@swiftship.ng',
    phone: '+234 802 441 7823',
    company: 'SwiftShip Ltd',
    status: 'active',
    value: 840_000,
    lastContact: '2026-07-28',
    tags: ['VIP', 'Logistics', 'Annual'],
    notes: 'Renewing contract in August. Interested in fleet tracking upgrade.',
  },
  {
    id: 'c2',
    name: 'Fatima Bello',
    email: 'f.bello@zara-wholesale.com',
    phone: '+234 811 209 3341',
    company: 'Zara Wholesale',
    status: 'active',
    value: 490_000,
    lastContact: '2026-07-25',
    tags: ['Wholesale', 'Retail'],
    notes: 'Monthly delivery contract. Looking to expand to Ibadan.',
  },
  {
    id: 'c3',
    name: 'Kofi Mensah',
    email: 'kofi@buildright.gh',
    phone: '+233 24 882 4411',
    company: 'BuildRight Construction',
    status: 'prospect',
    value: 220_000,
    lastContact: '2026-07-20',
    tags: ['Prospect', 'Construction'],
    notes: 'Quoted for equipment haulage. Follow up after site visit.',
  },
  {
    id: 'c4',
    name: 'Aisha Traore',
    email: 'aisha@sahelmed.ml',
    phone: '+223 76 234 891',
    company: 'Sahel Medics',
    status: 'churned',
    value: 0,
    lastContact: '2026-06-01',
    tags: ['Churned', 'Healthcare'],
    notes: 'Switched to in-house fleet. Worth re-engaging Q4.',
  },
]

export const campaigns: Campaign[] = [
  {
    id: 'cam1',
    name: 'Eid Flash Sale',
    business: "Kemi's Logistics",
    platform: 'Meta',
    status: 'active',
    spend: 180_000,
    clicks: 12_400,
    conversions: 284,
    roas: 4.8,
    startDate: '2026-07-15',
    endDate: '2026-08-01',
  },
  {
    id: 'cam2',
    name: 'Back to School Promo',
    business: 'Abena Fashion House',
    platform: 'TikTok',
    status: 'active',
    spend: 95_000,
    clicks: 31_800,
    conversions: 1_142,
    roas: 7.2,
    startDate: '2026-07-01',
    endDate: '2026-08-15',
  },
  {
    id: 'cam3',
    name: 'Q3 Brand Awareness',
    business: 'CoLab Digital Agency',
    platform: 'LinkedIn',
    status: 'active',
    spend: 320_000,
    clicks: 4_200,
    conversions: 68,
    roas: 3.1,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  },
  {
    id: 'cam4',
    name: 'Glow Up July',
    business: 'Amara Beauty Studio',
    platform: 'Instagram',
    status: 'active',
    spend: 62_000,
    clicks: 18_900,
    conversions: 623,
    roas: 9.4,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
  },
  {
    id: 'cam5',
    name: 'App Download Push',
    business: 'Nairobi Taxi Co.',
    platform: 'Meta',
    status: 'paused',
    spend: 44_000,
    clicks: 2_100,
    conversions: 189,
    roas: 2.1,
    startDate: '2026-06-10',
    endDate: '2026-07-30',
  },
]

export const alerts: Alert[] = [
  {
    id: 'a1',
    type: 'danger',
    business: 'Savanna Events Co.',
    message: 'Revenue dropped 18% MoM — 14 overdue tasks need attention.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 'a2',
    type: 'success',
    business: 'Amara Beauty Studio',
    message: 'Instagram followers crossed 22K. Campaign ROAS at 9.4×.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'a3',
    type: 'warning',
    business: 'Nairobi Taxi Co.',
    message: 'App Download campaign ROAS below target (2.1× vs 3× goal). Paused.',
    time: '1 day ago',
    read: false,
  },
  {
    id: 'a4',
    type: 'success',
    business: "Ade's Tech Repair",
    message: 'New client milestone: 362 total customers. Up 52% this quarter.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'a5',
    type: 'info',
    business: 'CoLab Digital Agency',
    message: '7 active campaigns running. Monthly review due in 3 days.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'a6',
    type: 'warning',
    business: 'Mama Fresh Foods',
    message: 'No new clients added in 12 days. Pipeline stale.',
    time: '2 days ago',
    read: true,
  },
]

export const pipelineStages = [
  {
    id: 'prospect',
    label: 'Prospect',
    color: '#6B7E99',
    prospects: [
      { name: 'BoldPrint Designs', city: 'Accra', value: 480_000, contact: 'Kweku Asare' },
      { name: 'RapidFix Auto', city: 'Lagos', value: 720_000, contact: 'Tunde Fashola' },
    ],
  },
  {
    id: 'discovery',
    label: 'Discovery Call',
    color: '#F5A623',
    prospects: [
      { name: 'SunnySide Farm', city: 'Ibadan', value: 340_000, contact: 'Bola Akin' },
      { name: 'Nexgen Pharmacy', city: 'Nairobi', value: 980_000, contact: 'Anne Njoroge' },
    ],
  },
  {
    id: 'proposal',
    label: 'Proposal Sent',
    color: '#F2E20C',
    prospects: [
      { name: 'Pearl Fashion', city: 'Kumasi', value: 210_000, contact: 'Abena Frimpong' },
    ],
  },
  {
    id: 'negotiation',
    label: 'Negotiating',
    color: '#1EFFA8',
    prospects: [
      { name: 'Atlas Freight', city: 'Cape Town', value: 2_100_000, contact: 'Sipho Khumalo' },
    ],
  },
  {
    id: 'onboarded',
    label: 'Onboarded',
    color: '#1EFFA8',
    prospects: [
      {
        name: 'Amara Beauty Studio',
        city: 'Abuja',
        value: 720_000,
        contact: 'Amara Diallo',
      },
    ],
  },
]

export const formatCurrency = (value: number, currency = '₦') => {
  if (value >= 1_000_000) return `${currency}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${currency}${(value / 1_000).toFixed(0)}K`
  return `${currency}${value}`
}
