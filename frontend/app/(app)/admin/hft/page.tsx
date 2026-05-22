'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface HFTData {
  aum_start: number
  aum_current: number
  ytd_return_pct: number
  gross_return_usd: number
  b_coupon_serviced_usd: number
  war_chest_surplus_usd: number
  effective_b_cost_pct: number
  lc_capacity_usd: number
  lc_phase: string
  monthly_returns: number[]
  strategies: { name: string; weight: number; target: number; risk: string }[]
  ma_deployment_available: number
}

export default function HFTAdmin() {
  const [data, setData] = useState<HFTData | null>(null)

  useEffect(() => {
    fetch(`${API}/api/fund/snapshot`)
      .then(r => r.json())
      .then(j => setData(j.data ?? j))
      .catch(() => {})
  }, [])

  const fmtUSD = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${n.toLocaleString()}`
  const phases: Record<string, string> = {
    phase_1: 'Surety dominant ($0-15M)',
    phase_2: 'Hybrid surety+LC ($15-40M)',
    phase_3: 'LC dominant ($40-80M)',
    phase_4: 'Self-collateralized ($80M+)',
  }

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 32 }}>HFT Fund &middot; War Chest</h1>

      {!data ? (
        <p style={{ color: '#7A9A82' }}>Loading fund data...</p>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'AUM Start', value: fmtUSD(data.aum_start) },
              { label: 'AUM Current', value: fmtUSD(data.aum_current) },
              { label: 'YTD Return', value: `${data.ytd_return_pct}%` },
              { label: 'Gross Return', value: fmtUSD(data.gross_return_usd) },
            ].map(k => (
              <div key={k.label} className="nest-kpi">
                <div className="nest-kpi-label">{k.label}</div>
                <div className="nest-kpi-value">{k.value}</div>
              </div>
            ))}
          </div>

          {/* War Chest Allocation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div className="nest-card">
              <div style={{ fontSize: 11, color: '#7A9A82', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>War Chest Allocation</div>
              <div className="data-row">
                <span className="data-label">B Coupon Serviced</span>
                <span className="data-value gold">{fmtUSD(data.b_coupon_serviced_usd)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">War Chest Surplus</span>
                <span className="data-value gold">{fmtUSD(data.war_chest_surplus_usd)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">M&A Deployment</span>
                <span className="data-value gold">{fmtUSD(data.ma_deployment_available)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Effective B Cost</span>
                <span className="data-value gold">{data.effective_b_cost_pct}%</span>
              </div>
            </div>

            <div className="nest-card">
              <div style={{ fontSize: 11, color: '#7A9A82', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>LC Phase</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: '#C4A048', marginBottom: 8 }}>
                {data.lc_phase.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ fontSize: 13, color: '#7A9A82', marginBottom: 16 }}>
                {phases[data.lc_phase] || data.lc_phase}
              </div>
              <div className="data-row">
                <span className="data-label">LC Capacity</span>
                <span className="data-value gold">{fmtUSD(data.lc_capacity_usd)}</span>
              </div>
              {/* Phase progress */}
              <div style={{ marginTop: 12 }}>
                <div style={{ background: '#030A06', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    background: '#C4A048',
                    height: '100%',
                    width: `${Math.min(100, (data.aum_current / 80e6) * 100)}%`,
                    borderRadius: 3,
                    transition: 'width 0.4s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, fontFamily: 'var(--font-mono)', color: '#2D4A35' }}>
                  <span>$0</span><span>$15M</span><span>$40M</span><span>$80M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Cards */}
          <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 16 }}>Strategy Performance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
            {data.strategies.map(s => (
              <div key={s.name} className="nest-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#7A9A82', marginBottom: 8 }}>{s.name}</div>
                <div className="gold" style={{ fontSize: 22, fontWeight: 600 }}>{(s.target * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 10, color: '#2D4A35', marginTop: 4 }}>
                  {(s.weight * 100).toFixed(0)}% weight
                </div>
                <span className={s.risk === 'low' ? 'tag-green' : s.risk === 'high' ? 'tag-red' : 'tag-gold'} style={{ marginTop: 8, display: 'inline-block' }}>
                  {s.risk}
                </span>
              </div>
            ))}
          </div>

          {/* Monthly Returns */}
          <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 16 }}>Monthly Returns</h2>
          <div className="nest-card" style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '16px 18px' }}>
            {data.monthly_returns.map((r, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: Math.max(4, Math.abs(r) * 20),
                  background: r >= 0 ? '#C4A048' : '#EF4444',
                  borderRadius: 2,
                  opacity: 0.8,
                }} />
                <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#2D4A35', marginTop: 4 }}>
                  M{i + 1}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
