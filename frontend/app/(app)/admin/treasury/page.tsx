'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

function fmtM(n: number) { return n ? `$${(n / 1_000_000).toFixed(2)}M` : '—' }
function fmtD(n: number) { return n != null ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—' }
function fmtPct(n: number) { return n != null ? `${(n * 100).toFixed(1)}%` : '—' }

export default function TreasuryPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [selectedDealId, setSelectedDealId] = useState<string>('')
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [overviewLoading, setOverviewLoading] = useState(false)
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

  // Fetch treasury overview whenever selectedDealId changes
  useEffect(() => {
    if (!selectedDealId) return
    setOverviewLoading(true)
    setOverview(null)
    fetch(`${API}/api/treasury/${selectedDealId}/overview`)
      .then(r => r.json())
      .then(d => { if (d.success) setOverview(d.data) })
      .catch(() => {})
      .finally(() => setOverviewLoading(false))
  }, [selectedDealId])

  const card = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 } as const
  const statusColor = (s: string) => s === 'active' || s === 'approved' || s === 'funded' ? '#2D6B3D' : s === 'pending' ? '#C4A048' : '#7A9A82'

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Treasury Desk</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Ramp P-card program, construction draws, soft costs, T&amp;E, 1.5% rebate</p>

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
      {overviewLoading && <div style={{ color: '#7A9A82', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading treasury overview...</div>}

      {overview && (
        <>
          {/* Top KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Budget', value: fmtM(overview.total_budget_usd ?? overview.budget_total_usd) },
              { label: 'Total Spent', value: fmtM(overview.total_spent_usd ?? overview.spent_total_usd) },
              { label: 'Remaining', value: fmtM(overview.remaining_usd ?? ((overview.total_budget_usd ?? 0) - (overview.total_spent_usd ?? 0))) },
              { label: 'Rebate Earned', value: fmtD(overview.rebate_earned_usd ?? overview.rebate_usd) },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#C4A048', fontWeight: 700 }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          {overview.cards?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Active Cards ({overview.cards.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {overview.cards.map((c: any, i: number) => (
                  <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600, marginBottom: 4 }}>{c.holder_name || c.name || `Card ${i + 1}`}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C4A048' }}>{fmtD(c.limit_usd || c.credit_limit_usd)} limit</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', marginTop: 2 }}>{c.category || c.card_type || 'P-Card'}</div>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: statusColor(c.status), background: `${statusColor(c.status)}22`, padding: '2px 6px', borderRadius: 2, marginTop: 6, display: 'inline-block', textTransform: 'uppercase' }}>{c.status || 'active'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {overview.recent_transactions?.length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Recent Transactions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {overview.recent_transactions.map((t: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(196,160,72,0.06)', fontSize: 12 }}>
                    <div>
                      <div style={{ color: '#EDE8DC', fontFamily: 'var(--font-space)' }}>{t.merchant || t.description || 'Transaction'}</div>
                      <div style={{ color: '#7A9A82', fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 2 }}>{t.category || ''} {t.date || t.created_at || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{fmtD(t.amount_usd || t.amount)}</div>
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: statusColor(t.status), background: `${statusColor(t.status)}22`, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase' }}>{t.status || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Breakdown */}
          {overview.budget_breakdown && Object.keys(overview.budget_breakdown).length > 0 && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Budget by Category</h3>
              {Object.entries(overview.budget_breakdown).map(([cat, val]: [string, any]) => {
                const budget = val?.budget_usd ?? val
                const spent = val?.spent_usd ?? 0
                const pct = budget ? Math.min((spent / budget) * 100, 100) : 0
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: '#EDE8DC', fontFamily: 'var(--font-space)', fontSize: 11 }}>{cat.replace(/_/g, ' ')}</span>
                      <span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{fmtD(spent)} / {fmtD(budget)}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(196,160,72,0.1)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#C4A048', borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Raw fallback for any extra fields */}
          {!overview.cards && !overview.recent_transactions && !overview.budget_breakdown && (
            <div style={card}>
              <pre style={{ color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {JSON.stringify(overview, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {!loading && !overviewLoading && !overview && selectedDealId && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <div style={{ color: '#7A9A82', fontSize: 14 }}>No treasury data for this deal yet.</div>
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <div style={{ color: '#7A9A82', fontSize: 14 }}>No deals found. Create a deal first to access treasury.</div>
        </div>
      )}
    </div>
  )
}
