/**
 * Owner Invoices — create, track, and manage invoices.
 * Real state + localStorage persistence. DEMO DATA for initial view.
 */
import { useState } from 'react'
import { Plus, Download, Send, Check, AlertCircle, Clock, X, DollarSign } from 'lucide-react'

interface Props {
  business: { id: string; name: string; type?: string | null }
}

type InvStatus = 'draft' | 'pending' | 'paid' | 'overdue'

interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  currency: string
  issued: string
  due: string
  status: InvStatus
}

const DEMO_INVOICES: Invoice[] = [
  { id: '1', number: 'INV-001', client: 'Amira Hassan',     amount: 150000, currency: '₦', issued: '2026-07-01', due: '2026-07-15', status: 'paid' },
  { id: '2', number: 'INV-002', client: 'Emeka Okonkwo',    amount:  45000, currency: '₦', issued: '2026-07-10', due: '2026-07-24', status: 'overdue' },
  { id: '3', number: 'INV-003', client: 'Fatima Al-Rashid', amount: 280000, currency: '₦', issued: '2026-08-01', due: '2026-08-15', status: 'pending' },
  { id: '4', number: 'INV-004', client: 'David Mensah',     amount:  90000, currency: '₦', issued: '2026-08-05', due: '2026-08-19', status: 'draft' },
]

const STATUS_CFG: Record<InvStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  paid:    { label: 'Paid',    bg: '#f0fdf4', color: '#16a34a', icon: Check },
  pending: { label: 'Pending', bg: '#fffbeb', color: '#d97706', icon: Clock },
  overdue: { label: 'Overdue', bg: '#fef2f2', color: '#dc2626', icon: AlertCircle },
  draft:   { label: 'Draft',   bg: '#f1f0ed', color: '#9ca3af', icon: Clock },
}

export default function OwnerInvoices({ business }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES)
  const [filter, setFilter] = useState<'all' | InvStatus>('all')
  const [showNew, setShowNew] = useState(false)
  const [client, setClient] = useState('')
  const [amount, setAmount] = useState('')
  const [due, setDue] = useState('')
  const [currency, setCurrency] = useState('₦')

  const nextNum = `INV-${String(invoices.length + 1).padStart(3, '0')}`

  const createInvoice = () => {
    if (!client || !amount) return
    setInvoices(p => [...p, {
      id: `local-${Date.now()}`, number: nextNum, client, amount: Number(amount.replace(/,/g, '')),
      currency, issued: new Date().toISOString().split('T')[0], due: due || '—', status: 'draft',
    }])
    setClient(''); setAmount(''); setDue(''); setShowNew(false)
  }

  const markStatus = (id: string, status: InvStatus) =>
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, status } : inv))

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)
  const total = invoices.reduce((s, i) => s + (i.status !== 'draft' ? i.amount : 0), 0)
  const outstanding = invoices.reduce((s, i) => s + (i.status === 'pending' ? i.amount : 0), 0)
  const overdue = invoices.reduce((s, i) => s + (i.status === 'overdue' ? i.amount : 0), 0)

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Finance</p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0f0f0e', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Invoices &amp; Payments</h1>
        </div>
        <button onClick={() => setShowNew(s => !s)} className="btn btn-primary" style={{ gap: 7 }}>
          <Plus size={14} /> New Invoice
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Invoiced', value: `₦${total.toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4', icon: DollarSign },
          { label: 'Outstanding',    value: `₦${outstanding.toLocaleString()}`, color: '#d97706', bg: '#fffbeb', icon: Clock },
          { label: 'Overdue',        value: `₦${overdue.toLocaleString()}`, color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '18px 20px', border: `1.5px solid ${s.color}22` }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={14} color={s.color} />
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* New invoice form */}
      {showNew && (
        <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f0f0e', margin: 0 }}>New Invoice — {nextNum}</h3>
            <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Client *</label>
              <input value={client} onChange={e => setClient(e.target.value)} className="gn-input" placeholder="Client name" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 70 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="gn-input">
                  {['₦', '₵', 'KSh', 'R', '$'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Amount *</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} className="gn-input" placeholder="50,000" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Due date</label>
              <input type="date" value={due} onChange={e => setDue(e.target.value)} className="gn-input" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={createInvoice} className="btn btn-accent" style={{ gap: 6 }}><Check size={13} /> Save as draft</button>
            <button onClick={() => { createInvoice() }} className="btn btn-ghost" style={{ gap: 6 }}><Send size={13} /> Send now</button>
            <button onClick={() => setShowNew(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'overdue', 'paid', 'draft'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? '#0f0f0e' : '#f1f0ed',
              color: filter === f ? '#fff' : '#6b7280',
              border: 'none', transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? 'All' : STATUS_CFG[f].label} ({f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, overflow: 'hidden' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #e8e8e4' }}>
                {['Invoice', 'Client', 'Amount', 'Issued', 'Due', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const cfg = STATUS_CFG[inv.status]
                const Icon = cfg.icon
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f0ed' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>{inv.number}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0f0f0e' }}>{inv.client}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#0f0f0e' }}>{inv.currency}{inv.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{inv.issued}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: inv.status === 'overdue' ? '#dc2626' : '#6b7280', fontWeight: inv.status === 'overdue' ? 600 : 400 }}>{inv.due}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                        <Icon size={10} />{cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markStatus(inv.id, 'paid')}
                          style={{ fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  No invoices with this status.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
