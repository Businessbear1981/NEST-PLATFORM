'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LendersPage() {
  const [lenders, setLenders] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/surety/providers`).then(r => r.json()).then(d => { if (d.data) setLenders(d.data) }).catch(() => {})
  }, [])

  async function runSearch() {
    setSearching(true)
    try {
      const r = await fetch(`${API}/api/lenders-direct/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deal: { bond_face_usd: 75000000, ltv_pct: 65, dscr_stabilized: 1.7, state: 'FL', asset_type: 'senior_living' } }) })
      const d = await r.json()
      if (d.data) setSearchResult(d.data)
    } catch {} finally { setSearching(false) }
  }

  const stages = ['TARGETED', 'OUTREACH SENT', 'RESPONDED', 'TERM SHEET', 'COMMITTED', 'CLOSED']
  const typeColors: Record<string, string> = { surety_broker: '#C4A048', insurance_broker: '#7A9A82', surety_underwriter: '#60a5fa', reinsurer: '#E8C87A' }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Direct Lender Sourcing · LenderScout Agent</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>Lender Command Center</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
        {[{ l: 'LENDERS IN DATABASE', v: '800+' }, { l: 'ACTIVE PIPELINES', v: '3' }, { l: 'TERM SHEETS YTD', v: '7' }, { l: 'PLACEMENT FEES YTD', v: '$1.2M' }].map(k => (
          <div key={k.l} className="nest-kpi"><div className="nest-kpi-label">{k.l}</div><div className="nest-kpi-value">{k.v}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={runSearch} disabled={searching} className="btn-gold">{searching ? 'Searching...' : 'Run Lender Search'}</button>
        <button className="btn-outline">Add Lender Manually</button>
      </div>

      {/* Lender Database */}
      <div className="nest-card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Provider Database · {lenders.length} firms</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {lenders.map((l: any) => (
            <div key={l.id || l.name} className="nest-card-dark">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#EDE8DC', fontWeight: 400 }}>{l.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{(l.type || l.lender_type || '').replace(/_/g, ' ')}</div>
                </div>
                <span style={{ background: `rgba(${l.relationship_status === 'partner' ? '196,160,72' : '122,154,130'},0.15)`, color: l.relationship_status === 'partner' ? '#C4A048' : '#7A9A82', padding: '2px 8px', borderRadius: 3, fontSize: 8, fontFamily: 'var(--font-mono)' }}>{l.relationship_status || 'cold'}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                <span style={{ color: '#C4A048' }}>{l.typical_premium_bps || l.typical_rate_spread_bps || '—'}bps</span>
                <span style={{ color: '#7A9A82' }}>{l.turnaround_days || l.speed_to_close_days || '—'} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="nest-card">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Lender Pipeline</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {stages.map(stage => (
            <div key={stage} style={{ minWidth: 140, flex: 1, background: 'rgba(3,10,6,0.6)', border: '0.5px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>{stage}</div>
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', padding: '12px 0' }}>—</div>
            </div>
          ))}
        </div>
      </div>

      {searchResult && (
        <div className="nest-card" style={{ marginTop: 16, border: '1px solid rgba(196,160,72,0.3)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Search Results</div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{JSON.stringify(searchResult, null, 2).slice(0, 1500)}</pre>
        </div>
      )}
    </div>
  )
}
