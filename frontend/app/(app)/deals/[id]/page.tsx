'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const h = () => ({ Authorization: `Bearer ${localStorage.getItem('nest_token') || ''}`, 'Content-Type': 'application/json' })

export default function DealDetailPage() {
  const params = useParams()
  const dealId = params.id as string
  const [deal, setDeal] = useState<any>(null)
  const [bond, setBond] = useState<any>(null)
  const [checklist, setChecklist] = useState<any>(null)
  const [tab, setTab] = useState(0)
  const [memo, setMemo] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!dealId) return
    fetch(`${API}/api/deals/${dealId}`, { headers: h() }).then(r => r.json()).then(d => { if (d.data) setDeal(d.data) }).catch(() => {})
    fetch(`${API}/api/deals/${dealId}/bonds`, { headers: h() }).then(r => r.json()).then(d => { if (d.data) setBond(d.data) }).catch(() => {})
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
          {[{ l: 'BOND FACE', v: bond ? `$${(bond.series?.reduce((s: number, x: any) => s + (x.face_amount_usd || 0), 0) / 1e6).toFixed(0)}M` : '—' }, { l: 'UNITS', v: project.units || '—' }, { l: 'REFI CYCLES', v: '0' }, { l: 'AE ECONOMICS', v: bond ? `$${((bond.capital_stack?.arrangement_fee_usd || 0) / 1e6).toFixed(1)}M` : '—' }].map(k => (<div key={k.l} className="nest-kpi"><div className="nest-kpi-label">{k.l}</div><div className="nest-kpi-value">{k.v}</div></div>))}
        </div>
        {checklist && (<div className="nest-card">{Object.entries(checklist.checklist || {}).map(([key, val]) => (<div key={key} className="data-row"><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: val === true || val === 'approved' || val === 'executed' || val === 'delivered' ? '#2D6B3D' : val === 'not_started' || val === 'none' || val === false ? '#ef4444' : '#C4A048' }} /><span className="data-label">{key.replace(/_/g, ' ')}</span></div><span className="data-value" style={{ fontSize: 9, color: '#7A9A82' }}>{String(val)}</span></div>))}</div>)}
      </div>)}
      {tab === 1 && (<div className="nest-card"><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', marginBottom: 16 }}>JP MORGAN CREDIT BENCHMARKS</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{[['DSCR', 'A: >2.0x · BBB-: >1.5x'], ['LTV', 'A: <55% · BBB-: <70%'], ['D/EBITDA', 'A: <4.5x · BBB-: <6.5x'], ['ICR', 'A: >3.5x · BBB-: >2.25x']].map(([m, b]) => (<div key={m} className="nest-kpi"><div className="nest-kpi-label">{m}</div><div className="nest-kpi-value">—</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', marginTop: 4 }}>{b}</div></div>))}</div></div>)}
      {tab === 2 && bond && (<div><div style={{ display: 'flex', gap: 2, marginBottom: 20, height: 40 }}>{bond.series?.map((s: any) => (<div key={s.series_id} style={{ flex: s.face_amount_usd, background: s.label === 'A' ? '#C4A048' : '#7A9A82', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#030A06', fontWeight: 600 }}>Series {s.label} · ${(s.face_amount_usd / 1e6).toFixed(0)}M</span></div>))}</div><div className="nest-card">{Object.entries(bond.capital_stack || {}).map(([k, v]) => (<div key={k} className="data-row"><span className="data-label">{k.replace(/_/g, ' ')}</span><span className="data-value" style={{ color: '#C4A048' }}>${((v as number) / 1e6).toFixed(2)}M</span></div>))}</div></div>)}
      {tab === 3 && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>{agents.map(a => (<div key={a} className="nest-card-dark" style={{ textAlign: 'center', padding: '12px 8px' }}><div className="status-dot" style={{ background: ['Morgan', 'Aria', 'Sterling'].includes(a) ? '#2D6B3D' : '#2D4A35', margin: '0 auto 6px' }} /><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#EDE8DC' }}>{a}</div></div>))}</div><button onClick={generateMemo} disabled={generating} className="btn-gold" style={{ marginBottom: 16 }}>{generating ? 'Morgan is writing...' : 'Generate Executive Summary'}</button>{memo && (<div className="nest-card" style={{ border: '1px solid rgba(196,160,72,0.3)' }}><div style={{ fontSize: 13, color: '#EDE8DC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{memo}</div></div>)}</div>)}
    </div>
  )
}
