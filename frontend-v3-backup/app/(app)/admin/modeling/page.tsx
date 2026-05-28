'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ModelingPage() {
  const [tab, setTab] = useState(0)
  const [running, setRunning] = useState(false)
  const [gradeResult, setGradeResult] = useState<any>(null)
  const [optimizeResult, setOptimizeResult] = useState<any>(null)

  async function runGrade() {
    setRunning(true)
    try {
      const r = await fetch(`${API}/api/bond-tools/grade`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deal: { rating_target: 'A', sponsor: { track_record_projects: 8, audited_financials_received: true }, readiness_score: 75, project: { project_type: 'senior_living', total_project_cost_usd: 231000000 } }, bond: { b_tranche_overlay: { proceeds_to_bank_aum: true, io_funded_from_proceeds: true, maturity_reserve_pct: 2.5 } }, credit_metrics: { dscr: 1.8, ltv: 62, debt_to_ebitda: 5.0, interest_coverage: 2.8, lgd_bare: 60 } }) })
      const d = await r.json()
      if (d.data) setGradeResult(d.data)
    } catch {} finally { setRunning(false) }
  }

  async function runOptimize() {
    setRunning(true)
    try {
      const r = await fetch(`${API}/api/bond-tools/optimize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deal: { dscr: 1.7, id: 'demo' }, bond: { coupon_rate_pct: 7.5, face_amount_usd: 173000000, months_outstanding: 24, remaining_term_months: 36 }, market_signals: { treasury_10yr_pct: 4.0, credit_spread_ig_bps: 110, refi_market_access: 'open_favorable' } }) })
      const d = await r.json()
      if (d.data) setOptimizeResult(d.data)
    } catch {} finally { setRunning(false) }
  }

  const tabs = ['Bond Grading', 'Stress Testing', 'Bond Optimization']
  const stressScenarios = [
    { name: 'Base Case', color: '#2D6B3D', dscr: '1.80x', outcome: 'Performing — all covenants met' },
    { name: 'Downside', color: '#C4A048', dscr: '1.38x', outcome: 'Tight but serviceable' },
    { name: 'Stress', color: '#f97316', dscr: '1.08x', outcome: 'Reserve activated' },
    { name: 'Catastrophic', color: '#ef4444', dscr: '0.78x', outcome: 'Surety draw required' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Financial Modeling · Prometheus Agent</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>Modeling Studio</h1>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(196,160,72,0.15)', margin: '16px 0 20px' }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: 10, color: tab === i ? '#C4A048' : '#2D4A35', borderBottom: tab === i ? '2px solid #C4A048' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div>
          <button onClick={runGrade} disabled={running} className="btn-gold" style={{ marginBottom: 20 }}>{running ? 'Grading...' : 'Run Bond Grading — Life Star Pointe Loop'}</button>
          {gradeResult && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 20 }}>
                <div className="nest-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Base Grade</div>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, color: '#7A9A82', fontWeight: 300 }}>{gradeResult.base_grade}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2D4A35', margin: '8px 0' }}>↓ Enhanced ↓</div>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 64, color: '#C4A048', fontWeight: 400, lineHeight: 1 }}>{gradeResult.enhanced_grade}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: gradeResult.target_achieved ? '#2D6B3D' : '#ef4444', marginTop: 8 }}>Target {gradeResult.target_grade}: {gradeResult.target_achieved ? 'ACHIEVED' : 'NOT MET'}</div>
                </div>
                <div>
                  <div className="nest-card" style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Component Scores</div>
                    {Object.entries(gradeResult.component_scores || {}).map(([k, v]: [string, any]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 140, fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</div>
                        <div style={{ flex: 1, background: 'rgba(3,10,6,0.6)', borderRadius: 3, height: 8 }}><div style={{ width: `${v.score}%`, height: '100%', background: v.score >= 70 ? '#2D6B3D' : v.score >= 40 ? '#C4A048' : '#ef4444', borderRadius: 3 }} /></div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C4A048', width: 32, textAlign: 'right' }}>{v.score}</div>
                      </div>
                    ))}
                  </div>
                  {gradeResult.enhancements_applied?.length > 0 && (
                    <div className="nest-card">
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Structural Enhancements Applied</div>
                      {gradeResult.enhancements_applied.map((e: any, i: number) => (
                        <div key={i} className="data-row"><span className="data-label">{e.description}</span><span className="data-value" style={{ color: '#C4A048' }}>+{e.notch_up} notch</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {gradeResult.gap_analysis?.length > 0 && (
                <div className="nest-card">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ef4444', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Gap Analysis — What&apos;s Needed</div>
                  {gradeResult.gap_analysis.map((g: any, i: number) => (
                    <div key={i} className="data-row"><span className="data-label">{g.metric}: {g.current} → need {g.required}</span><span className="data-value" style={{ color: '#ef4444' }}>{g.action}</span></div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {stressScenarios.map(s => (
            <div key={s.name} className="nest-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: s.color, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: s.color, fontWeight: 500, marginBottom: 4 }}>{s.dscr}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>DSCR</div>
              <div style={{ fontSize: 11, color: '#7A9A82' }}>{s.outcome}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div>
          <button onClick={runOptimize} disabled={running} className="btn-gold" style={{ marginBottom: 20 }}>{running ? 'Optimizing...' : 'Run Bond Optimization'}</button>
          {optimizeResult && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <div className="nest-kpi"><div className="nest-kpi-label">Current Rate</div><div className="nest-kpi-value">{optimizeResult.current_rate}%</div></div>
                <div className="nest-kpi"><div className="nest-kpi-label">Market Rate</div><div className="nest-kpi-value">{optimizeResult.market_rate}%</div></div>
                <div className="nest-kpi"><div className="nest-kpi-label">Differential</div><div className="nest-kpi-value">{optimizeResult.rate_differential_bps}bps</div></div>
              </div>
              {optimizeResult.recommended_actions?.map((a: any, i: number) => (
                <div key={i} className="nest-card" style={{ marginBottom: 8, borderLeft: `3px solid ${a.action === 'EXECUTE_CALL' ? '#C4A048' : a.action === 'PUT_ALERT' ? '#ef4444' : '#7A9A82'}` }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: a.action === 'EXECUTE_CALL' ? '#C4A048' : '#7A9A82', fontWeight: 600, marginBottom: 4 }}>{a.action}</div>
                  <div style={{ fontSize: 12, color: '#EDE8DC', marginBottom: 4 }}>{a.rationale}</div>
                  {a.annual_savings_usd && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#C4A048' }}>Annual savings: ${(a.annual_savings_usd / 1e6).toFixed(2)}M · Breakeven: {a.breakeven_months}mo</div>}
                </div>
              ))}
              {optimizeResult.par_value_analysis?.can_access_additional_funds && (
                <div className="nest-card" style={{ border: '1px solid rgba(196,160,72,0.3)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Additional Capacity Unlocked</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: '#C4A048' }}>${(optimizeResult.par_value_analysis.additional_capacity_usd / 1e6).toFixed(1)}M</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', marginTop: 4 }}>{optimizeResult.par_value_analysis.note}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
