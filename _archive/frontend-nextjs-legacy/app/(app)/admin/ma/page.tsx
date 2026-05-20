'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function MAPage() {
  const [tab, setTab] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [naics, setNaics] = useState('6216')
  const [result, setResult] = useState<any>(null)

  async function analyzeCompany() {
    if (!companyName) return
    setAnalyzing(true)
    try {
      const r = await fetch(`${API}/api/ma/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: companyName, naics_code: naics }) })
      const d = await r.json()
      if (d.success) setResult(d.data)
    } catch {} finally { setAnalyzing(false) }
  }

  const tabs = ['Target Universe', 'Business Plans', 'Pipeline', 'Portfolio']
  const pipelineStages = ['Identified', 'Analyzing', 'Outreach', 'LOI', 'Due Diligence', 'Committed', 'Closed']

  const sampleTargets = [
    { name: 'Cascade Health Partners', naics: '6216 — Home Health', city: 'Portland, OR', revenue: '$28M', ebitda: '$4.2M', margin: '15%', growth: '18%', grade: 'A', score: 82 },
    { name: 'Pacific Property Management', naics: '5311 — Property Mgmt', city: 'Seattle, WA', revenue: '$15M', ebitda: '$3.1M', margin: '21%', growth: '12%', grade: 'B', score: 71 },
    { name: 'Evergreen Engineering', naics: '5413 — Engineering', city: 'Tacoma, WA', revenue: '$22M', ebitda: '$3.8M', margin: '17%', growth: '14%', grade: 'B', score: 68 },
  ]

  const gradeColors: Record<string, string> = { A: '#C4A048', B: '#7A9A82', C: '#60a5fa', D: '#ef4444' }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>M&A Intelligence · Merlin Agent</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>Acquisition Command Center</h1>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
        {[{ l: 'TARGETS SCANNED', v: '847' }, { l: 'A-GRADE', v: '12' }, { l: 'ACTIVE PIPELINE', v: '5' }, { l: 'WAR CHEST', v: '$4.2M' }].map(k => (
          <div key={k.l} className="nest-kpi"><div className="nest-kpi-label">{k.l}</div><div className="nest-kpi-value">{k.v}</div></div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(196,160,72,0.15)', marginBottom: 20 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: 10, color: tab === i ? '#C4A048' : '#2D4A35', borderBottom: tab === i ? '2px solid #C4A048' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div>
          {/* Analyze Input */}
          <div className="nest-card" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Company Name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter company name" style={{ width: '100%', background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 12px', color: '#EDE8DC', fontSize: 12, fontFamily: 'var(--font-space)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>NAICS</label>
              <select value={naics} onChange={e => setNaics(e.target.value)} style={{ background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 12px', color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <option value="6216">6216 — Home Health</option><option value="6232">6232 — Assisted Living</option><option value="5311">5311 — Property Mgmt</option><option value="5413">5413 — Engineering</option><option value="5412">5412 — Accounting</option>
              </select>
            </div>
            <button onClick={analyzeCompany} disabled={analyzing} className="btn-gold" style={{ whiteSpace: 'nowrap' }}>{analyzing ? 'Analyzing...' : 'Run Merlin Analysis'}</button>
          </div>

          {/* Analysis Result */}
          {result && (
            <div className="nest-card" style={{ marginBottom: 16, border: '1px solid rgba(196,160,72,0.3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Merlin Analysis Complete</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{JSON.stringify(result, null, 2).slice(0, 2000)}</pre>
            </div>
          )}

          {/* Target Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {sampleTargets.map(t => (
              <div key={t.name} className="nest-card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: `rgba(${t.grade === 'A' ? '196,160,72' : '122,154,130'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant)', fontSize: 18, color: gradeColors[t.grade], fontWeight: 600 }}>{t.grade}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t.naics}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: '#EDE8DC', fontWeight: 400, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', marginBottom: 12 }}>{t.city}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[['Revenue', t.revenue], ['EBITDA', t.ebitda], ['Margin', t.margin], ['Growth', t.growth]].map(([l, v]) => (
                    <div key={l as string}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase' }}>{l}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#C4A048', fontWeight: 500 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ marginTop: 12, background: 'rgba(3,10,6,0.6)', borderRadius: 3, height: 4 }}><div style={{ width: `${t.score}%`, height: '100%', background: 'linear-gradient(90deg, #2D6B3D, #C4A048)', borderRadius: 3 }} /></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', marginTop: 4, textAlign: 'right' }}>Score: {t.score}/100</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {pipelineStages.map(stage => (
            <div key={stage} style={{ minWidth: 160, background: '#0D2218', border: '0.5px solid rgba(196,160,72,0.15)', borderRadius: 6, padding: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>{stage}</div>
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82', padding: '16px 0' }}>—</div>
            </div>
          ))}
        </div>
      )}

      {(tab === 1 || tab === 3) && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#7A9A82', fontStyle: 'italic' }}>{tab === 1 ? 'Business plans generated by Merlin will appear here.' : 'Portfolio companies tracked here after acquisition close.'}</div>
        </div>
      )}
    </div>
  )
}
