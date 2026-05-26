'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

/* ── NAICS Sector Map ──────────────────────────────────────── */
const SECTORS = [
  { value: 'software_saas', label: 'Software / SaaS', naics: '511210' },
  { value: 'healthcare_services', label: 'Healthcare Services', naics: '621' },
  { value: 'business_services', label: 'Business Services', naics: '561' },
  { value: 'industrial_manufacturing', label: 'Industrial Manufacturing', naics: '31-33' },
  { value: 'distribution', label: 'Distribution', naics: '423' },
  { value: 'consumer_products', label: 'Consumer Products', naics: '311-316' },
  { value: 'trucking_logistics', label: 'Trucking & Logistics', naics: '484' },
  { value: 'specialty_contractors', label: 'Specialty Contractors', naics: '238' },
  { value: 'energy_services', label: 'Energy Services', naics: '213' },
  { value: 'financial_services', label: 'Financial Services', naics: '523' },
  { value: 'senior_living', label: 'Senior Living / CCRC', naics: '623311' },
  { value: 'hospitality', label: 'Hotels & Hospitality', naics: '721110' },
  { value: 'data_centers', label: 'Data Centers', naics: '518210' },
  { value: 'real_estate', label: 'Real Estate', naics: '531110' },
]

const DEAL_TYPES = [
  { value: 'ma_acquisition', label: 'M&A Acquisition' },
  { value: 'construction', label: 'Construction & Development' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'real_estate', label: 'Real Estate Acquisition' },
]

const BOND_TYPES = [
  { value: 'taxable_senior_secured', label: 'Taxable Senior Secured' },
  { value: 'tax_exempt_501c3', label: 'Tax-Exempt 501(c)(3)' },
  { value: 'tax_exempt_pab_142', label: 'Tax-Exempt PAB (IRC §142)' },
  { value: 'governmental', label: 'Governmental Purpose' },
  { value: 'taxable_corporate', label: 'Taxable Corporate' },
  { value: 'project_finance', label: 'Senior Secured Project Finance' },
]

const AMORT_TYPES = [
  { value: 'level_debt_service', label: 'Level Debt Service' },
  { value: 'ascending', label: 'Ascending' },
  { value: 'bullet', label: 'Bullet (Interest Only)' },
  { value: 'io_then_amort', label: 'IO Period + Amortization' },
  { value: 'serial_with_term', label: 'Serial with Term' },
  { value: 'custom', label: 'Custom Schedule' },
]

const ENHANCEMENT_TYPES = [
  { value: 'none', label: 'None (Standalone)' },
  { value: 'bond_insurance', label: 'Bond Insurance (BAM / Assured Guaranty)' },
  { value: 'loc', label: 'Letter of Credit' },
  { value: 'surety', label: 'Surety Bond' },
  { value: 'federal_guarantee', label: 'Federal Guarantee (FHA / USDA / GNMA)' },
  { value: 'cash_collateralized_lc', label: 'Cash-Collateralized LC' },
]

type TabKey = 'deal' | 'bond' | 'structure' | 'credit' | 'enhancement' | 'result'

