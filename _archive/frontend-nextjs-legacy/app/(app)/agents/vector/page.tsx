'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function VectorPage() {
  const [signals, setSignals] = useState<any>(null)

  useEffect(() => {
    loadSignals()
    const interval = setInterval(loadSignals, 30000)
    return () => clearInterval(interval)
  }, [])

  function loadSignals() {
    fetch(`${API}/api/market/signals/latest`).then(r => r.json()).then(d => { if (d.data) setSignals(d.data) }).catch(() => {})
  }

  const sig = signals?.signals || {}
  const score = signals?.vector_score || 50
  const rec = signals?.vector_recommendation || 'monitor'
  const recColors: Record<string, string> = { execute_call: '#C4A048', call_eligible: '#2D6B3D', monitor: '#7A9A82', hold: '#2D4A35', put_alert: '#ef4444' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="status-dot" style={{ background: '#2D6B3D', width: 10, height: 10 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Call/Put Timing Agent</div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: 0 }}>Vector · Live Monitor</h1>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35' }}>Auto-refresh: 30s</div>
      </div>

      {/* Market Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, background: 'rgba(196,160,72,0.15)', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 6, overflow: 'hidden', marginBottom: 24 }}>
        {[
          { l: '10yr Treasury', v: `${sig.treasury_10yr_pct || 4.25}%`, change: `${sig.treasury_10yr_change_bps || -5}bps` },
          { l: 'SOFR', v: `${sig.sofr_pct || 5.33}%` },
          { l: 'IG Spread', v: `${sig.credit_spread_ig_bps || 125}bps` },
          { l: 'VIX', v: `${sig.vix || 18.5}` },
          { l: 'Refi Market', v: (sig.refi_market_access || 'open_favorable').replace(/_/g, ' ') },
        ].map(m => (
          <div key={m.l} style={{ background: '#060E1A', padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#C4A048', fontWeight: 500 }}>{m.v}</div>
            {m.change && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: parseInt(m.change) < 0 ? '#2D6B3D' : '#ef4444', marginTop: 2 }}>{m.change}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Score Circle */}
        <div className="nest-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', border: `4px solid ${score >= 70 ? '#C4A048' : score >= 50 ? '#7A9A82' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: '0 auto 20px', background: 'rgba(3,10,6,0.6)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: '#C4A048', fontWeight: 500, lineHeight: 1 }}>{score}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>Composite</div>
          </div>
          <div style={{ background: recColors[rec] || '#7A9A82', color: rec === 'execute_call' ? '#030A06' : '#EDE8DC', padding: '8px 20px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', display: 'inline-block' }}>{rec.replace(/_/g, ' ')}</div>
        </div>

        {/* Signal Breakdown */}
        <div className="nest-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>14 Signal Breakdown</div>
          {['treasury_10yr', 'treasury_change_bps', 'sofr', 'credit_spread_ig', 'credit_spread_hy', 'vix', 'refi_market_access', 'deal_dscr', 'deal_occupancy', 'covenant_status', 'months_since_origination', 'hft_return_ytd', 'b_tranche_coverage', 'lc_capacity_ratio'].map(signal => {
            const val = sig[signal] || sig[signal + '_pct'] || sig[signal + '_bps'] || '—'
            const signalScore = 40 + Math.random() * 50
            return (
              <div key={signal} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 140, fontFamily: 'var(--font-mono)', fontSize: 8, color: '#7A9A82', textTransform: 'uppercase', letterSpacing: '.04em' }}>{signal.replace(/_/g, ' ')}</div>
                <div style={{ flex: 1, background: 'rgba(3,10,6,0.6)', borderRadius: 2, height: 6 }}>
                  <div style={{ width: `${signalScore}%`, height: '100%', background: signalScore >= 70 ? '#C4A048' : signalScore >= 40 ? '#2D6B3D' : '#ef4444', borderRadius: 2 }} />
                </div>
                <div style={{ width: 50, fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', textAlign: 'right' }}>{typeof val === 'number' ? val.toFixed(1) : val}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Apex Panel */}
      <div className="nest-card" style={{ marginTop: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Apex · Short Position Manager</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div className="nest-kpi"><div className="nest-kpi-label">Active Shorts</div><div className="nest-kpi-value">0</div></div>
          <div className="nest-kpi"><div className="nest-kpi-label">Unrealized P&L</div><div className="nest-kpi-value">$0</div></div>
          <div className="nest-kpi"><div className="nest-kpi-label">Instruments</div><div className="nest-kpi-value">—</div></div>
          <div className="nest-kpi"><div className="nest-kpi-label">Status</div><div className="nest-kpi-value" style={{ color: '#7A9A82', fontSize: 14 }}>STANDBY</div></div>
        </div>
      </div>
    </div>
  )
}
