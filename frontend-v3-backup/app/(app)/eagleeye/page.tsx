'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const gold = '#C4A048'
const goldHi = '#E8C87A'
const void_ = '#030A06'
const forest = '#0D2218'
const sage = '#7A9A82'
const cream = '#EDE8DC'
const pine = '#2D6B3D'
const mono = "var(--font-mono), 'IBM Plex Mono', monospace"
const serif = "var(--font-cormorant), 'Cormorant Garamond', serif"
const sans = "var(--font-space), 'Space Grotesk', sans-serif"

function Card({ title, children, style }: { title: string; children: React.ReactNode; style?: any }) {
  return (
    <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, ...style }}>
      <h3 style={{ fontFamily: serif, fontSize: 16, color: gold, marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: mono, fontSize: 22, color: gold, fontWeight: 700 }}>{value}</div>
      <div style={{ fontFamily: mono, fontSize: 9, color: sage, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontFamily: mono, fontSize: 8, color: pine }}>{sub}</div>}
    </div>
  )
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ fontSize: 8, fontFamily: mono, color, background: `${color}22`, padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>{text}</span>
  )
}

export default function EagleEyePage() {
  const [tab, setTab] = useState<'pipeline' | 'intelligence' | 'operators' | 'findme'>('pipeline')
  const [pipeline, setPipeline] = useState<any>(null)
  const [intel, setIntel] = useState<any>(null)
  const [operators, setOperators] = useState<any>(null)
  const [findQuery, setFindQuery] = useState('')
  const [findResult, setFindResult] = useState<any>(null)
  const [findLoading, setFindLoading] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [pitchData, setPitchData] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/eagleeye/pipeline`).then(r => r.json()).then(d => d.success && setPipeline(d.data)).catch(() => {})
    fetch(`${API}/api/eagleeye/intelligence/report`).then(r => r.json()).then(d => d.success && setIntel(d.data)).catch(() => {})
    fetch(`${API}/api/eagleeye/operators`).then(r => r.json()).then(d => d.success && setOperators(d.data)).catch(() => {})
  }, [])

  const handleFind = async () => {
    if (!findQuery.trim()) return
    setFindLoading(true)
    try {
      const r = await fetch(`${API}/api/bernard/find-me`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: findQuery })
      })
      const d = await r.json()
      if (d.success) setFindResult(d.data)
    } catch {}
    setFindLoading(false)
  }

  const handlePitch = async (deal: any) => {
    setSelectedDeal(deal)
    try {
      const r = await fetch(`${API}/api/eagleeye/intelligence/pitch`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: deal.id })
      })
      const d = await r.json()
      if (d.success) setPitchData(d.data)
    } catch {}
  }

  const tabs = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'operators', label: 'Operators' },
    { id: 'findme', label: 'Find Me' },
  ] as const

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
        <h1 style={{ fontFamily: serif, fontSize: 28, color: gold }}>EagleEye</h1>
        <span style={{ fontFamily: mono, fontSize: 9, color: pine, letterSpacing: '.1em' }}>INTELLIGENCE ENGINE</span>
      </div>
      <p style={{ fontFamily: mono, fontSize: 10, color: sage, marginBottom: 20 }}>
        Deal sourcing · Cross-deal patterns · Operator targeting · Bond structuring
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${pine}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? forest : 'transparent', color: tab === t.id ? gold : sage,
              border: 'none', borderBottom: tab === t.id ? `2px solid ${gold}` : '2px solid transparent',
              padding: '10px 24px', fontFamily: mono, fontSize: 11, cursor: 'pointer', letterSpacing: '.05em',
              textTransform: 'uppercase', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top Metrics */}
      {pipeline && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 16 }}>
            <Metric label="TOTAL PIPELINE" value={`$${(pipeline.total_pipeline_usd / 1e9).toFixed(2)}B`} />
          </div>
          <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 16 }}>
            <Metric label="ACTIVE DEALS" value={String(pipeline.deal_count)} />
          </div>
          <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 16 }}>
            <Metric label="AVG SCORE" value={intel ? String(intel.average_attractiveness) : '—'} />
          </div>
          <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 16 }}>
            <Metric label="PATTERNS" value={intel ? String(intel.patterns?.length || 0) : '—'} />
          </div>
          <div style={{ background: forest, border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 16 }}>
            <Metric label="BOND ANGLES" value={intel ? String(intel.bond_angles?.length || 0) : '—'} />
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {tab === 'pipeline' && pipeline && (
        <Card title="Deal Pipeline — Ranked by Intelligence Score">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${pine}` }}>
                {['Deal', 'Sector', 'Size', 'Stage', 'Score', 'Tier', 'Actions'].map(h => (
                  <th key={h} style={{ fontFamily: mono, fontSize: 9, color: sage, textAlign: 'left', padding: '8px 6px', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipeline.deals?.map((d: any, i: number) => (
                <tr key={i} style={{ borderBottom: `1px solid ${void_}`, cursor: 'pointer' }}
                  onClick={() => handlePitch(d)}>
                  <td style={{ padding: '10px 6px', fontFamily: sans, fontSize: 13, color: cream, fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '10px 6px', fontFamily: mono, fontSize: 10, color: sage }}>{d.sector || d.asset_class || '—'}</td>
                  <td style={{ padding: '10px 6px', fontFamily: mono, fontSize: 12, color: gold }}>
                    ${d.size_usd >= 1e9 ? `${(d.size_usd/1e9).toFixed(1)}B` : d.size_usd >= 1e6 ? `${(d.size_usd/1e6).toFixed(1)}M` : `${(d.size_usd/1e3).toFixed(0)}K`}
                  </td>
                  <td style={{ padding: '10px 6px' }}><Badge text={d.stage || 'intake'} color={d.stage === 'book_building' ? goldHi : d.stage === 'structuring' ? pine : sage} /></td>
                  <td style={{ padding: '10px 6px', fontFamily: mono, fontSize: 14, color: gold, fontWeight: 700 }}>{d.intelligence?.score || '—'}</td>
                  <td style={{ padding: '10px 6px' }}><Badge text={d.intelligence?.tier || '—'} color={d.intelligence?.tier === 'A' ? gold : d.intelligence?.tier === 'B' ? pine : sage} /></td>
                  <td style={{ padding: '10px 6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handlePitch(d) }}
                      style={{ background: 'transparent', border: `1px solid ${gold}`, color: gold, padding: '4px 12px', borderRadius: 4, fontFamily: mono, fontSize: 8, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Pitch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Intelligence Tab */}
      {tab === 'intelligence' && intel && (
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Cross-Deal Patterns">
            {intel.patterns?.map((p: any, i: number) => (
              <div key={i} style={{ background: void_, borderRadius: 6, padding: 12, marginBottom: 8, border: '1px solid rgba(196,160,72,0.08)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <Badge text={p.type} color={gold} />
                  {p.sector && <span style={{ fontFamily: mono, fontSize: 9, color: sage }}>{p.sector}</span>}
                  {p.state && <span style={{ fontFamily: mono, fontSize: 9, color: sage }}>{p.state}</span>}
                </div>
                <p style={{ fontFamily: sans, fontSize: 12, color: cream, margin: 0 }}>{p.insight}</p>
                {p.combined_usd && <p style={{ fontFamily: mono, fontSize: 11, color: gold, margin: '4px 0 0' }}>${(p.combined_usd/1e6).toFixed(1)}M combined</p>}
              </div>
            ))}
          </Card>

          <Card title="Deal Scores — Ranked">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {intel.ranked_scores?.map((s: any, i: number) => (
                <div key={i} style={{ background: void_, borderRadius: 6, padding: 12, border: `1px solid ${s.tier === 'A' ? 'rgba(196,160,72,0.3)' : 'rgba(196,160,72,0.08)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: sans, fontSize: 12, color: cream, fontWeight: 600 }}>{s.deal_name}</span>
                    <span style={{ fontFamily: mono, fontSize: 18, color: gold, fontWeight: 700 }}>{s.score}</span>
                  </div>
                  <Badge text={`Tier ${s.tier}`} color={s.tier === 'A' ? gold : s.tier === 'B' ? pine : sage} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Operators Tab */}
      {tab === 'operators' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Tracked Operators">
            {operators?.operators ? operators.operators.map((op: any, i: number) => (
              <div key={i} style={{ background: void_, borderRadius: 6, padding: 16, marginBottom: 12, border: '1px solid rgba(196,160,72,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: serif, fontSize: 18, color: cream }}>{op.name}</span>
                  <Badge text={op.relationship_status || 'prospect'} color={op.relationship_status === 'active_client' ? gold : sage} />
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><span style={{ fontFamily: mono, fontSize: 9, color: sage }}>SECTOR </span><span style={{ fontFamily: mono, fontSize: 11, color: cream }}>{op.sector}</span></div>
                  <div><span style={{ fontFamily: mono, fontSize: 9, color: sage }}>PIPELINE </span><span style={{ fontFamily: mono, fontSize: 11, color: gold }}>${(op.total_pipeline_usd/1e6).toFixed(0)}M</span></div>
                  <div><span style={{ fontFamily: mono, fontSize: 9, color: sage }}>PROPERTIES </span><span style={{ fontFamily: mono, fontSize: 11, color: cream }}>{op.property_count}</span></div>
                </div>
              </div>
            )) : <p style={{ fontFamily: mono, fontSize: 11, color: sage }}>Loading operators...</p>}
          </Card>
        </div>
      )}

      {/* Find Me Tab */}
      {tab === 'findme' && (
        <Card title="Bernard — Find Me a Deal">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={findQuery} onChange={e => setFindQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFind()}
              placeholder="Describe what you're looking for... (e.g., 'acquire beauty supply wholesalers for African American market')"
              style={{ flex: 1, background: void_, border: `1px solid ${pine}`, borderRadius: 6, padding: '12px 16px',
                fontFamily: sans, fontSize: 13, color: cream, outline: 'none' }} />
            <button onClick={handleFind} disabled={findLoading}
              style={{ background: gold, color: void_, border: 'none', borderRadius: 6, padding: '12px 24px',
                fontFamily: mono, fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              {findLoading ? 'Searching...' : 'Find'}
            </button>
          </div>
          {findResult && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ background: void_, borderRadius: 6, padding: 16, border: '1px solid rgba(196,160,72,0.15)' }}>
                <h4 style={{ fontFamily: serif, fontSize: 16, color: gold, marginBottom: 8 }}>
                  {findResult.executive_summary || findResult.intent?.deal_type || 'Analysis'}
                </h4>
                <p style={{ fontFamily: sans, fontSize: 12, color: cream, margin: 0, lineHeight: 1.6 }}>
                  {findResult.bernard_summary || findResult.summary || JSON.stringify(findResult.intent || {}).slice(0, 300)}
                </p>
              </div>
              {findResult.sector_brief && (
                <div style={{ background: void_, borderRadius: 6, padding: 16, border: '1px solid rgba(196,160,72,0.08)' }}>
                  <h4 style={{ fontFamily: mono, fontSize: 11, color: sage, marginBottom: 8 }}>SECTOR INTELLIGENCE</h4>
                  <p style={{ fontFamily: mono, fontSize: 11, color: gold }}>{findResult.sector_brief.market_size ? `Market Size: $${(findResult.sector_brief.market_size/1e9).toFixed(1)}B` : ''}</p>
                  <p style={{ fontFamily: sans, fontSize: 12, color: cream, margin: '4px 0' }}>
                    {findResult.sector_brief.niche_markets?.join(' | ') || ''}
                  </p>
                </div>
              )}
              {findResult.capital_structure && (
                <div style={{ background: void_, borderRadius: 6, padding: 16, border: '1px solid rgba(196,160,72,0.08)' }}>
                  <h4 style={{ fontFamily: mono, fontSize: 11, color: sage, marginBottom: 8 }}>CAPITAL STRUCTURE OPTIONS</h4>
                  {(Array.isArray(findResult.capital_structure) ? findResult.capital_structure : [findResult.capital_structure]).map((cs: any, i: number) => (
                    <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < 2 ? `1px solid ${void_}` : 'none' }}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: gold }}>{cs.scenario || cs.name || `Option ${i+1}`}</span>
                      <span style={{ fontFamily: mono, fontSize: 10, color: sage, marginLeft: 12 }}>{cs.instrument || cs.type || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Pitch Drawer */}
      {pitchData && selectedDeal && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '50vw', height: '100vh', background: void_,
          borderLeft: `2px solid ${gold}`, zIndex: 1000, overflow: 'auto', padding: 32 }}>
          <button onClick={() => { setPitchData(null); setSelectedDeal(null) }}
            style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: sage, fontSize: 20, cursor: 'pointer' }}>✕</button>
          <h2 style={{ fontFamily: serif, fontSize: 24, color: gold, marginBottom: 4 }}>{selectedDeal.name}</h2>
          <p style={{ fontFamily: mono, fontSize: 10, color: sage, marginBottom: 24 }}>NEST ADVISORS — DEAL PITCH</p>

          {pitchData.capital_solutions && (
            <>
              <h3 style={{ fontFamily: mono, fontSize: 11, color: sage, marginBottom: 8, letterSpacing: '.08em' }}>CAPITAL SOLUTIONS</h3>
              {pitchData.capital_solutions.map((s: any, i: number) => (
                <div key={i} style={{ background: forest, borderRadius: 6, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontFamily: sans, fontSize: 13, color: cream, fontWeight: 600 }}>{s.solution}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: sage, marginTop: 2 }}>{s.structure}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: gold, marginTop: 2 }}>{s.advantage}</div>
                </div>
              ))}
            </>
          )}

          {pitchData.pitch_points && (
            <>
              <h3 style={{ fontFamily: mono, fontSize: 11, color: sage, marginTop: 20, marginBottom: 8, letterSpacing: '.08em' }}>WHY NEST</h3>
              {pitchData.pitch_points.map((p: string, i: number) => (
                <p key={i} style={{ fontFamily: sans, fontSize: 12, color: cream, margin: '4px 0', paddingLeft: 12, borderLeft: `2px solid ${pine}` }}>{p}</p>
              ))}
            </>
          )}

          {pitchData.competitive_advantages && (
            <>
              <h3 style={{ fontFamily: mono, fontSize: 11, color: sage, marginTop: 20, marginBottom: 8, letterSpacing: '.08em' }}>COMPETITIVE EDGE</h3>
              {pitchData.competitive_advantages.map((a: string, i: number) => (
                <div key={i} style={{ fontFamily: mono, fontSize: 10, color: gold, marginBottom: 4 }}>▸ {a}</div>
              ))}
            </>
          )}

          {pitchData.next_steps && (
            <>
              <h3 style={{ fontFamily: mono, fontSize: 11, color: sage, marginTop: 20, marginBottom: 8, letterSpacing: '.08em' }}>NEXT STEPS</h3>
              {pitchData.next_steps.map((s: string, i: number) => (
                <div key={i} style={{ fontFamily: sans, fontSize: 12, color: cream, marginBottom: 4 }}>{i + 1}. {s}</div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