export default function BondDeskPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('deal')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Deal inputs
  const [dealType, setDealType] = useState('ma_acquisition')
  const [sector, setSector] = useState('business_services')
  const [ebitda, setEbitda] = useState('')
  const [acquisitionMultiple, setAcquisitionMultiple] = useState('')
  const [sponsorEquityPct, setSponsorEquityPct] = useState('30')
  const [rolloverEquity, setRolloverEquity] = useState('0')
  const [sellerNote, setSellerNote] = useState('0')
  const [netDebt, setNetDebt] = useState('0')
  const [txExpenses, setTxExpenses] = useState('0')

  // Bond structure
  const [bondType, setBondType] = useState('taxable_senior_secured')
  const [taxExempt, setTaxExempt] = useState(false)
  const [muni, setMuni] = useState(false)
  const [amortType, setAmortType] = useState('io_then_amort')
  const [tenorYears, setTenorYears] = useState('7')

  // Optionality
  const [ncPeriod, setNcPeriod] = useState('3')
  const [parCallAfter, setParCallAfter] = useState(true)
  const [putOption, setPutOption] = useState(false)

  // Enhancement
  const [enhancement, setEnhancement] = useState('none')

  async function runSizing() {
    setLoading(true)
    try {
      const body = {
        deal_type: dealType,
        ebitda: parseFloat(ebitda) || 0,
        sector,
        acquisition_multiple: parseFloat(acquisitionMultiple) || 0,
        sponsor_equity_pct: parseFloat(sponsorEquityPct) / 100,
        rollover_equity: parseFloat(rolloverEquity) || 0,
        seller_note: parseFloat(sellerNote) || 0,
        net_debt_at_close: parseFloat(netDebt) || 0,
        transaction_expenses: parseFloat(txExpenses) || 0,
      }
      const res = await fetch(`${API}/api/intel/size`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        setActiveTab('result')
      }
    } catch (e) {
      console.error('Sizing error:', e)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'deal', label: 'Deal Type' },
    { key: 'bond', label: 'Bond Type' },
    { key: 'structure', label: 'Structure' },
    { key: 'credit', label: 'Credit' },
    { key: 'enhancement', label: 'Enhancement' },
    { key: 'result', label: 'Result' },
  ]

  const inputStyle = { width: '100%', background: '#0D2218', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-mono)' }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }
  const labelStyle = { display: 'block', fontSize: 10, color: '#7A9A82', letterSpacing: '.06em', textTransform: 'uppercase' as const, marginBottom: 4, fontFamily: 'var(--font-space)' }
  const fieldStyle = { marginBottom: 16 }
  const cardStyle = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Bond Desk — Deal Entry</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>NEST Bond Structuring Engine — Operating Framework v1</p>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid rgba(196,160,72,0.1)', paddingBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            background: activeTab === t.key ? 'rgba(196,160,72,0.12)' : 'transparent',
            border: 'none',
            color: activeTab === t.key ? '#C4A048' : '#7A9A82',
            padding: '6px 14px',
            fontSize: 10,
            fontFamily: 'var(--font-space)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
            borderBottom: activeTab === t.key ? '2px solid #C4A048' : '2px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Deal Type Tab ─────────────────────────────────── */}
      {activeTab === 'deal' && (
        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Deal Type</label>
            <select value={dealType} onChange={e => setDealType(e.target.value)} style={selectStyle}>
              {DEAL_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Sector (NAICS-Driven)</label>
            <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label} — NAICS {s.naics}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Adjusted EBITDA ($)</label>
              <input type="number" value={ebitda} onChange={e => setEbitda(e.target.value)} placeholder="4000000" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Acquisition Multiple (x)</label>
              <input type="number" value={acquisitionMultiple} onChange={e => setAcquisitionMultiple(e.target.value)} placeholder="7.0" step="0.5" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Sponsor Equity (%)</label>
              <input type="number" value={sponsorEquityPct} onChange={e => setSponsorEquityPct(e.target.value)} placeholder="30" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Rollover Equity ($)</label>
              <input type="number" value={rolloverEquity} onChange={e => setRolloverEquity(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Seller Note ($)</label>
              <input type="number" value={sellerNote} onChange={e => setSellerNote(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Net Debt at Close ($)</label>
              <input type="number" value={netDebt} onChange={e => setNetDebt(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Transaction Expenses ($)</label>
              <input type="number" value={txExpenses} onChange={e => setTxExpenses(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>
        </div>
      )}

      {/* ── Bond Type Tab ─────────────────────────────────── */}
      {activeTab === 'bond' && (
        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bond Type</label>
            <select value={bondType} onChange={e => setBondType(e.target.value)} style={selectStyle}>
              {BOND_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#EDE8DC', fontSize: 12 }}>
              <input type="checkbox" checked={taxExempt} onChange={e => setTaxExempt(e.target.checked)} />
              Tax-Exempt
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#EDE8DC', fontSize: 12 }}>
              <input type="checkbox" checked={muni} onChange={e => setMuni(e.target.checked)} />
              Municipal
            </label>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tenor (Years)</label>
            <input type="number" value={tenorYears} onChange={e => setTenorYears(e.target.value)} placeholder="7" style={inputStyle} />
          </div>
        </div>
      )}

      {/* ── Structure Tab ─────────────────────────────────── */}
      {activeTab === 'structure' && (
        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Amortization Pattern</label>
            <select value={amortType} onChange={e => setAmortType(e.target.value)} style={selectStyle}>
              {AMORT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Call / Put Optionality</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Non-Call Period (Years)</label>
              <input type="number" value={ncPeriod} onChange={e => setNcPeriod(e.target.value)} placeholder="3" style={inputStyle} />
            </div>
            <div style={{ ...fieldStyle, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#EDE8DC', fontSize: 12 }}>
                <input type="checkbox" checked={parCallAfter} onChange={e => setParCallAfter(e.target.checked)} />
                Par Call After NC Period
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#EDE8DC', fontSize: 12 }}>
                <input type="checkbox" checked={putOption} onChange={e => setPutOption(e.target.checked)} />
                Investor Put Option
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Credit Tab ────────────────────────────────────── */}
      {activeTab === 'credit' && (
        <div style={cardStyle}>
          <p style={{ color: '#7A9A82', fontSize: 12, marginBottom: 16 }}>Credit assessment runs automatically from the Intelligence Engine using the Universal Credit Policy (Appendix F). DSCR, leverage, and equity contribution are validated against sector-specific thresholds.</p>
          <div style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C4A048', marginBottom: 8 }}>UNIVERSAL CREDIT POLICY FLOORS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>DSCR Floor</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>1.20x</span></div>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Debt Yield Floor</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>8.0%</span></div>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Max Leverage</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>80% LTC</span></div>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Min Equity</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>20%</span></div>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>DSRF Default</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>MADS</span></div>
              <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Op Reserve</span><br/><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 14 }}>3 months</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Enhancement Tab ───────────────────────────────── */}
      {activeTab === 'enhancement' && (
        <div style={cardStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Credit Enhancement</label>
            <select value={enhancement} onChange={e => setEnhancement(e.target.value)} style={selectStyle}>
              {ENHANCEMENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <p style={{ color: '#7A9A82', fontSize: 11, lineHeight: 1.6 }}>
            Enhancement selection affects rating, pricing, and investor appetite. Bond insurance (BAM, Assured Guaranty) lifts to insurer rating (typically AA).
            Cash-collateralized LC produces AAA-equivalent pricing. Federal guarantees (FHA, USDA, GNMA) produce AAA for qualifying projects.
          </p>
        </div>
      )}

      {/* ── Result Tab ────────────────────────────────────── */}
      {activeTab === 'result' && result && (
        <div>
          {/* Valuation */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Valuation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div><span style={{ ...labelStyle }}>EBITDA</span><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 16 }}>${(result.valuation?.ebitda || 0).toLocaleString()}</span></div>
              <div><span style={{ ...labelStyle }}>Multiple</span><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{result.valuation?.multiple}x</span></div>
              <div><span style={{ ...labelStyle }}>Enterprise Value</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 16 }}>${(result.valuation?.enterprise_value || 0).toLocaleString()}</span></div>
              <div><span style={{ ...labelStyle }}>In Range?</span><span style={{ color: result.valuation?.multiple_in_range ? '#2D6B3D' : '#C44048', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{result.valuation?.multiple_in_range ? 'YES' : 'HIGH'}</span></div>
            </div>
          </div>

          {/* Capital Structure */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Capital Structure</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div><span style={{ ...labelStyle }}>Senior Bond</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 18 }}>${(result.capital_structure?.senior_bond || 0).toLocaleString()}</span></div>
              <div><span style={{ ...labelStyle }}>Senior Leverage</span><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 18 }}>{result.capital_structure?.senior_leverage}x</span></div>
              <div><span style={{ ...labelStyle }}>Total Leverage</span><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 18 }}>{result.capital_structure?.total_leverage}x</span></div>
            </div>
          </div>

          {/* Sources & Uses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#C4A048', marginBottom: 8 }}>Sources</h3>
              {result.sources_and_uses?.sources && Object.entries(result.sources_and_uses.sources).map(([k, v]: [string, any]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(196,160,72,0.06)' }}>
                  <span style={{ color: '#7A9A82', fontSize: 11 }}>{k.replace(/_/g, ' ')}</span>
                  <span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 12 }}>${v?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: '#C4A048', marginBottom: 8 }}>Uses</h3>
              {result.sources_and_uses?.uses && Object.entries(result.sources_and_uses.uses).map(([k, v]: [string, any]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(196,160,72,0.06)' }}>
                  <span style={{ color: '#7A9A82', fontSize: 11 }}>{k.replace(/_/g, ' ')}</span>
                  <span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 12 }}>${v?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit & Readiness */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Credit Assessment & Readiness</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              <div><span style={{ ...labelStyle }}>DSCR</span><span style={{ color: '#EDE8DC', fontFamily: 'var(--font-mono)', fontSize: 18 }}>{result.credit?.dscr}x</span></div>
              <div><span style={{ ...labelStyle }}>Credit Grade</span><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 18 }}>{result.credit?.grade}</span></div>
              <div><span style={{ ...labelStyle }}>Meets Floor?</span><span style={{ color: result.credit?.meets_universal_floor ? '#2D6B3D' : '#C44048', fontFamily: 'var(--font-mono)', fontSize: 18 }}>{result.credit?.meets_universal_floor ? 'PASS' : 'FAIL'}</span></div>
            </div>
            {result.readiness_flags?.map((f: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.status === 'pass' ? '#2D6B3D' : f.status === 'warn' ? '#C4A048' : '#C44048' }} />
                <span style={{ color: '#EDE8DC', fontSize: 11 }}>{f.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Run Button ────────────────────────────────────── */}
      {activeTab !== 'result' && (
        <button onClick={runSizing} disabled={loading} style={{
          background: 'linear-gradient(135deg, #C4A048, #E8C87A)',
          color: '#030A06',
          border: 'none',
          padding: '12px 32px',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: 'var(--font-space)',
          fontWeight: 600,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Running Intelligence Engine...' : 'Run Bond Sizing'}
        </button>
      )}
    </div>
  )
}
