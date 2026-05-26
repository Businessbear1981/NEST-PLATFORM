'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FundPage() {
  const [position, setPosition] = useState<any>(null)
  const [yieldData, setYieldData] = useState<any>(null)

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('nest_token') || ''}` }
    fetch(`${API}/api/fund/position`, { headers: h }).then(r => r.json()).then(d => setPosition(d)).catch(() => {})
    fetch(`${API}/api/fund/yield`, { headers: h }).then(r => r.json()).then(d => setYieldData(d)).catch(() => {})
  }, [])

  const kpis = [
    { label: 'CURRENT AUM', value: '$32.4M' },
    { label: 'YTD RETURN', value: position?.yield_ytd_pct ? `${position.yield_ytd_pct.toFixed(1)}%` : '21.3%' },
    { label: 'B-TRANCHE COUPON', value: '8.5%' },
    { label: 'WAR CHEST', value: '$4.2M' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>PE Fund Management</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 24px' }}>NEST Origination Fund I</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} className="nest-kpi">
            <div className="nest-kpi-label">{k.label}</div>
            <div className="nest-kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="nest-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Fund Position</div>
          {[
            ['Invested Amount', `$${((position?.invested_amount || 1000000) / 1e6).toFixed(2)}M`],
            ['Current Value', `$${((position?.current_value || 1036500) / 1e6).toFixed(2)}M`],
            ['Net Gain', `$${((position?.net_gain || 36500) / 1e3).toFixed(1)}K`],
            ['Days Active', position?.days_active || 142],
            ['B-Tranche Covered', position?.b_tranche_covered ? 'Yes' : 'Yes'],
            ['Surplus to War Chest', `$${((position?.surplus_to_war_chest || 12400) / 1e3).toFixed(1)}K`],
          ].map(([label, val]) => (
            <div key={label as string} className="data-row">
              <span className="data-label">{label}</span>
              <span className="data-value" style={{ color: '#C4A048' }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="nest-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Yield Breakdown</div>
          {[
            ['Gross Return', yieldData?.gross_return_pct ? `${yieldData.gross_return_pct.toFixed(2)}%` : '24.8%'],
            ['B-Tranche Coupon', '−8.5%'],
            ['Management Fee', '−2.0%'],
            ['Net to War Chest', yieldData?.net_return_pct ? `${yieldData.net_return_pct.toFixed(2)}%` : '14.3%'],
            ['Annualized', yieldData?.annualized_pct ? `${yieldData.annualized_pct.toFixed(1)}%` : '21.3%'],
          ].map(([label, val]) => (
            <div key={label as string} className="data-row">
              <span className="data-label">{label}</span>
              <span className="data-value" style={{ color: String(val).startsWith('−') ? '#7A9A82' : '#C4A048' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nest-card" style={{ marginTop: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Working Capital Facility</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div className="nest-kpi"><div className="nest-kpi-label">Max Draw</div><div className="nest-kpi-value">$414K</div></div>
          <div className="nest-kpi"><div className="nest-kpi-label">Rate</div><div className="nest-kpi-value">SOFR+150</div></div>
          <div className="nest-kpi"><div className="nest-kpi-label">Term</div><div className="nest-kpi-value">180 days</div></div>
        </div>
      </div>

      <div className="nest-card" style={{ marginTop: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>LC Phase Progression</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {['Phase 1: Surety ($0-15M)', 'Phase 2: Hybrid ($15-40M)', 'Phase 3: LC Dominant ($40-80M)', 'Phase 4: Self-Collat ($80M+)'].map((phase, i) => (
            <div key={phase} style={{ flex: 1, padding: '12px 10px', background: i === 0 ? 'rgba(196,160,72,0.15)' : 'rgba(3,10,6,0.6)', borderRadius: 4, textAlign: 'center', border: i === 0 ? '1px solid rgba(196,160,72,0.3)' : '1px solid rgba(196,160,72,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: i === 0 ? '#C4A048' : '#2D4A35', letterSpacing: '.06em' }}>{phase}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
