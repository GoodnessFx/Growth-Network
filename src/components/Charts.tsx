import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts'
import { formatCurrency } from '../data/mockData'

const GRID_COLOR = '#E5E7EB'
const TEXT_COLOR = '#6B7280'

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 3,
        padding: '10px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
      }}
    >
        <p style={{ color: '#6B7280', marginBottom: 4, fontSize: 11 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

interface RevenueChartProps {
  data: { month: string; revenue: number; clients: number }[]
  height?: number
}

export function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F2E20C" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F2E20C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#F2E20C" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#F2E20C' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MiniSparkline({ data, color = '#F2E20C', height = 48 }: { data: { month: string; revenue: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="revenue" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface SocialChartProps {
  data: { platform: string; followers: number; growth: number; engagement: number }[]
  height?: number
}

export function SocialChart({ data, height = 200 }: SocialChartProps) {
  const COLORS = ['#F2E20C', '#1EFFA8', '#F5A623', '#7B8FFF', '#FF3B3B', '#FF8FD4', '#A8FF78']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="platform" tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="followers" name="Followers" radius={[2, 2, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface ComparisonChartProps {
  businesses: { name: string; revenue: number; clients: number }[]
  height?: number
}

export function ComparisonChart({ businesses, height = 260 }: ComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={businesses}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
        barSize={14}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#111827', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} width={120} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" fill="#F2E20C" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface AdFunnelProps {
  spend: number
  clicks: number
  conversions: number
  height?: number
}

export function AdFunnel({ spend, clicks, conversions, height = 220 }: AdFunnelProps) {
  const data = [
    { name: 'Ad Spend', value: spend, fill: '#F5A623' },
    { name: 'Clicks', value: clicks, fill: '#F2E20C' },
    { name: 'Conversions', value: conversions, fill: '#1EFFA8' },
  ]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <FunnelChart>
        <Tooltip content={<CustomTooltip />} />
        <Funnel dataKey="value" data={data} isAnimationActive lastShapeType="rectangle">
          <LabelList
            position="center"
            fill="#111827"
            stroke="none"
            dataKey="name"
            style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700 }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

interface MultiLineProps {
  data: { month: string; [key: string]: string | number }[]
  keys: string[]
  colors?: string[]
  height?: number
}

export function MultiLineChart({ data, keys, colors, height = 220 }: MultiLineProps) {
  const defaultColors = ['#F2E20C', '#1EFFA8', '#F5A623', '#7B8FFF', '#FF3B3B']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: TEXT_COLOR, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: TEXT_COLOR }} />
        {keys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={(colors ?? defaultColors)[i % defaultColors.length]}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
