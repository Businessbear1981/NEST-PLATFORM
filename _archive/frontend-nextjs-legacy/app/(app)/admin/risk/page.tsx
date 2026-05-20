'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function RiskPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [scoring, setScoring] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/deals`).then(r => r.json()).then(d => { if (d.data) setDeals(d.data) }).catch(() => {})
  }, [])

  async function runAudit(deal: any) {
    setScoring(true)
    try {
      const r = await fetch(`${API}/api/bond-tools/audit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deal, credit_metrics: { dscr: 1.65, ltv: 67, debt_to_ebitda: 5.5, interest_coverage: 2.6 } }) })
      const d = await r.json()
      if (d.data) setAuditResult(d.data)
    } catch {} finally { setScoring(false) }
  }

  const levelColors: Record<string, string> = { green: '#2D6B3D', yellow: '#C4A048', red: '#ef4444', critical: '#dc2626' }
  const levelBg: Record<string, string> = { green: 'rgba(45,107,61,0.2)', yellow: 'rgba(196,160,72,0.15)', red: 'rgba(239,68,68,0.15)', critical: 'rgba(220,38,38,0.25)' }
  const dimensions = ['Market Risk', 'Construction Risk', 'Credit Risk', 'Operational Risk', 'Regulatory Risk', 'Sponsor Risk', 'Environmental Risk']

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Risk Assessment · Sentinel Agent</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>Risk Command Center</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
        {[{ l: 'DEALS MONITORED', v: String(deals.length) }, { l: 'GREEN', v: String(deals.length) }, { l: 'YELLOW', v: '0' }, { l: 'ALERTS ACTIVE', v: '0' }].map(k => (
          <div key={k.l} className="nest-kpi"><div className="nest-kpi-label">{k.l}</div><div className="nest-kpi-value">{k.v}</div></div>
        ))}
      </div>

      {/* Deal Risk Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {deals.map((d: any) => (
          <div key={d.id} className="nest-card" style={{ cursor: 'pointer' }} onClick={() => runAudit(d)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: '#EDE8DC' }}>{d.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', marginTop: 2 }}>{d.project?.city}, {d.project?.state}</div>
              </div>
              <div style={{ background: levelBg['green'], color: levelColors['green'], padding: '4px 10px', borderRadius: 4, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>GREEN</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: '#C4A048', marginBottom: 8 }}>${((d.project?.total_project_cost_usd || 0) / 1e6).toFixed(0)}M</div>
            {/* Risk dimension bars */}
            {dimensions.map(dim => (
              <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{ width: 80, fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', textTransform: 'uppercase', letterSpacing: '.04em' }}>{dim.replace(' Risk', '')}</div>
                <div style={{ flex: 1, background: 'rgba(3,10,6,0.6)', borderRadius: 2, height: 4 }}>
                  <div style={{ width: `${15 + Math.random() * 20}%`, height: '100%', background: '#2D6B3D', borderRadius: 2 }} />
                </div>
              </div>
            ))}
            <button className="btn-outline" style={{ width: '100%', marginTop: 10, fontSize: 8, padding: '5px 0' }}>{scoring ? 'Scoring...' : 'Run Sentinel Audit'}</button>
          </div>
        ))}
      </div>

      {/* Audit Result */}
      {auditResult && (
        <div className="nest-card" style={{ border: '1px solid rgba(196,160,72,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase' }}>Audit Result — {auditResult.deal_name}</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36, color: auditResult.grade === 'A' ? '#C4A048' : auditResult.grade === 'B' ? '#7A9A82' : '#ef4444', fontWeight: 600 }}>{auditResult.grade}</div>
              <div><div className="nest-kpi-label">Score</div><div className="nest-kpi-value">{auditResult.composite_score}</div></div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', marginBottom: 12 }}>{auditResult.recommendation}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82' }}>Passed: {auditResult.passed}/{auditResult.total_checks} · Failed: {auditResult.failed} · Blockers: {auditResult.blocker_count}</div>
        </div>
      )}
    </div>
  )
}
