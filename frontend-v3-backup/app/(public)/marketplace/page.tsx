'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function MarketplacePage() {
  const [offerings, setOfferings] = useState<any[]>([])
  const [pipeline, setPipeline] = useState(0)

  useEffect(() => {
    fetch(`${API}/api/marketplace`).then(r => r.json()).then(d => {
      if (d.data) { setOfferings(d.data.offerings || []); setPipeline(d.data.total_pipeline_usd || 0) }
    }).catch(() => {})
    // Also fetch deals for preview
    fetch(`${API}/api/deals`).then(r => r.json()).then(d => {
      if (d.data && d.data.length > 0) {
        setOfferings(d.data.map((deal: any) => ({
          id: deal.id, name: deal.name, status: deal.status,
          asset_type: deal.project?.asset_type || 'other',
          city: deal.project?.city || '', state: deal.project?.state || '',
          total_project_cost_usd: deal.project?.total_project_cost_usd || 0,
          bond_face_usd: deal.project?.total_project_cost_usd * 0.75 || 0,
          readiness_score: deal.readiness_score || 0,
          description: deal.project?.description || '',
        })))
        setPipeline(d.data.reduce((s: number, x: any) => s + (x.project?.total_project_cost_usd || 0), 0))
      }
    }).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#030A06', minHeight: '100vh', color: '#EDE8DC' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(3,10,6,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(196,160,72,0.2)', padding: '14px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: '#C4A048', letterSpacing: '.14em' }}>NEST</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginLeft: 10 }}>Marketplace</span>
        </Link>
        <Link href="/login"><button style={{ background: 'rgba(196,160,72,0.1)', border: '1px solid rgba(196,160,72,0.25)', color: '#C4A048', padding: '7px 16px', borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Investor Login</button></Link>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 52px 60px', textAlign: 'center', background: 'radial-gradient(ellipse 80% 50% at 50% 40%, #0D2218 0%, #030A06 70%)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
          <span style={{ width: 48, height: 1, background: 'rgba(196,160,72,0.2)', display: 'block' }} />Active Bond Offerings<span style={{ width: 48, height: 1, background: 'rgba(196,160,72,0.2)', display: 'block' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, fontWeight: 300, color: '#EDE8DC', marginBottom: 12 }}>Bond Marketplace</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: '#C4A048', fontWeight: 500 }}>${(pipeline / 1e6).toFixed(0)}M</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>Total Pipeline</div>
      </section>

      {/* Offerings */}
      <section style={{ padding: '40px 52px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          {offerings.map(d => (
            <div key={d.id} style={{ background: '#0D2218', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 8, padding: '28px 24px', transition: 'border-color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(196,160,72,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(196,160,72,0.2)')}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>{d.asset_type?.replace(/_/g, ' ')} · {d.city}, {d.state}</div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#EDE8DC', fontWeight: 400, marginBottom: 6 }}>{d.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: '#C4A048', fontWeight: 500, marginBottom: 12 }}>${((d.bond_face_usd || d.total_project_cost_usd * 0.75) / 1e6).toFixed(0)}M</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <span className="tag-green">{d.status}</span>
                <span className="tag-gold">Surety Wrapped</span>
              </div>
              <div style={{ fontSize: 11, color: '#7A9A82', lineHeight: 1.6, marginBottom: 16 }}>{d.description}</div>
              <div style={{ background: 'rgba(3,10,6,0.6)', borderRadius: 3, height: 4, marginBottom: 4 }}><div style={{ width: `${d.readiness_score || 20}%`, height: '100%', background: 'linear-gradient(90deg, #2D6B3D, #C4A048)', borderRadius: 3 }} /></div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', textAlign: 'right' }}>Readiness: {d.readiness_score || 0}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fund Section */}
      <section style={{ padding: '60px 52px', background: '#060E1A', borderTop: '1px solid rgba(196,160,72,0.15)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, color: '#EDE8DC', marginBottom: 8 }}>NEST Origination Fund I</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 24 }}>AEC Token · ERC-1400 · Reg D 506(c)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            <div className="nest-kpi"><div className="nest-kpi-label">MIN INVESTMENT</div><div className="nest-kpi-value">$100K</div></div>
            <div className="nest-kpi"><div className="nest-kpi-label">TARGET RETURN</div><div className="nest-kpi-value">15-25%</div></div>
            <div className="nest-kpi"><div className="nest-kpi-label">CURRENT AUM</div><div className="nest-kpi-value">$32.4M</div></div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer style={{ padding: '32px 52px', borderTop: '1px solid rgba(196,160,72,0.1)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', lineHeight: 1.7, maxWidth: 700 }}>
          This material does not constitute an offer to sell or solicitation of an offer to buy any security. All offerings made pursuant to Rule 144A and/or Regulation D Rule 506(c) under the Securities Act of 1933. Available to accredited investors and qualified institutional buyers only. Past performance does not guarantee future results. NEST Advisors is not a registered investment adviser. Arden Edge Capital × Soparrow Capital.
        </p>
      </footer>
    </div>
  )
}
