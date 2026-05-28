'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function RatingDeskPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [moodysResult, setMoodysResult] = useState<any>(null)
  const [spResult, setSpResult] = useState<any>(null)
  const [levers, setLevers] = useState<any>(null)
  const [activeView, setActiveView] = useState<'input' | 'dual'>('input')

  const [sector, setSector] = useState('senior_living')
  const [dscr, setDscr] = useState('1.35')
  const [leverage, setLeverage] = useState('4.2')
  const [revenue, setRevenue] = useState('25000000')
  const [ebitda, setEbitda] = useState('4000000')
  const [equityPct, setEquityPct] = useState('0.30')
  const [enhancement, setEnhancement] = useState('none')
  const [mgmtQuality, setMgmtQuality] = useState('strong')
  const [marketPos, setMarketPos] = useState('satisfactory')
  const [revDiversity, setRevDiversity] = useState('moderate')
  const [daysCash, setDaysCash] = useState('120')

  useEffect(() => { fetch(`${API}/api/desks/rating/agents`).then(r => r.json()).then(d => d.success && setAgents(d.data)).catch(() => {}) }, [])

  function buildDeal() {
    return {
      sector, dscr: parseFloat(dscr), leverage: parseFloat(leverage),
      revenue: parseFloat(revenue), ebitda: parseFloat(ebitda),
      equity_pct: parseFloat(equityPct), enhancement,
      management_quality: mgmtQuality, market_position: marketPos, competitive_position: marketPos,
      revenue_diversity: revDiversity, days_cash_on_hand: parseInt(daysCash), dsrf_type: 'mads',
    }
  }

  async function runDual() {
    setLoading(true)
    try {
      const [dualRes, leverRes] = await Promise.all([
        fetch(`${API}/api/rating/dual`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildDeal()) }),
        fetch(`${API}/api/rating/levers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildDeal()) }),
      ])
      const dualData = await dualRes.json()
      const leverData = await leverRes.json()
      if (dualData.success) { setMoodysResult(dualData.data.moodys); setSpResult(dualData.data.sp); setActiveView('dual') }
      if (leverData.success) setLevers(leverData.data)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: '#0D2218', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-mono)' } as const
  const lbl = { display: 'block' as const, fontSize: 10, color: '#7A9A82', letterSpacing: '.06em', textTransform: 'uppercase' as const, marginBottom: 4, fontFamily: 'var(--font-space)' }
  const card = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Rating Desk — Mirror Agents</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>{"Moody's and S&P methodology mirroring — the firm's signature capability"}</p>

      {/* Agent Roster */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#C4A048', marginBottom: 10 }}>Agent Roster</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {agents.map((a: any, i: number) => (
            <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#EDE8DC', fontWeight: 600 }}>{a.name}</span>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: a.agent_file ? '#2D6B3D' : '#7A9A82', background: a.agent_file ? 'rgba(45,107,61,0.15)' : 'rgba(122,154,130,0.1)', padding: '2px 6px', borderRadius: 2 }}>{a.agent_file ? 'WIRED' : 'PENDING'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid rgba(196,160,72,0.1)', paddingBottom: 8 }}>
        {(['input', 'dual'] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)} style={{ background: activeView === v ? 'rgba(196,160,72,0.12)' : 'transparent', border: 'none', color: activeView === v ? '#C4A048' : '#7A9A82', padding: '6px 14px', fontSize: 10, fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: activeView === v ? '2px solid #C4A048' : '2px solid transparent' }}>
            {v === 'input' ? 'Deal Inputs' : 'Dual Rating Result'}
          </button>
        ))}
      </div>

      {activeView === 'input' && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><label style={lbl}>Sector</label><select value={sector} onChange={e => setSector(e.target.value)} style={inp}>{['senior_living','hospitals','charter_schools','affordable_multifamily','corporate','software_saas','industrial_manufacturing','data_centers','hospitality'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
            <div><label style={lbl}>DSCR</label><input value={dscr} onChange={e => setDscr(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Leverage (x)</label><input value={leverage} onChange={e => setLeverage(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Revenue ($)</label><input value={revenue} onChange={e => setRevenue(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>EBITDA ($)</label><input value={ebitda} onChange={e => setEbitda(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Equity %</label><input value={equityPct} onChange={e => setEquityPct(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Enhancement</label><select value={enhancement} onChange={e => setEnhancement(e.target.value)} style={inp}>{['none','bond_insurance','loc_investment_grade','cash_collateralized_lc','federal_guarantee'].map(e => <option key={e} value={e}>{e.replace(/_/g,' ')}</option>)}</select></div>
            <div><label style={lbl}>Management</label><select value={mgmtQuality} onChange={e => setMgmtQuality(e.target.value)} style={inp}>{['excellent','strong','good','adequate','weak'].map(q => <option key={q} value={q}>{q}</option>)}</select></div>
            <div><label style={lbl}>Market Position</label><select value={marketPos} onChange={e => setMarketPos(e.target.value)} style={inp}>{['excellent','strong','satisfactory','fair','weak'].map(q => <option key={q} value={q}>{q}</option>)}</select></div>
            <div><label style={lbl}>Revenue Diversity</label><select value={revDiversity} onChange={e => setRevDiversity(e.target.value)} style={inp}>{['excellent','strong','moderate','weak','poor'].map(q => <option key={q} value={q}>{q}</option>)}</select></div>
            <div><label style={lbl}>Days Cash on Hand</label><input value={daysCash} onChange={e => setDaysCash(e.target.value)} style={inp} /></div>
          </div>
          <button onClick={runDual} disabled={loading} style={{ marginTop: 20, background: 'linear-gradient(135deg, #C4A048, #E8C87A)', color: '#030A06', border: 'none', padding: '12px 32px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-space)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Running Mirror Agents...' : 'Run Dual Rating Prediction'}
          </button>
        </div>
      )}

      {activeView === 'dual' && moodysResult && spResult && (
        <div>
          {/* Rating Badges */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <span style={{ background: '#1E4A2E', color: '#EDE8DC', padding: '8px 16px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>{"Moody's"}: {moodysResult.predicted_rating}</span>
            <span style={{ background: '#1E4A2E', color: '#EDE8DC', padding: '8px 16px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>S&P: {spResult.predicted_rating}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Moody's */}
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>{"Moody's Scorecard"}</h3>
              {moodysResult.scorecard && <>
                <div style={{ fontSize: 10, color: '#7A9A82', marginBottom: 6 }}>QUANTITATIVE ({(moodysResult.scorecard.quantitative?.weight*100)}%)</div>
                {['dscr','leverage','liquidity'].map(k => { const f = moodysResult.scorecard.quantitative?.[k]; return f ? <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}><span style={{ color: '#EDE8DC' }}>{k.toUpperCase()}: {typeof f.value === 'number' ? f.value.toFixed(2) : f.value}</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)' }}>Score: {f.score}</span></div> : null })}
                <div style={{ fontSize: 10, color: '#7A9A82', marginBottom: 6, marginTop: 12 }}>QUALITATIVE ({(moodysResult.scorecard.qualitative?.weight*100)}%)</div>
                {['management','market_position','revenue_diversity','governance'].map(k => { const f = moodysResult.scorecard.qualitative?.[k]; return f ? <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}><span style={{ color: '#EDE8DC' }}>{k.replace(/_/g,' ')}: {f.assessment}</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)' }}>{f.score}</span></div> : null })}
                <div style={{ borderTop: '1px solid rgba(196,160,72,0.15)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#EDE8DC', fontSize: 13 }}>Composite</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700 }}>{moodysResult.scorecard.composite_score}</span></div>
              </>}
            </div>
            {/* S&P */}
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>S&P Assessment</h3>
              {spResult.business_risk && spResult.financial_risk && <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: '#030A06', padding: 12, borderRadius: 6 }}><div style={{ fontSize: 10, color: '#7A9A82' }}>Business Risk</div><div style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{spResult.business_risk.assessment}</div></div>
                  <div style={{ background: '#030A06', padding: 12, borderRadius: 6 }}><div style={{ fontSize: 10, color: '#7A9A82' }}>Financial Risk</div><div style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{spResult.financial_risk.assessment}</div></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(196,160,72,0.15)' }}><span style={{ color: '#EDE8DC', fontSize: 13 }}>Anchor</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700 }}>{spResult.anchor}</span></div>
                {spResult.modifiers?.adjustments?.map((a: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}><span style={{ color: '#EDE8DC' }}>{a.modifier}</span><span style={{ color: typeof a.impact === 'number' && a.impact < 0 ? '#2D6B3D' : '#8B3A14', fontFamily: 'var(--font-mono)' }}>{typeof a.impact === 'number' ? (a.impact > 0 ? '+' : '') + a.impact + ' notch' : a.impact}</span></div>
                ))}
              </>}
            </div>
          </div>

          {/* Levers */}
          {levers && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Structural Levers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#7A9A82', marginBottom: 8 }}>{"MOODY'S"}</div>
                  {levers.moodys_levers?.map((l: any, i: number) => (
                    <div key={i} style={{ background: '#030A06', padding: 10, borderRadius: 6, marginBottom: 6, borderLeft: '3px solid #C4A048' }}>
                      <div style={{ color: '#EDE8DC', fontSize: 12, fontWeight: 600 }}>{l.lever}</div>
                      <div style={{ color: '#7A9A82', fontSize: 10, marginTop: 2 }}>{l.impact} ({l.notches})</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#7A9A82', marginBottom: 8 }}>S&P</div>
                  {levers.sp_levers?.map((l: any, i: number) => (
                    <div key={i} style={{ background: '#030A06', padding: 10, borderRadius: 6, marginBottom: 6, borderLeft: '3px solid #C4A048' }}>
                      <div style={{ color: '#EDE8DC', fontSize: 12, fontWeight: 600 }}>{l.lever}</div>
                      <div style={{ color: '#7A9A82', fontSize: 10, marginTop: 2 }}>{l.sp_impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Narratives */}
          {(moodysResult.narrative || spResult.narrative) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {moodysResult.narrative && <div style={card}><h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#C4A048', marginBottom: 8 }}>{"Moody's Analyst Opinion"}</h3><div style={{ color: '#EDE8DC', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{moodysResult.narrative}</div></div>}
              {spResult.narrative && <div style={card}><h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#C4A048', marginBottom: 8 }}>S&P Analyst Opinion</h3><div style={{ color: '#EDE8DC', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{spResult.narrative}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
