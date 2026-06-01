'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('nest_token') || ''}`, 'Content-Type': 'application/json' })

export default function DealDetailPage() {
  const params = useParams()
  const dealId = params.id as string
  const [deal, setDeal] = useState<any>(null)
  const [structure, setStructure] = useState<any>(null)
  const [credit, setCredit] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [checklist, setChecklist] = useState<any>(null)
  const [tab, setTab] = useState(0)
  const [memo, setMemo] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!dealId) return
    fetch(`${API}/api/deals/${dealId}`, { headers: h() }).then(r => r.json()).then(d => { if (d.data) setDeal(d.data) }).catch(() => {})
    fetch(`${API}/api/deals/${dealId}/structure`, { headers: h() }).then(r => r.json()).then(d => setStructure(d.data)).catch(() => {})
    fetch(`${API}/api/deals/${dealId}/credit`, { headers: h() }).then(r => r.json()).then(d => setCredit(d.data)).catch(() => {})
    fetch(`${API}/api/deals/${dealId}/risk`, { headers: h() }).then(r => r.json()).then(d => setRisk(d.data)).catch(() => {})
    fetch(`${API}/api/deals/${dealId}/checklist`, { headers: h() }).then(r => r.json()).then(d => { if (d.data) setChecklist(d.data) }).catch(() => {})
  }, [dealId])

  async function generateMemo() {
    setGenerating(true)
    try {
      const r = await fetch(`${API}/api/deals/${dealId}/memo`, { method: 'POST', headers: h(), body: JSON.stringify({ memo_type: 'executive_summary' }) })
      const d = await r.json()
      if (d.data?.content) setMemo(d.data.content)
    } catch {} finally { setGenerating(false) }
  }

  if (!deal) return <div style={{ padding: 40, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#2D4A35' }}>Loading deal...</div>
  const project = deal.project || {}
  const tabs = ['Overview', 'Credit Engine', 'Bond Structure', 'Agents']
  const agents = ['Vector', 'Apex', 'Chain', 'Atlas', 'Morgan', 'Sterling', 'Bridge', 'Quantum', 'Maxwell', 'Aria', 'Merlin', 'LenderScout', 'Prometheus', 'Sentinel', 'Blaze']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.12em', textTransform: 'uppercase' }}>{project.asset_type?.replace(/_/g, ' ')} · {project.city}, {project.state}</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>{deal.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="tag-gold">{deal.status}</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: '#C4A048', fontWeight: 500 }}>${((project.total_project_cost_usd || 0) / 1e6).toFixed(0)}M</div>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase' }}>Readiness</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C4A048' }}>{deal.readiness_score || 0}%</span>
        </div>
        <div style={{ background: 'rgba(3,10,6,0.6)', borderRadius: 3, height: 6 }}><div style={{ width: `${deal.readiness_score || 0}%`, height: '100%', background: 'linear-gradient(90deg, #2D6B3D, #C4A048)', borderRadius: 3 }} /></div>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(196,160,72,0.15)', marginBottom: 20 }}>
        {tabs.map((t, i) => (<button key={t} onClick={() => setTab(i)} style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: 10, color: tab === i ? '#C4A048' : '#2D4A35', borderBottom: tab === i ? '2px solid #C4A048' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>{t}</button>))}
      </div>
      {tab === 0 && (<div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { l: 'BOND FACE', v: structure?.par_amount ? `$${(structure.par_amount / 1e6).toFixed(0)}M` : (structure?.series?.length ? `$${(structure.series.reduce((s: number, x: any) => s + (x.face_amount_usd || x.par || 0), 0) / 1e6).toFixed(0)}M` : '—') },
            { l: 'UNITS', v: project.units || '—' },
            { l: 'GRADE', v: credit?.grade || risk?.grade || '—' },
            { l: 'AE ECONOMICS', v: structure?.capital_stack?.arrangement_fee_usd ? `$${(structure.capital_stack.arrangement_fee_usd / 1e6).toFixed(1)}M` : '—' },
          ].map(k => (<div key={k.l} className="nest-kpi"><div className="nest-kpi-label">{k.l}</div><div className="nest-kpi-value">{k.v}</div></div>))}
        </div>
        {checklist && (<div className="nest-card">{Object.entries(checklist.checklist || {}).map(([key, val]) => (<div key={key} className="data-row"><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: val === true || val === 'approved' || val === 'executed' || val === 'delivered' ? '#2D6B3D' : val === 'not_started' || val === 'none' || val === false ? '#ef4444' : '#C4A048' }} /><span className="data-label">{key.replace(/_/g, ' ')}</span></div><span className="data-value" style={{ fontSize: 9, color: '#7A9A82' }}>{String(val)}</span></div>))}</div>)}
      </div>)}
      {tab === 1 && (<div>
        {credit?.grade && (
          <div className="nest-card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.12em' }}>MAXWELL GRADE</div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#C4A048', marginTop: 4 }}>{credit.grade}</div>
            </div>
            {credit.score != null && (<div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.12em' }}>SCORE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: '#EDE8DC', marginTop: 4 }}>{credit.score}</div>
            </div>)}
          </div>
        )}
        <div className="nest-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', marginBottom: 16 }}>JP MORGAN CREDIT BENCHMARKS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { m: 'DSCR', b: 'A: >2.0x · BBB-: >1.5x', v: credit?.dscr, fmt: (x: number) => `${x.toFixed(2)}x` },
              { m: 'LTV', b: 'A: <55% · BBB-: <70%', v: credit?.ltv, fmt: (x: number) => `${x.toFixed(1)}%` },
              { m: 'D/EBITDA', b: 'A: <4.5x · BBB-: <6.5x', v: credit?.d_ebitda, fmt: (x: number) => `${x.toFixed(2)}x` },
              { m: 'ICR', b: 'A: >3.5x · BBB-: >2.25x', v: credit?.icr, fmt: (x: number) => `${x.toFixed(2)}x` },
              { m: 'CF LEVERAGE', b: 'A: <1.5x · BBB-: <2.0x', v: credit?.cf_leverage, fmt: (x: number) => `${x.toFixed(2)}x` },
              { m: 'BS LEVERAGE', b: 'A: <2.0x · BBB-: <2.5x', v: credit?.bs_leverage, fmt: (x: number) => `${x.toFixed(2)}x` },
            ].map(k => (<div key={k.m} className="nest-kpi"><div className="nest-kpi-label">{k.m}</div><div className="nest-kpi-value">{k.v != null ? k.fmt(Number(k.v)) : '—'}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', marginTop: 4 }}>{k.b}</div></div>))}
          </div>
        </div>
        {risk?.overall_score != null && (
          <div className="nest-card" style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', marginBottom: 12 }}>SENTINEL RISK DIMENSIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                ['OVERALL', risk.overall_score],
                ['CREDIT', risk.credit_risk],
                ['MARKET', risk.market_risk],
                ['CONSTRUCTION', risk.construction_risk],
                ['LEGAL', risk.legal_risk],
                ['OPERATIONAL', risk.operational_risk],
                ['ENVIRONMENTAL', risk.environmental_risk],
                ['POLITICAL', risk.political_risk],
              ].map(([l, v]) => (<div key={l as string} className="nest-kpi"><div className="nest-kpi-label">{l}</div><div className="nest-kpi-value">{v != null ? v : '—'}</div></div>))}
            </div>
          </div>
        )}
      </div>)}
      {tab === 2 && (<div>
        {structure?.series?.length ? (<>
          <div style={{ display: 'flex', gap: 2, marginBottom: 20, height: 40 }}>
            {structure.series.map((s: any, i: number) => {
              const face = s.face_amount_usd || s.par || 0
              const label = s.label || s.tranche || `S${i + 1}`
              return (<div key={s.series_id || i} style={{ flex: face, background: label === 'A' ? '#C4A048' : '#7A9A82', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#030A06', fontWeight: 600 }}>Series {label} · ${(face / 1e6).toFixed(0)}M</span></div>)
            })}
          </div>
          {structure.capital_stack && Object.keys(structure.capital_stack).length > 0 && (
            <div className="nest-card">{Object.entries(structure.capital_stack).map(([k, v]) => (<div key={k} className="data-row"><span className="data-label">{k.replace(/_/g, ' ')}</span><span className="data-value" style={{ color: '#C4A048' }}>${((v as number) / 1e6).toFixed(2)}M</span></div>))}</div>
          )}
          {structure.blended_coupon != null && (
            <div className="nest-card" style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <div className="nest-kpi"><div className="nest-kpi-label">BLENDED COUPON</div><div className="nest-kpi-value">{Number(structure.blended_coupon).toFixed(3)}%</div></div>
              {structure.weighted_avg_life != null && (<div className="nest-kpi"><div className="nest-kpi-label">WAL</div><div className="nest-kpi-value">{Number(structure.weighted_avg_life).toFixed(2)}y</div></div>)}
              {structure.all_in_tic != null && (<div className="nest-kpi"><div className="nest-kpi-label">ALL-IN TIC</div><div className="nest-kpi-value">{Number(structure.all_in_tic).toFixed(3)}%</div></div>)}
            </div>
          )}
        </>) : (
          <div className="nest-card" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2D4A35', textAlign: 'center', padding: 32 }}>No bond structure yet · run Bernard preflight to trigger structuring</div>
        )}
      </div>)}
      {tab === 3 && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>{agents.map(a => (<div key={a} className="nest-card-dark" style={{ textAlign: 'center', padding: '12px 8px' }}><div className="status-dot" style={{ background: ['Morgan', 'Aria', 'Sterling'].includes(a) ? '#2D6B3D' : '#2D4A35', margin: '0 auto 6px' }} /><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#EDE8DC' }}>{a}</div></div>))}</div><button onClick={generateMemo} disabled={generating} className="btn-gold" style={{ marginBottom: 16 }}>{generating ? 'Morgan is writing...' : 'Generate Executive Summary'}</button>{memo && (<div className="nest-card" style={{ border: '1px solid rgba(196,160,72,0.3)' }}><div style={{ fontSize: 13, color: '#EDE8DC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{memo}</div></div>)}</div>)}
    </div>
  )
}
