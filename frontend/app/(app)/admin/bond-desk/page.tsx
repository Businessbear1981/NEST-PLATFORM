'use client'
import { useEffect, useMemo, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const h = (): HeadersInit => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('nest_token') || '' : ''}`, 'Content-Type': 'application/json' })

/* ── Operating Framework option sets ─────────────────────────── */
const SECTORS = [
  { value: 'senior_living', label: 'Senior Living / CCRC', naics: '623311' },
  { value: 'healthcare_services', label: 'Healthcare Services', naics: '621' },
  { value: 'software_saas', label: 'Software / SaaS', naics: '511210' },
  { value: 'business_services', label: 'Business Services', naics: '561' },
  { value: 'industrial_manufacturing', label: 'Industrial Manufacturing', naics: '31-33' },
  { value: 'distribution', label: 'Distribution', naics: '423' },
  { value: 'consumer_products', label: 'Consumer Products', naics: '311-316' },
  { value: 'trucking_logistics', label: 'Trucking & Logistics', naics: '484' },
  { value: 'specialty_contractors', label: 'Specialty Contractors', naics: '238' },
  { value: 'energy_services', label: 'Energy Services', naics: '213' },
  { value: 'financial_services', label: 'Financial Services', naics: '523' },
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
  { value: 'bond_insurance', label: 'Bond Insurance (BAM / Assured)' },
  { value: 'loc', label: 'Letter of Credit' },
  { value: 'surety', label: 'Surety Bond (Hylant)' },
  { value: 'federal_guarantee', label: 'Federal Guarantee (FHA / USDA / GNMA)' },
  { value: 'cash_collateralized_lc', label: 'Cash-Collateralized LC' },
]

/* ── Inline styles & micro-animations ───────────────────────── */
const ANIMATIONS = `
  @keyframes flash-up { 0% { color: var(--sage); text-shadow: 0 0 8px rgba(122,154,130,0.6); } 100% { color: var(--gold); text-shadow: none; } }
  @keyframes flash-down { 0% { color: var(--alert); text-shadow: 0 0 8px rgba(239,68,68,0.6); } 100% { color: var(--gold); text-shadow: none; } }
  @keyframes ticker-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes signal-glow { 0%, 100% { box-shadow: 0 0 0 rgba(196,160,72,0); } 50% { box-shadow: 0 0 20px rgba(196,160,72,0.4); } }
  .bd-flash-up { animation: flash-up 1.2s ease-out; }
  .bd-flash-down { animation: flash-down 1.2s ease-out; }
  .bd-ticker-dot { animation: ticker-pulse 1.6s infinite; }
  .bd-signal-glow { animation: signal-glow 2.4s infinite; }
