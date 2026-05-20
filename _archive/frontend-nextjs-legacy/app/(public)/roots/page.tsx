'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── TYPES ──────────────────────────────────────────────────
interface ReadinessItem {
  item: string
  status: 'complete' | 'in_progress' | 'pending'
}

interface Offering {
  id: string
  name: string
  asset_type: string
  city: string
  state: string
  structure: string
  description: string
  total_raise_usd: number
  a_tranche_usd: number
  b_tranche_usd: number
  a_coupon_pct: number
  b_coupon_pct: number
  ltv_pct: number
  dscr: number
  grade_target: string
  surety_provider: string
  minimum_investment_usd: number
  equity_available_pct: number
  nest_arrangement_fee_pct: number
  bond_ready: boolean
  bond_readiness_pct: number
  bond_readiness_items: ReadinessItem[]
  investor_types: string[]
}

interface InterestForm {
  name: string
  email: string
  investor_type: string
  investment_amount_usd: string
  notes: string
  accredited: boolean
}

interface SubmitForm {
  contact_name: string
  contact_email: string
  contact_phone: string
  project_name: string
  asset_type: string
  city: string
  state: string
  loan_amount_usd: string
  description: string
  broker_company: string
  relationship: string
  current_stage: string
}

// ── STYLES ─────────────────────────────────────────────────
const S = {
  void: '#030A06',
  forest: '#0D2218',
  green: '#1E4A2E',
  gold: '#C4A048',
  goldBorder: 'rgba(196,160,72,0.2)',
  goldDim: 'rgba(196,160,72,0.08)',
  sage: '#7A9A82',
  moss: '#2D4A35',
  cream: '#EDE8DC',
  alert: '#EF4444',
  navy: '#060E1A',
}

const card: React.CSSProperties = {
  background: S.forest,
  border: `0.5px solid ${S.goldBorder}`,
  borderRadius: 8,
  padding: 24,
  marginBottom: 16,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(3,10,6,0.8)',
  border: `0.5px solid ${S.goldBorder}`,
  borderRadius: 4,
  padding: '10px 14px',
  color: S.cream,
  fontSize: 13,
  fontFamily: 'var(--font-space, system-ui)',
  outline: 'none',
  marginBottom: 12,
  boxSizing: 'border-box',
}

const btnGold: React.CSSProperties = {
  background: S.gold,
  color: S.void,
  padding: '10px 24px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-space, system-ui)',
  transition: 'background .15s',
}

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: S.sage,
  border: `1px solid ${S.goldBorder}`,
  padding: '8px 18px',
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'var(--font-space, system-ui)',
}

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 9,
  color: S.moss,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  marginBottom: 8,
}

