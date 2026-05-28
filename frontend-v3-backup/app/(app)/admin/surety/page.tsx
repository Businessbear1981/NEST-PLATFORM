'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function SuretyPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [premium, setPremium] = useState<any>(null)
  const [deskAgents, setDeskAgents] = useState<any[]>([])
  const [counterparties, setCounterparties] = useState<any>({})
  const [activeTab, setActiveTab] = useState<'calculator' | 'providers' | 'counterparties' | 'agents'>('calculator')
  const [bondFace, setBondFace] = useState('173000000')
  const [rating, setRating] = useState('A')
  const [assetType, setAssetType] = useState('senior_living')
  const [state, setState] = useState('FL')

  useEffect(() => {
    fetch(`${API}/api/surety/providers`).then(r => r.json()).then(d => { if (d.data) setProviders(d.data) }).catch(() => {})
    fetch(`${API}/api/desks/enhancement/agents`).then(r => r.json()).then(d => { if (d.success) setDeskAgents(d.data) }).catch(() => {})
    fetch(`${API}/api/counterparties/bond_insurer`).then(r => r.json()).then(d => { if (d.success) setCounterparties((prev: any) => ({ ...prev, insurers: d.data.counterparties })) }).catch(() => {})
    fetch(`${API}/api/counterparties/loc_bank`).then(r => r.json()).then(d => { if (d.success) setCounterparties((prev: any) => ({ ...prev, loc_banks: d.data.counterparties })) }).catch(() => {})
  }, [])

  async function calcPremium() {
    const r = await fetch(`${API}/api/surety/premium`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bond_face_usd: parseInt(bondFace), rating_target: rating, asset_type: assetType, state, duration_years: 5, dscr: 1.7, ltv_pct: 65 }) })
    const d = await r.json()
    if (d.data) setPremium(d.data)
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Insurance, Surety & Credit Enhancement Desk</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 0' }}>Enhancement Command</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginTop: 4 }}>LOC · Bond Insurance · Surety · Federal Guarantee (FHA/USDA/GNMA)</p>
      </div>

      {/* Desk Agent Roster */}
      {deskAgents.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {deskAgents.map((a: any, i: number) => (
            <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 4, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#EDE8DC' }}>{a.name}</span>
              <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: a.agent_file ? '#2D6B3D' : '#7A9A82', background: a.agent_file ? 'rgba(45,107,61,0.15)' : 'rgba(122,154,130,0.1)', padding: '1px 4px', borderRadius: 2 }}>{a.agent_file ? 'WIRED' : 'PENDING'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid rgba(196,160,72,0.1)', paddingBottom: 6 }}>
        {(['calculator', 'providers', 'counterparties', 'agents'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ background: activeTab === t ? 'rgba(196,160,72,0.12)' : 'transparent', border: 'none', color: activeTab === t ? '#C4A048' : '#7A9A82', padding: '5px 12px', fontSize: 9, fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: activeTab === t ? '2px solid #C4A048' : '2px solid transparent' }}>
            {t === 'calculator' ? 'Premium Calc' : t === 'providers' ? 'Providers' : t === 'counterparties' ? 'Bond Insurers & LOC Banks' : 'Desk Agents'}
          </button>
        ))}
      </div>

      {/* Calculator */}
      {activeTab === 'calculator' && <>
      <div className="nest-card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Premium Calculator</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: 12, alignItems: 'flex-end' }}>
          {[
            { label: 'Bond Face ($)', value: bondFace, onChange: setBondFace, type: 'number' },
            { label: 'Rating Target', value: rating, onChange: setRating, options: ['AAA', 'AA', 'A', 'BBB_plus', 'BBB', 'BBB_minus'] },
            { label: 'Asset Type', value: assetType, onChange: setAssetType, options: ['senior_living', 'industrial', 'multifamily', 'mixed_use', 'office'] },
            { label: 'State', value: state, onChange: setState, options: ['FL', 'TX', 'CA', 'NY', 'WA', 'OR'] },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</label>
              {f.options ? (
                <select value={f.value} onChange={e => f.onChange(e.target.value)} style={{ width: '100%', background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 10px', color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                  {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} value={f.value} onChange={e => f.onChange(e.target.value)} style={{ width: '100%', background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 10px', color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              )}
            </div>
          ))}
          <button onClick={calcPremium} className="btn-gold">Calculate</button>
        </div>
      </div>

      {/* Premium Results */}
      {premium && (
        <div className="nest-card" style={{ marginBottom: 20, border: '1px solid rgba(196,160,72,0.3)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Premium Analysis — Recommended: {premium.recommended_product?.replace(/_/g, ' ')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {Object.entries(premium.options || {}).map(([key, opt]: [string, any]) => (
              <div key={key} className="nest-kpi" style={{ border: key === premium.recommended_product ? '1px solid rgba(196,160,72,0.4)' : '1px solid rgba(196,160,72,0.08)' }}>
                <div className="nest-kpi-label">{key.replace(/_/g, ' ')}</div>
                <div className="nest-kpi-value">{opt.adjusted_rate_bps}bps</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', marginTop: 4 }}>${(opt.annual_premium_usd / 1e6).toFixed(2)}M/yr</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', marginTop: 2 }}>${(opt.total_premium_usd / 1e6).toFixed(2)}M total</div>
              </div>
            ))}
          </div>
          <div className="nest-card-dark">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', marginBottom: 6 }}>LC Phase Savings</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7A9A82' }}>
              Current surety: ${((premium.lc_phase_savings?.current_surety_annual || 0) / 1e6).toFixed(2)}M/yr → LC phase: ${((premium.lc_phase_savings?.lc_phase_annual || 0) / 1e6).toFixed(2)}M/yr · Saves ${((premium.lc_phase_savings?.annual_savings || 0) / 1e3).toFixed(0)}K/yr when AUM &gt; $40M
            </div>
          </div>
        </div>
      )}

      </>}

      {/* Provider Cards */}
      {activeTab === 'providers' && <div className="nest-card">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Insurance & Surety Providers · {providers.length} firms</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {providers.map((p: any) => (
            <div key={p.id || p.name} className="nest-card-dark">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#EDE8DC' }}>{p.name}</div>
                <span style={{ background: p.relationship_status === 'partner' ? 'rgba(196,160,72,0.15)' : 'rgba(122,154,130,0.15)', color: p.relationship_status === 'partner' ? '#C4A048' : '#7A9A82', padding: '2px 8px', borderRadius: 3, fontSize: 8, fontFamily: 'var(--font-mono)' }}>{p.relationship_status}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', marginBottom: 8 }}>{(p.type || '').replace(/_/g, ' ').toUpperCase()}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {(p.products || p.specialties || []).slice(0, 3).map((prod: string) => (
                  <span key={prod} className="tag-green">{prod.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                <span style={{ color: '#C4A048' }}>{p.typical_premium_bps}bps</span>
                <span style={{ color: '#7A9A82' }}>{p.turnaround_days} days</span>
              </div>
              {p.strengths && <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', lineHeight: 1.5 }}>{p.strengths[0]}</div>}
              <button className="btn-outline" style={{ width: '100%', marginTop: 10, fontSize: 8, padding: '5px 0' }}>Generate Outreach</button>
            </div>
          ))}
        </div>
      </div>}

      {/* Counterparties from Appendix E */}
      {activeTab === 'counterparties' && (
        <div>
          {counterparties.insurers && (
            <div className="nest-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Bond Insurers (Active)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {counterparties.insurers.map((cp: any, i: number) => (
                  <div key={i} className="nest-card-dark" style={{ padding: 12 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#EDE8DC', marginBottom: 4 }}>{cp.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C4A048' }}>Rating: {cp.rating}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', marginTop: 4 }}>{cp.specialty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {counterparties.loc_banks && (
            <div className="nest-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>LOC-Providing Banks</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {counterparties.loc_banks.map((cp: any, i: number) => (
                  <div key={i} className="nest-card-dark" style={{ padding: 12 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#EDE8DC', marginBottom: 4 }}>{cp.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C4A048' }}>S/T Rating: {cp.st_rating}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', marginTop: 4 }}>{cp.specialty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desk Agents Detail */}
      {activeTab === 'agents' && (
        <div className="nest-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Enhancement Desk — Agent Roster (Operating Framework §4.10)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
            {deskAgents.map((a: any, i: number) => (
              <div key={i} className="nest-card-dark" style={{ padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#EDE8DC', fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', lineHeight: 1.5 }}>{a.role}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: a.agent_file ? '#2D6B3D' : '#7A9A82', background: a.agent_file ? 'rgba(45,107,61,0.15)' : 'rgba(122,154,130,0.1)', padding: '2px 6px', borderRadius: 2 }}>{a.agent_file ? `WIRED: ${a.agent_file}` : 'PENDING IMPLEMENTATION'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