`

const LABEL: React.CSSProperties = { display: 'block', fontSize: 9, color: 'var(--sage)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-mono)' }
const INPUT: React.CSSProperties = { width: '100%', background: 'rgba(3,10,6,0.6)', border: '1px solid rgba(196,160,72,0.18)', color: 'var(--cream)', padding: '7px 10px', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }
const FIELD: React.CSSProperties = { marginBottom: 12 }
const SECTION: React.CSSProperties = { borderBottom: '1px solid rgba(196,160,72,0.08)', paddingBottom: 14, marginBottom: 14 }
const SECTION_TITLE: React.CSSProperties = { fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }

type Rates = {
  treasury_2yr?: number; treasury_5yr?: number; treasury_10yr?: number; treasury_30yr?: number
  sofr?: number; ig_spread?: number; hy_spread?: number; mmd_10yr?: number
  curve_inverted?: boolean
}

/* ── Page ───────────────────────────────────────────────────── */
export default function BondDeskPage() {
  const [rates, setRates] = useState<Rates | null>(null)
  const [prevRates, setPrevRates] = useState<Rates | null>(null)
  const [rateSource, setRateSource] = useState<'live' | 'cached' | 'offline'>('cached')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Deal context
  const [dealType, setDealType] = useState('ma_acquisition')
  const [sector, setSector] = useState('senior_living')
  const [ebitda, setEbitda] = useState('20500000')
  const [acquisitionMultiple, setAcquisitionMultiple] = useState('10.0')
  const [sponsorEquityPct, setSponsorEquityPct] = useState('30')
  const [rolloverEquity, setRolloverEquity] = useState('0')
  const [sellerNote, setSellerNote] = useState('0')
  const [netDebt, setNetDebt] = useState('205000000')
  const [txExpenses, setTxExpenses] = useState('2500000')

  // Bond structure
  const [bondType, setBondType] = useState('taxable_senior_secured')
  const [taxExempt, setTaxExempt] = useState(false)
  const [muni, setMuni] = useState(false)
  const [amortType, setAmortType] = useState('io_then_amort')
  const [tenorYears, setTenorYears] = useState('10')

  // Optionality
  const [ncPeriod, setNcPeriod] = useState('5')
  const [parCallAfter, setParCallAfter] = useState(false)
  const [putOption, setPutOption] = useState(false)

  // Enhancement
  const [enhancement, setEnhancement] = useState('none')

  // Tutorial overlay
  const [tutorialFor, setTutorialFor] = useState<string | null>(null)

  /* Live rates polling */
  useEffect(() => {
    let mounted = true
    const fetchRates = async () => {
      try {
        const r = await fetch(`${API}/api/market/rates/live`)
        const j = await r.json()
        if (!mounted) return
        if (j.success && j.data?.rates) {
          setPrevRates(rates)
          setRates(j.data.rates)
          setRateSource(j.data.source === 'live' ? 'live' : 'cached')
        }
      } catch {
        if (mounted) setRateSource('offline')
      }
    }
    fetchRates()
    const id = setInterval(fetchRates, 30000)
    return () => { mounted = false; clearInterval(id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Build engine inputs */
  const engineInputs = useMemo(() => ({
    deal_type: dealType,
    sector,
    ebitda: parseFloat(ebitda) || 0,
    acquisition_multiple: parseFloat(acquisitionMultiple) || 0,
    sponsor_equity_pct: parseFloat(sponsorEquityPct) / 100,
    rollover_equity: parseFloat(rolloverEquity) || 0,
    seller_note: parseFloat(sellerNote) || 0,
    net_debt_at_close: parseFloat(netDebt) || 0,
    transaction_expenses: parseFloat(txExpenses) || 0,
    bond_type: bondType,
    tax_exempt: taxExempt || bondType.startsWith('tax_exempt') || bondType === 'governmental',
    muni: muni || bondType === 'governmental',
    amort_type: amortType,
    tenor_years: parseInt(tenorYears) || 7,
    nc_period: parseInt(ncPeriod) || 3,
    par_call_after: parCallAfter,
    put_option: putOption,
    enhancement,
    ust_curve: rates ? {
      2: rates.treasury_2yr, 5: rates.treasury_5yr, 10: rates.treasury_10yr, 30: rates.treasury_30yr,
    } : undefined,
  }), [dealType, sector, ebitda, acquisitionMultiple, sponsorEquityPct, rolloverEquity, sellerNote, netDebt, txExpenses, bondType, taxExempt, muni, amortType, tenorYears, ncPeriod, parCallAfter, putOption, enhancement, rates])

  async function runStructuring() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/intel/size`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(engineInputs) })
      const data = await res.json()
      if (data.success) setResult(data.data)
    } catch (e) { console.error('Structuring error:', e) } finally { setLoading(false) }
  }

  const bs = result?.bond_structure
  const cs = result?.capital_structure
  const sources = result?.sources_and_uses?.sources
  const uses = result?.sources_and_uses?.uses
  const credit = result?.credit

  return (
    <div>
      <style>{ANIMATIONS}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--moss)', letterSpacing: '.14em', textTransform: 'uppercase' }}>NEST · BOND DESK</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: 'var(--cream)', fontWeight: 400, margin: '4px 0 0' }}>Bond Structuring Engine</h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--moss)', marginTop: 2 }}>Operating Framework v1 · §6 Security · §7 Amortization · §10 Optionality · §13 Enhancement</div>
        </div>
        <button onClick={() => setTutorialFor(tutorialFor ? null : 'overview')} className="btn-ghost" style={{ fontSize: 10, padding: '6px 12px' }}>{tutorialFor ? 'Hide formulas' : 'Show formulas'}</button>
      </div>

      {/* Live Rates Ticker */}
      <RatesTicker rates={rates} prev={prevRates} source={rateSource} />

      {/* Body — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, marginTop: 16, alignItems: 'flex-start' }}>
        {/* Left: Bond Builder */}
        <div className="nest-card" style={{ position: 'sticky', top: 16 }}>
          <div style={SECTION}>
            <div style={SECTION_TITLE}>1. Deal Context</div>
            <div style={FIELD}><label style={LABEL}>Deal Type</label><select value={dealType} onChange={e => setDealType(e.target.value)} style={INPUT}>{DEAL_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
            <div style={FIELD}><label style={LABEL}>Sector (NAICS-driven)</label><select value={sector} onChange={e => setSector(e.target.value)} style={INPUT}>{SECTORS.map(s => <option key={s.value} value={s.value}>{s.label} · {s.naics}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={FIELD}><label style={LABEL}>Adj. EBITDA ($)</label><input type="number" value={ebitda} onChange={e => setEbitda(e.target.value)} style={INPUT} /></div>
              <div style={FIELD}><label style={LABEL}>Multiple (x)</label><input type="number" step="0.5" value={acquisitionMultiple} onChange={e => setAcquisitionMultiple(e.target.value)} style={INPUT} /></div>
              <div style={FIELD}><label style={LABEL}>Sponsor Equity (%)</label><input type="number" value={sponsorEquityPct} onChange={e => setSponsorEquityPct(e.target.value)} style={INPUT} /></div>
              <div style={FIELD}><label style={LABEL}>Rollover Equity ($)</label><input type="number" value={rolloverEquity} onChange={e => setRolloverEquity(e.target.value)} style={INPUT} /></div>
              <div style={FIELD}><label style={LABEL}>Seller Note ($)</label><input type="number" value={sellerNote} onChange={e => setSellerNote(e.target.value)} style={INPUT} /></div>
              <div style={FIELD}><label style={LABEL}>Net Debt at Close ($)</label><input type="number" value={netDebt} onChange={e => setNetDebt(e.target.value)} style={INPUT} /></div>
            </div>
            <div style={FIELD}><label style={LABEL}>Transaction Expenses ($)</label><input type="number" value={txExpenses} onChange={e => setTxExpenses(e.target.value)} style={INPUT} /></div>
          </div>

          <div style={SECTION}>
            <div style={SECTION_TITLE}>2. Bond Type · §6 Security</div>
            <div style={FIELD}><label style={LABEL}>Bond Type</label><select value={bondType} onChange={e => setBondType(e.target.value)} style={INPUT}>{BOND_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--cream)' }}><input type="checkbox" checked={taxExempt} onChange={e => setTaxExempt(e.target.checked)} /> Tax-Exempt</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--cream)' }}><input type="checkbox" checked={muni} onChange={e => setMuni(e.target.checked)} /> Municipal</label>
            </div>
          </div>

          <div style={SECTION}>
            <div style={SECTION_TITLE}>3. Amortization · §7</div>
            <div style={FIELD}><label style={LABEL}>Amortization Pattern</label><select value={amortType} onChange={e => setAmortType(e.target.value)} style={INPUT}>{AMORT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
            <div style={FIELD}><label style={LABEL}>Tenor (Years)</label><input type="number" value={tenorYears} onChange={e => setTenorYears(e.target.value)} style={INPUT} /></div>
          </div>

          <div style={SECTION}>
            <div style={SECTION_TITLE}>4. Optionality · §10</div>
            <div style={FIELD}><label style={LABEL}>Non-Call Period (Years)</label><input type="number" value={ncPeriod} onChange={e => setNcPeriod(e.target.value)} style={INPUT} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--cream)' }}><input type="checkbox" checked={parCallAfter} onChange={e => setParCallAfter(e.target.checked)} /> Par Call After NC</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--cream)' }}><input type="checkbox" checked={putOption} onChange={e => setPutOption(e.target.checked)} /> Investor Put Option</label>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <div style={SECTION_TITLE}>5. Enhancement · §13</div>
            <div style={FIELD}><label style={LABEL}>Credit Enhancement</label><select value={enhancement} onChange={e => setEnhancement(e.target.value)} style={INPUT}>{ENHANCEMENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}</select></div>
          </div>

          <button onClick={runStructuring} disabled={loading} className="btn-gold" style={{ width: '100%', marginTop: 6 }}>
            {loading ? 'Structuring…' : 'STRUCTURE BOND'}
          </button>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!result ? (
            <div className="nest-card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: 'var(--moss)' }}>Structure a bond to see results</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--moss)', marginTop: 8 }}>Inputs flow through Operating Framework §6 → §7 → §10 → §13 into a full structure</div>
            </div>
          ) : (
            <>
              <HeadlineCard bs={bs} cs={cs} credit={credit} />
              <CapitalStructureCard cs={cs} result={result} />
              <SourcesUsesCard sources={sources} uses={uses} />
              {bs?.amort_schedule?.length > 0 && <AmortScheduleCard schedule={bs.amort_schedule} />}
              <OptionalityCard call={bs?.call_schedule} put={bs?.put_schedule} />
              {bs?.enhancement && <EnhancementCard enh={bs.enhancement} />}
              <ReadinessCard flags={result.readiness_flags} />
            </>
          )}
        </div>
      </div>

      {/* Tutorial Drawer */}
      {tutorialFor && <TutorialDrawer onClose={() => setTutorialFor(null)} />}
    </div>
  )
}