// ── COMPONENT ──────────────────────────────────────────────
export default function TheRoots() {
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'offerings' | 'submit' | 'broker'>('offerings')
  const [expandedOffering, setExpandedOffering] = useState<string | null>(null)
  const [interestSuccess, setInterestSuccess] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [interestForm, setInterestForm] = useState<InterestForm>({
    name: '', email: '', investor_type: 'family_office',
    investment_amount_usd: '', notes: '', accredited: false,
  })

  const [submitForm, setSubmitForm] = useState<SubmitForm>({
    contact_name: '', contact_email: '', contact_phone: '',
    project_name: '', asset_type: '', city: '', state: '',
    loan_amount_usd: '', description: '', broker_company: '',
    relationship: '', current_stage: '',
  })

  // ── FETCH OFFERINGS ──────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/roots/offerings`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        if (d.success) setOfferings(d.data)
        else setError('Could not load offerings')
      })
      .catch(e => setError(`Connection error: ${e.message}`))
      .finally(() => setLoading(false))
  }, [])

  // ── SUBMIT INTEREST ──────────────────────────────────────
  const handleInterest = async (offeringId: string) => {
    if (!interestForm.name || !interestForm.email) {
      alert('Name and email required')
      return
    }
    if (!interestForm.accredited) {
      alert('You must certify accredited investor status to proceed')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/roots/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offering_id: offeringId,
          ...interestForm,
          investment_amount_usd: parseInt(interestForm.investment_amount_usd) || 0,
        }),
      })
      const data = await res.json()
      if (data.success || data.data?.success) {
        setInterestSuccess(offeringId)
        setExpandedOffering(null)
      } else {
        alert(data.error || 'Error submitting interest')
      }
    } catch {
      alert('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── SUBMIT DEAL ───────────────────────────────────────────
  const handleSubmitDeal = async () => {
    const required = ['contact_name', 'contact_email', 'project_name',
                      'asset_type', 'city', 'state', 'loan_amount_usd'] as const
    const missing = required.filter(f => !submitForm[f])
    if (missing.length) {
      alert(`Please fill in: ${missing.join(', ')}`)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/roots/submit-deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submitForm,
          loan_amount_usd: parseInt(submitForm.loan_amount_usd) || 0,
        }),
      })
      const data = await res.json()
      if (data.success || data.data?.success) {
        setSubmitSuccess(true)
      } else {
        alert(data.error || 'Error submitting deal')
      }
    } catch {
      alert('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── HELPERS ───────────────────────────────────────────────
  const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`
  const fmtK = (n: number) => n >= 1_000_000 ? fmt(n) : `$${(n / 1_000).toFixed(0)}K`

  const statusColor = (s: string) =>
    s === 'complete' ? S.sage : s === 'in_progress' ? S.gold : '#333'
  const statusIcon = (s: string) =>
    s === 'complete' ? '\u2713' : s === 'in_progress' ? '\u25D0' : '\u25CB'

  const tabs = [
    { id: 'offerings' as const, label: 'Active Offerings' },
    { id: 'submit' as const, label: 'Submit a Deal' },
    { id: 'broker' as const, label: 'Broker & Partners' },
  ]

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ background: S.void, minHeight: '100vh', color: S.cream,
                  fontFamily: 'var(--font-space, system-ui)' }}>

      {/* NAV */}
      <nav style={{
        background: 'rgba(3,10,6,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${S.goldBorder}`,
        padding: '14px 48px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                        fontSize: 22, color: S.gold, letterSpacing: '.14em' }}>
            NEST
          </div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 8, color: S.moss, letterSpacing: '.1em',
                        textTransform: 'uppercase' }}>
            Arden Edge Capital &times; Soparrow Capital
          </div>
        </Link>

        <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                      fontSize: 28, color: S.cream, fontStyle: 'italic',
                      letterSpacing: '.06em' }}>
          The Roots
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={btnOutline}>&larr; Platform</button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={btnOutline}>Partner Login</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        textAlign: 'center', padding: '56px 48px 0',
        borderBottom: `1px solid rgba(196,160,72,0.08)`,
      }}>
        <div style={{ ...monoLabel, display: 'flex', alignItems: 'center',
                      gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ width: 48, height: 1,
                         background: S.goldBorder, display: 'block' }}/>
          Where Capital Meets Structure
          <span style={{ width: 48, height: 1,
                         background: S.goldBorder, display: 'block' }}/>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                     fontSize: 'clamp(40px,6vw,64px)', fontWeight: 300,
                     color: S.cream, marginBottom: 12, lineHeight: 1.1 }}>
          The <span style={{ color: S.gold }}>Roots</span> Marketplace
        </h1>

        <p style={{ fontSize: 14, color: S.sage, maxWidth: 580,
                    margin: '0 auto 36px', lineHeight: 1.9, fontWeight: 300 }}>
          NEST arranges private bonds for institutional-quality real estate.
          Investors find yield. Developers find capital. Brokers find arrangement.
          Every deal here is in active NEST structuring.
        </p>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center',
                      paddingBottom: 0 }}>
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id
                  ? 'rgba(196,160,72,0.1)' : 'transparent',
                color: activeTab === tab.id ? S.gold : S.sage,
                border: `1px solid ${activeTab === tab.id
                  ? 'rgba(196,160,72,0.3)' : 'rgba(196,160,72,0.1)'}`,
                padding: '8px 20px', borderRadius: '4px 4px 0 0',
                fontSize: 11, fontWeight: 500, letterSpacing: '.06em',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'var(--font-space, system-ui)',
                borderBottom: activeTab === tab.id
                  ? `1px solid ${S.void}` : undefined,
                marginBottom: activeTab === tab.id ? -1 : 0,
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>

        {/* ── TAB 1: OFFERINGS ── */}
        {activeTab === 'offerings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 24 }}>
              <div style={monoLabel}>
                {offerings.length} active offering{offerings.length !== 1 ? 's' : ''}
                {' \u00B7 '}All in NEST bond arrangement process
              </div>
              <div style={monoLabel}>
                Accredited investors only &middot; Reg D 506(c)
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: 80, color: S.moss,
                            fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>
                Loading offerings...
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 6, padding: '12px 16px',
                            color: S.alert, fontSize: 12, marginBottom: 16,
                            fontFamily: 'var(--font-mono, monospace)' }}>
                {error}
              </div>
            )}

            {offerings.map(o => (
              <div key={o.id} style={card}>
                <div style={{ display: 'grid',
                              gridTemplateColumns: '1fr 280px', gap: 32 }}>

                  {/* LEFT */}
                  <div>
                    {/* BADGES */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14,
                                  flexWrap: 'wrap' }}>
                      {[
                        { label: o.asset_type.toUpperCase(), color: S.gold,
                          bg: S.goldDim },
                        { label: o.grade_target, color: S.sage,
                          bg: 'rgba(122,154,130,0.1)' },
                        { label: o.surety_provider, color: S.sage,
                          bg: 'rgba(122,154,130,0.1)' },
                        ...(!o.bond_ready ? [{ label: 'Equity Co-Investment Available',
                          color: S.gold, bg: S.goldDim }] : []),
                        ...(o.bond_ready ? [{ label: 'Bond Ready',
                          color: S.sage, bg: 'rgba(45,107,61,0.15)' }] : []),
                      ].map((b, i) => (
                        <span key={i} style={{
                          background: b.bg, color: b.color,
                          fontSize: 9, padding: '3px 8px', borderRadius: 4,
                          fontFamily: 'var(--font-mono, monospace)',
                          letterSpacing: '.04em',
                        }}>
                          {b.label}
                        </span>
                      ))}
                    </div>

                    {/* TITLE */}
                    <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                                  fontSize: 26, color: S.cream, marginBottom: 4 }}>
                      {o.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)',
                                  fontSize: 10, color: S.moss, marginBottom: 12 }}>
                      {o.city}, {o.state} &middot; {o.structure}
                    </div>
                    <p style={{ fontSize: 12, color: S.sage,
                                lineHeight: 1.85, marginBottom: 20 }}>
                      {o.description}
                    </p>

                    {/* BOND READINESS */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                                    marginBottom: 6 }}>
                        <div style={monoLabel}>Bond Readiness</div>
                        <div style={{ fontFamily: 'var(--font-mono, monospace)',
                                      fontSize: 9, color: S.gold }}>
                          {o.bond_readiness_pct}%
                        </div>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 2, overflow: 'hidden',
                                    marginBottom: 10 }}>
                        <div style={{ height: '100%',
                                      width: `${o.bond_readiness_pct}%`,
                                      background: S.gold, borderRadius: 2 }}/>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {o.bond_readiness_items?.map(item => (
                          <div key={item.item}
                               style={{ display: 'flex', alignItems: 'center',
                                        gap: 5, fontFamily: 'var(--font-mono, monospace)',
                                        fontSize: 9 }}>
                            <span style={{ color: statusColor(item.status) }}>
                              {statusIcon(item.status)}
                            </span>
                            <span style={{ color: statusColor(item.status) }}>
                              {item.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — METRICS */}
                  <div>
                    <div style={{ background: 'rgba(3,10,6,0.6)',
                                  borderRadius: 6, padding: 16, marginBottom: 12 }}>
                      {[
                        { l: 'Total Raise', v: fmt(o.total_raise_usd) },
                        { l: 'Series A', v: `${fmt(o.a_tranche_usd)} @ ${o.a_coupon_pct}%` },
                        { l: 'Series B', v: `${fmt(o.b_tranche_usd)} @ ${o.b_coupon_pct}%` },
                        { l: 'LTV', v: `${o.ltv_pct}%`,
                          color: o.ltv_pct > 75 ? S.alert : S.gold },
                        { l: 'DSCR', v: `${o.dscr}\u00D7`,
                          color: o.dscr >= 1.5 ? S.sage : o.dscr >= 1.2 ? S.gold : S.alert },
                        { l: 'Min. Investment', v: fmtK(o.minimum_investment_usd) },
                        { l: 'Equity Co-Invest', v: `${o.equity_available_pct}%` },
                        { l: 'NEST Arrangement', v: `${o.nest_arrangement_fee_pct}%` },
                      ].map(m => (
                        <div key={m.l} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '5px 0',
                          borderBottom: '0.5px solid rgba(196,160,72,0.06)',
                          fontSize: 11,
                        }}>
                          <span style={{ color: S.sage }}>{m.l}</span>
                          <span style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 500,
                            color: m.color || S.gold,
                          }}>
                            {m.v}
                          </span>
                        </div>
                      ))}
                    </div>

                    {interestSuccess === o.id ? (
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                                      fontSize: 18, color: S.gold, marginBottom: 4 }}>
                          Interest Received.
                        </div>
                        <div style={{ fontSize: 11, color: S.sage }}>
                          Sterling will contact you within 24 hours.
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setExpandedOffering(
                            expandedOffering === o.id ? null : o.id)}
                          style={{ ...btnGold, width: '100%', marginBottom: 8 }}>
                          {expandedOffering === o.id ? 'Close' : 'Express Interest'}
                        </button>
                        <div style={{ fontFamily: 'var(--font-mono, monospace)',
                                      fontSize: 8, color: S.moss,
                                      textAlign: 'center', lineHeight: 1.6 }}>
                          Accredited investors only.
                          Not an offer to sell securities.
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* INTEREST FORM */}
                {expandedOffering === o.id && interestSuccess !== o.id && (
                  <div style={{ borderTop: `1px solid rgba(196,160,72,0.1)`,
                                marginTop: 24, paddingTop: 24 }}>
                    <div style={monoLabel}>
                      Register Investor Interest &mdash; {o.name}
                    </div>
                    <div style={{ display: 'grid',
                                  gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input style={inputStyle} placeholder="Full name *"
                        value={interestForm.name}
                        onChange={e => setInterestForm(
                          { ...interestForm, name: e.target.value })}/>
                      <input style={inputStyle} placeholder="Email address *"
                        value={interestForm.email}
                        onChange={e => setInterestForm(
                          { ...interestForm, email: e.target.value })}/>
                      <select style={inputStyle}
                        value={interestForm.investor_type}
                        onChange={e => setInterestForm(
                          { ...interestForm, investor_type: e.target.value })}>
                        <option value="family_office">Family Office</option>
                        <option value="private_equity">Private Equity Fund</option>
                        <option value="hnw_individual">High Net Worth Individual</option>
                        <option value="institutional">Institutional Investor</option>
                        <option value="reit">REIT</option>
                        <option value="broker_dealer">Broker Dealer</option>
                      </select>
                      <input style={inputStyle}
                        placeholder="Investment amount (e.g. 500000)"
                        value={interestForm.investment_amount_usd}
                        onChange={e => setInterestForm(
                          { ...interestForm, investment_amount_usd: e.target.value })}/>
                    </div>
                    <textarea style={{ ...inputStyle, height: 70, resize: 'none' }}
                      placeholder="Any questions or notes (optional)"
                      value={interestForm.notes}
                      onChange={e => setInterestForm(
                        { ...interestForm, notes: e.target.value })}/>
                    <div style={{ display: 'flex', alignItems: 'flex-start',
                                  gap: 10, marginBottom: 16, fontSize: 11,
                                  color: S.sage, lineHeight: 1.7 }}>
                      <input type="checkbox"
                        checked={interestForm.accredited}
                        onChange={e => setInterestForm(
                          { ...interestForm, accredited: e.target.checked })}
                        style={{ marginTop: 3, accentColor: S.gold,
                                 flexShrink: 0 }}/>
                      <span>
                        I certify that I am an accredited investor as defined by
                        SEC Rule 501 of Regulation D and meet the definition of
                        a qualified purchaser under the Investment Company Act of 1940.
                      </span>
                    </div>
                    <button
                      onClick={() => handleInterest(o.id)}
                      disabled={submitting}
                      style={{ ...btnGold,
                               opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Submitting...' : 'Submit Interest to NEST'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!loading && offerings.length === 0 && !error && (
              <div style={{ textAlign: 'center', padding: 80,
                            color: S.moss, fontFamily: 'var(--font-mono, monospace)',
                            fontSize: 12 }}>
                No active offerings at this time. Check back shortly
                or submit your deal for consideration.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SUBMIT DEAL ── */}
        {activeTab === 'submit' && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                          fontSize: 36, fontWeight: 400, color: S.cream,
                          marginBottom: 10 }}>
              Submit a Deal to NEST
            </div>
            <p style={{ fontSize: 13, color: S.sage, lineHeight: 1.9,
                        marginBottom: 32, fontWeight: 300 }}>
              NEST reviews all submissions within 48 hours.
              If your project meets our criteria we will contact you directly.
              We work with developers, sponsors, and brokers at every stage &mdash;
              from pre-application through bond-ready.
            </p>

            {submitSuccess ? (
              <div style={{ ...card, textAlign: 'center', padding: 60 }}>
                <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                              fontSize: 36, color: S.gold, marginBottom: 12 }}>
                  Deal Received.
                </div>
                <div style={{ fontSize: 13, color: S.sage, lineHeight: 1.9 }}>
                  NEST will review your submission within 48 hours.<br/>
                  If your deal fits our structure, we will contact you directly.<br/>
                  We arrange bonds. We place capital. We get deals done.
                </div>
              </div>
            ) : (
              <div style={card}>
                <div style={monoLabel}>Project Information</div>

                <div style={{ display: 'grid',
                              gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input style={inputStyle} placeholder="Your name *"
                    value={submitForm.contact_name}
                    onChange={e => setSubmitForm(
                      { ...submitForm, contact_name: e.target.value })}/>
                  <input style={inputStyle} placeholder="Email address *"
                    value={submitForm.contact_email}
                    onChange={e => setSubmitForm(
                      { ...submitForm, contact_email: e.target.value })}/>
                </div>

                <input style={inputStyle} placeholder="Phone (optional)"
                  value={submitForm.contact_phone}
                  onChange={e => setSubmitForm(
                    { ...submitForm, contact_phone: e.target.value })}/>

                <input style={inputStyle} placeholder="Project name *"
                  value={submitForm.project_name}
                  onChange={e => setSubmitForm(
                    { ...submitForm, project_name: e.target.value })}/>

                <div style={{ display: 'grid',
                              gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
                  <select style={inputStyle}
                    value={submitForm.asset_type}
                    onChange={e => setSubmitForm(
                      { ...submitForm, asset_type: e.target.value })}>
                    <option value="">Asset type *</option>
                    {['Senior Living','Multifamily','Industrial','Mixed Use',
                      'Hospitality','Office','Retail','Healthcare',
                      'Land','Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input style={inputStyle} placeholder="City *"
                    value={submitForm.city}
                    onChange={e => setSubmitForm(
                      { ...submitForm, city: e.target.value })}/>
                  <input style={inputStyle} placeholder="ST *"
                    value={submitForm.state} maxLength={2}
                    onChange={e => setSubmitForm(
                      { ...submitForm, state: e.target.value.toUpperCase() })}/>
                </div>

                <input style={inputStyle}
                  placeholder="Loan amount needed ($) *"
                  value={submitForm.loan_amount_usd}
                  onChange={e => setSubmitForm(
                    { ...submitForm, loan_amount_usd: e.target.value })}/>

                <input style={inputStyle}
                  placeholder="Company or brokerage (if applicable)"
                  value={submitForm.broker_company}
                  onChange={e => setSubmitForm(
                    { ...submitForm, broker_company: e.target.value })}/>

                <div style={{ display: 'grid',
                              gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select style={inputStyle}
                    value={submitForm.relationship}
                    onChange={e => setSubmitForm(
                      { ...submitForm, relationship: e.target.value })}>
                    <option value="">Your role in this deal</option>
                    <option value="developer">Developer / Sponsor</option>
                    <option value="broker">Broker representing sponsor</option>
                    <option value="investor">Investor seeking structure</option>
                    <option value="lender">Lender seeking co-arrangement</option>
                    <option value="attorney">Real estate attorney</option>
                    <option value="other">Other</option>
                  </select>
                  <select style={inputStyle}
                    value={submitForm.current_stage}
                    onChange={e => setSubmitForm(
                      { ...submitForm, current_stage: e.target.value })}>
                    <option value="">Current stage</option>
                    <option value="concept">Concept / pre-application</option>
                    <option value="site_control">Site control</option>
                    <option value="entitlements">Entitlements in process</option>
                    <option value="ready_to_permit">Ready to permit</option>
                    <option value="under_construction">Under construction</option>
                    <option value="stabilizing">Stabilizing</option>
                    <option value="refinance">Refinance of existing</option>
                  </select>
                </div>

                <textarea
                  style={{ ...inputStyle, height: 100, resize: 'none' }}
                  placeholder="Brief description — what stage is it at? What have you tried? What do you need from NEST?"
                  value={submitForm.description}
                  onChange={e => setSubmitForm(
                    { ...submitForm, description: e.target.value })}/>

                <button onClick={handleSubmitDeal}
                  disabled={submitting}
                  style={{ ...btnGold, width: '100%',
                           opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit to NEST for Review'}
                </button>

                <div style={{ fontFamily: 'var(--font-mono, monospace)',
                              fontSize: 8, color: S.moss,
                              textAlign: 'center', marginTop: 12,
                              lineHeight: 1.7 }}>
                  NEST reviews all submissions within 48 hours.
                  Submission does not constitute engagement or commitment.
                  All information treated as confidential.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: BROKER & PARTNERS ── */}
        {activeTab === 'broker' && (
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                          fontSize: 36, color: S.cream, marginBottom: 10 }}>
              Broker &amp; Partner Network
            </div>
            <p style={{ fontSize: 13, color: S.sage, lineHeight: 1.9,
                        marginBottom: 36, fontWeight: 300 }}>
              NEST works with brokers, placement agents, and capital market
              intermediaries who bring institutional-quality deals.
              You bring the deal. We arrange the bond structure.
              Your client, your relationship. We are the arranger behind you.
            </p>

            <div style={{ display: 'grid',
                          gridTemplateColumns: '1fr 1fr', gap: 12,
                          marginBottom: 32 }}>
              {[
                { title: 'You bring the deal.',
                  body: 'We review within 48 hours. If it fits our bond arrangement criteria, we engage. Simple as that.' },
                { title: 'We structure it.',
                  body: 'Dual-tranche private bond, Hylant surety, lender placement, credit memo, risk assessment. Full packaging.' },
                { title: 'You stay in the deal.',
                  body: 'Your client. Your relationship. NEST is the arranger. You are the originator. That never changes.' },
                { title: 'We split the arrangement fee.',
                  body: 'Standard co-arrangement economics. Disclosed to all parties. Clean. No surprises.' },
              ].map(item => (
                <div key={item.title} style={card}>
                  <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                                fontSize: 20, color: S.gold, marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: S.sage,
                                lineHeight: 1.85 }}>
                    {item.body}
                  </div>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={monoLabel}>Start a conversation with NEST</div>
              <div style={{ display: 'grid',
                            gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input style={inputStyle} placeholder="Your name"/>
                <input style={inputStyle} placeholder="Your email"/>
                <input style={inputStyle} placeholder="Your firm"/>
                <select style={inputStyle}>
                  <option value="">I am a...</option>
                  <option>Commercial Mortgage Broker</option>
                  <option>Investment Banker</option>
                  <option>Placement Agent</option>
                  <option>Real Estate Attorney</option>
                  <option>Developer seeking arrangement</option>
                  <option>Capital markets consultant</option>
                  <option>Insurance / Surety broker</option>
                </select>
              </div>
              <textarea
                style={{ ...inputStyle, height: 80, resize: 'none' }}
                placeholder="What deals are you working on? What do you need NEST to do?"/>
              <button style={{ ...btnGold, width: '100%' }}>
                Connect with NEST
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: `1px solid rgba(196,160,72,0.1)`,
        padding: '32px 48px', marginTop: 60,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant, Georgia)',
                        fontSize: 18, color: S.gold, letterSpacing: '.12em',
                        marginBottom: 4 }}>
            NEST &middot; The Roots
          </div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 8, color: S.moss, letterSpacing: '.08em' }}>
            Arden Edge Capital &times; Soparrow Capital
          </div>
        </div>
        <div style={{ fontSize: 9, color: S.moss,
                      fontFamily: 'var(--font-mono, monospace)',
                      maxWidth: 520, lineHeight: 1.7 }}>
          All offerings made pursuant to exemptions under the Securities Act of 1933.
          Accredited investors and qualified institutional buyers only.
          This is not an offer to sell or solicitation of any security.
          NEST Advisors is not a registered investment adviser or broker-dealer.
        </div>
      </div>
    </div>
  )
}
