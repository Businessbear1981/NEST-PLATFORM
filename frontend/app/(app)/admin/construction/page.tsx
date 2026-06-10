'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function fmtM(n: number) { return n ? `$${(n / 1_000_000).toFixed(1)}M` : '—' }
function fmtPct(n: number) { return n != null ? `${Math.round(n)}%` : '—' }

export default function ConstructionPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [selectedDealId, setSelectedDealId] = useState<string>('')
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch deals list on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nest_token') : null
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`${API}/api/deals`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.deals || d.data || []
        const arr = Array.isArray(list) ? list : Object.values(list)
        setDeals(arr)
        if (arr.length > 0) setSelectedDealId(arr[0].id)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Fetch construction summary whenever selectedDealId changes
  useEffect(() => {
    if (!selectedDealId) return
    setSummaryLoading(true)
    setSummary(null)
    fetch(`${API}/api/construction/deals/${selectedDealId}/summary`)
      .then(r => r.json())
      .then(d => { if (d.success) setSummary(d.data) })
      .catch(() => {})
      .finally(() => setSummaryLoading(false))
  }, [selectedDealId])

  const card = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 } as const
  const statusColor = (s: string) => s === 'complete' ? '#2D6B3D' : s === 'in_progress' ? '#C4A048' : '#7A9A82'

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Construction Risk Management Desk</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Draw processing, budget tracking, lien monitoring, schedule management</p>

      {/* Deal Selector */}
      {!loading && deals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 10, color: '#7A9A82', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-space)' }}>Select Deal</label>
          <select
            value={selectedDealId}
            onChange={e => setSelectedDealId(e.target.value)}
            style={{ background: '#0D2218', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-space)', minWidth: 280 }}
          >
            {deals.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name || d.id}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <div style={{ color: '#7A9A82', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading deals...</div>}
      {error && <div style={{ color: '#C44048', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Error: {error}</div>}

      {summaryLoading && <div style={{ color: '#7A9A82', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading construction summary...</div>}

      {summary && (
        <>
          {/* Stats KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Budget', value: fmtM(summary.stats?.total_budget_usd) },
              { label: 'Total Spent', value: fmtM(summary.stats?.total_spent_usd) },
              { label: 'Overall Progress', value: fmtPct(summary.stats?.overall_pct) },
              { label: 'Draws Funded', value: fmtM(summary.stats?.draws_funded) },
              { label: 'Change Orders', value: fmtM(summary.stats?.change_order_total_usd) },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#C4A048', fontWeight: 700 }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          {summary.milestones?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {summary.milestones.map((m: any, i: number) => (
                  <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.08)', borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600 }}>{m.name || m.milestone_name || `Milestone ${i + 1}`}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: statusColor(m.status), background: `${statusColor(m.status)}22`, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.status || 'pending'}</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 4, background: 'rgba(196,160,72,0.1)', borderRadius: 2, marginBottom: 6 }}>
                      <div style={{ height: '100%', width: `${Math.min(m.completion_pct || 0, 100)}%`, background: '#C4A048', borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82' }}>
                      <span>Budget: <span style={{ color: '#C4A048' }}>{fmtM(m.budget_usd)}</span></span>
                      <span>Spent: <span style={{ color: '#EDE8DC' }}>{fmtM(m.spent_usd)}</span></span>
                      <span>{fmtPct(m.completion_pct)} complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draws */}
          {summary.draws?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Draw Requests ({summary.draws.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {summary.draws.map((d: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(196,160,72,0.06)', fontSize: 12 }}>
                    <span style={{ color: '#EDE8DC', fontFamily: 'var(--font-space)' }}>Draw #{d.draw_number || i + 1}</span>
                    <span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)' }}>{fmtM(d.amount_usd)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: statusColor(d.status), background: `${statusColor(d.status)}22`, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{d.status || 'pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Change Orders */}
          {summary.change_orders?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Change Orders ({summary.change_orders.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {summary.change_orders.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(196,160,72,0.06)', fontSize: 12 }}>
                    <span style={{ color: '#EDE8DC', fontFamily: 'var(--font-space)' }}>{c.description || `Change Order ${i + 1}`}</span>
                    <span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)' }}>{fmtM(c.amount_usd)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: statusColor(c.status), background: `${statusColor(c.status)}22`, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{c.status || 'pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !summaryLoading && !summary && selectedDealId && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <div style={{ color: '#7A9A82', fontSize: 14 }}>No construction data for this deal. Milestones will auto-seed on first load.</div>
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <div style={{ color: '#7A9A82', fontSize: 14 }}>No deals found. Create a deal first to track construction.</div>
        </div>
      )}
    </div>
  )
}