/* ── Rates Ticker ──────────────────────────────────────────── */
function RatesTicker({ rates, prev, source }: { rates: Rates | null; prev: Rates | null; source: string }) {
  const tiles: { label: string; value?: number; prev?: number; suffix: string; fmt: (v: number) => string }[] = [
    { label: 'UST 2Y', value: rates?.treasury_2yr, prev: prev?.treasury_2yr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'UST 5Y', value: rates?.treasury_5yr, prev: prev?.treasury_5yr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'UST 10Y', value: rates?.treasury_10yr, prev: prev?.treasury_10yr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'UST 30Y', value: rates?.treasury_30yr, prev: prev?.treasury_30yr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'SOFR', value: rates?.sofr, prev: prev?.sofr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'MMD 10Y', value: rates?.mmd_10yr, prev: prev?.mmd_10yr, suffix: '%', fmt: v => v.toFixed(2) },
    { label: 'IG SPREAD', value: rates?.ig_spread, prev: prev?.ig_spread, suffix: 'bps', fmt: v => Math.round(v * 100).toString() },
    { label: 'HY SPREAD', value: rates?.hy_spread, prev: prev?.hy_spread, suffix: 'bps', fmt: v => Math.round(v * 100).toString() },
  ]
  return (
    <div className="nest-card-dark" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14, overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80, fontSize: 9, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '.12em' }}>
        <span className="bd-ticker-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: source === 'live' ? 'var(--sage)' : source === 'cached' ? 'var(--gold)' : 'var(--alert)' }} />
        {source === 'live' ? 'FRED · LIVE' : source === 'cached' ? 'CACHED' : 'OFFLINE'}
      </div>
      <div style={{ display: 'flex', gap: 18, flex: 1 }}>
        {tiles.map(t => {
          const changed = t.value != null && t.prev != null && t.value !== t.prev
          const up = changed && (t.value as number) > (t.prev as number)
          return (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', minWidth: 70 }}>
              <span style={{ fontSize: 8, color: 'var(--moss)', letterSpacing: '.14em', fontFamily: 'var(--font-mono)' }}>{t.label}</span>
              <span className={changed ? (up ? 'bd-flash-up' : 'bd-flash-down') : ''} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold)', fontWeight: 500 }}>
                {t.value != null ? t.fmt(t.value) : '—'}<span style={{ fontSize: 9, color: 'var(--moss)', marginLeft: 2 }}>{t.suffix}</span>
              </span>
              {changed && (
                <span style={{ fontSize: 8, color: up ? 'var(--sage)' : 'var(--alert)', fontFamily: 'var(--font-mono)' }}>
                  {up ? '▲' : '▼'} {Math.abs((t.value as number) - (t.prev as number)).toFixed(t.suffix === 'bps' ? 0 : 2)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {rates?.curve_inverted && (
        <div className="bd-signal-glow" style={{ padding: '4px 10px', border: '1px solid var(--alert)', borderRadius: 4, fontSize: 9, color: 'var(--alert)', fontFamily: 'var(--font-mono)', letterSpacing: '.1em' }}>CURVE INVERTED</div>
      )}
    </div>
  )
}

/* ── Result Cards ──────────────────────────────────────────── */
function HeadlineCard({ bs, cs, credit }: any) {
  if (!bs) return null
  return (
    <div className="nest-card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        <div className="nest-kpi"><div className="nest-kpi-label">PAR</div><div className="nest-kpi-value">${(bs.principal / 1e6).toFixed(1)}M</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">COUPON</div><div className="nest-kpi-value">{bs.coupon_pct}%</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>UST {bs.ust_benchmark_pct}% + {bs.spread_bps}bp</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">ALL-IN TIC</div><div className="nest-kpi-value">{bs.all_in_tic_pct}%</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">WAL</div><div className="nest-kpi-value">{bs.weighted_avg_life}y</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>tenor {bs.tenor_years}y</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">GRADE</div><div className="nest-kpi-value">{credit?.grade || '—'}</div><div style={{ fontSize: 8, color: credit?.meets_universal_floor ? 'var(--sage)' : 'var(--alert)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{credit?.meets_universal_floor ? 'MEETS FLOOR' : 'BELOW FLOOR'}</div></div>
      </div>
      {bs.tax_exempt && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(196,160,72,0.08)', borderRadius: 4, fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
          TAX-EXEMPT · TEY {bs.taxable_equivalent_yield_pct}% (24% blended fed+state)
        </div>
      )}
    </div>
  )
}

function CapitalStructureCard({ cs, result }: any) {
  if (!cs) return null
  return (
    <div className="nest-card">
      <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Capital Structure</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <div className="nest-kpi"><div className="nest-kpi-label">Senior Bond</div><div className="nest-kpi-value">${(cs.senior_bond / 1e6).toFixed(1)}M</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">Senior Lev</div><div className="nest-kpi-value">{cs.senior_leverage}x</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>max {cs.max_senior_leverage}x</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">Total Lev</div><div className="nest-kpi-value">{cs.total_leverage}x</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>max {cs.max_total_leverage}x</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">EV</div><div className="nest-kpi-value">${(result.valuation.enterprise_value / 1e6).toFixed(0)}M</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{result.valuation.multiple}x EBITDA</div></div>
      </div>
    </div>
  )
}

function SourcesUsesCard({ sources, uses }: any) {
  if (!sources || !uses) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="nest-card">
        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Sources</div>
        {Object.entries(sources).filter(([k]) => k !== 'total').map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(196,160,72,0.05)' }}>
            <span style={{ fontSize: 11, color: 'var(--sage)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 11, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>${((v as number) / 1e6).toFixed(2)}M</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', marginTop: 4, borderTop: '1px solid var(--gold-border)' }}>
          <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${((sources.total as number) / 1e6).toFixed(2)}M</span>
        </div>
      </div>
      <div className="nest-card">
        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Uses</div>
        {Object.entries(uses).filter(([k]) => k !== 'total').map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(196,160,72,0.05)' }}>
            <span style={{ fontSize: 11, color: 'var(--sage)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 11, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>${((v as number) / 1e6).toFixed(2)}M</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', marginTop: 4, borderTop: '1px solid var(--gold-border)' }}>
          <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${((uses.total as number) / 1e6).toFixed(2)}M</span>
        </div>
      </div>
    </div>
  )
}

function AmortScheduleCard({ schedule }: { schedule: any[] }) {
  return (
    <div className="nest-card">
      <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Amortization Schedule · §7</div>
      <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid rgba(196,160,72,0.08)', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--forest)' }}>
            <tr>
              {['Year', 'Begin Bal', 'Principal', 'Interest', 'Total DS', 'End Bal'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9, color: 'var(--moss)', letterSpacing: '.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(196,160,72,0.12)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(196,160,72,0.04)' }}>
                <td style={{ padding: '5px 10px', color: 'var(--gold)', textAlign: 'right' }}>{r.year}</td>
                <td style={{ padding: '5px 10px', color: 'var(--cream)', textAlign: 'right' }}>${(r.beginning_balance / 1e6).toFixed(2)}M</td>
                <td style={{ padding: '5px 10px', color: 'var(--cream)', textAlign: 'right' }}>${(r.principal_payment / 1e6).toFixed(2)}M</td>
                <td style={{ padding: '5px 10px', color: 'var(--cream)', textAlign: 'right' }}>${(r.interest_payment / 1e6).toFixed(2)}M</td>
                <td style={{ padding: '5px 10px', color: 'var(--gold)', textAlign: 'right' }}>${(r.total_ds / 1e6).toFixed(2)}M</td>
                <td style={{ padding: '5px 10px', color: 'var(--sage)', textAlign: 'right' }}>${(r.ending_balance / 1e6).toFixed(2)}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OptionalityCard({ call, put }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="nest-card">
        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Call Schedule · §10</div>
        {call && (
          <>
            <div style={{ fontSize: 11, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>
              Non-Call <span style={{ color: 'var(--gold)' }}>{call.nc_years}y</span> · Type <span style={{ color: 'var(--gold)' }}>{call.type === 'par_call' ? 'Par Call' : 'Step-Down'}</span>
            </div>
            {call.premium_schedule?.length > 0 && (
              <table style={{ width: '100%', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(196,160,72,0.12)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', color: 'var(--moss)' }}>Year</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', color: 'var(--moss)' }}>Premium</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', color: 'var(--moss)' }}>MW Spread</th>
                </tr></thead>
                <tbody>{call.premium_schedule.map((p: any) => (
                  <tr key={p.year}><td style={{ padding: '3px 6px', color: 'var(--cream)' }}>{p.year}</td><td style={{ padding: '3px 6px', textAlign: 'right', color: 'var(--gold)' }}>{p.premium_pct}%</td><td style={{ padding: '3px 6px', textAlign: 'right', color: 'var(--cream)' }}>+{p.make_whole_spread_bps}bp</td></tr>
                ))}</tbody>
              </table>
            )}
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>Par callable in year {call.par_call_after_year}</div>
          </>
        )}
      </div>
      <div className="nest-card">
        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Put Schedule · §10</div>
        {put?.has_put ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>
              Put years <span style={{ color: 'var(--gold)' }}>{put.put_years.join(', ')}</span> at <span style={{ color: 'var(--gold)' }}>{put.put_premium_pct}%</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>{put.note}</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--moss)', fontFamily: 'var(--font-mono)' }}>No put option elected</div>
        )}
      </div>
    </div>
  )
}

function EnhancementCard({ enh }: any) {
  const uplift = enh.uplift_notches || 0
  return (
    <div className="nest-card">
      <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Credit Enhancement · §13</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <div className="nest-kpi"><div className="nest-kpi-label">Type</div><div className="nest-kpi-value" style={{ fontSize: 14 }}>{enh.type.replace(/_/g, ' ')}</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">Rating Before</div><div className="nest-kpi-value">{enh.rating_before}</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">Rating After</div><div className="nest-kpi-value">{enh.rating_after}</div><div style={{ fontSize: 8, color: 'var(--sage)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>+{uplift} notches</div></div>
        <div className="nest-kpi"><div className="nest-kpi-label">Annual Premium</div><div className="nest-kpi-value">${(enh.annual_premium_usd / 1e6).toFixed(2)}M</div><div style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{enh.premium_bps}bp</div></div>
      </div>
    </div>
  )
}

function ReadinessCard({ flags }: { flags?: any[] }) {
  if (!flags?.length) return null
  return (
    <div className="nest-card">
      <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Readiness Flags</div>
      {flags.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.status === 'pass' ? 'var(--sage)' : f.status === 'warn' ? 'var(--gold)' : 'var(--alert)' }} />
          <span style={{ fontSize: 11, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>{f.message}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Tutorial Drawer (Operating Framework §1-17 formulas) ──── */
function TutorialDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(3,10,6,0.85)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, height: '100vh', background: 'var(--forest)', borderLeft: '1px solid var(--gold-border)', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: 'var(--gold)', margin: 0 }}>Bond Math · Formulas</h2>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px' }}>Close</button>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cream)', lineHeight: 1.7 }}>

          <Section title="§6 Coupon · UST + Spread">
            <code>coupon = UST(tenor) + spread_bps / 100</code><br/>
            <code>tax_exempt_coupon = taxable_coupon × 0.65</code><br/>
            <code>TEY = tax_exempt_coupon / 0.65</code>
            <p>Spread is grade-driven: AAA 30bp · AA 50bp · A 80bp · BBB 130bp · BB 350bp · B 650bp. Tax-exempt trades ~65% of taxable equivalent at 24% blended fed+state.</p>
          </Section>

          <Section title="§7 Amortization Patterns">
            <code>Level DS:  Annual_DS = P × r / (1 − (1+r)^−n)</code><br/>
            <code>Bullet:    Interest only, full P at maturity</code><br/>
            <code>IO+Amort:  io_years interest only, then level on balance</code><br/>
            <code>Ascending: payments scaled 60% → 140% over life</code><br/>
            <code>Serial+Term: half serial (equal), half balloon</code>
            <p><b>WAL</b> = Σ (year × principal_payment) / total principal</p>
          </Section>

          <Section title="§10 Calls & Puts">
            <code>par_call_after_year = nc_period (par call mode)</code><br/>
            <code>step-down premium: 102% → 101% → 100.5% post-NC</code><br/>
            <code>make-whole spread: 50bp → 35bp → 25bp</code>
            <p>Investor put set at max(3, tenor/2) when elected — at par.</p>
          </Section>

          <Section title="§13 Credit Enhancement">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead><tr style={{ borderBottom: '1px solid var(--gold-border)' }}><th style={{ textAlign: 'left', padding: 4 }}>Type</th><th style={{ textAlign: 'left', padding: 4 }}>Uplift</th><th style={{ textAlign: 'right', padding: 4 }}>Premium</th></tr></thead>
              <tbody>
                <tr><td style={{ padding: 4 }}>Bond Insurance</td><td style={{ padding: 4 }}>AA</td><td style={{ padding: 4, textAlign: 'right' }}>50bp</td></tr>
                <tr><td style={{ padding: 4 }}>Cash-Coll LC</td><td style={{ padding: 4 }}>AAA</td><td style={{ padding: 4, textAlign: 'right' }}>30bp</td></tr>
                <tr><td style={{ padding: 4 }}>Federal Guar.</td><td style={{ padding: 4 }}>AAA</td><td style={{ padding: 4, textAlign: 'right' }}>20bp</td></tr>
                <tr><td style={{ padding: 4 }}>Surety</td><td style={{ padding: 4 }}>BBB+</td><td style={{ padding: 4, textAlign: 'right' }}>100bp</td></tr>
                <tr><td style={{ padding: 4 }}>LC</td><td style={{ padding: 4 }}>A</td><td style={{ padding: 4, textAlign: 'right' }}>100bp</td></tr>
              </tbody>
            </table>
            <p>Annual premium = principal × premium_bps / 10000</p>
          </Section>

          <Section title="§15 Pricing — All-in TIC">
            <code>all_in_TIC = coupon + enhancement_bps/100 + (upfront_fees_bps / 100) / tenor</code>
            <p>Upfront fees blended over life: structuring 2.5% + placement 0.75% = 250bp amortized.</p>
          </Section>

          <Section title="Universal Credit Policy Floors">
            <code>DSCR ≥ 1.20x · Debt Yield ≥ 8% · Max LTC 80% · Min Equity 20%</code><br/>
            <code>DSRF = MADS · Op Reserve = 3 months</code>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(196,160,72,0.08)' }}>
      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{title}</div>
      {children}
    </div>
  )
}
