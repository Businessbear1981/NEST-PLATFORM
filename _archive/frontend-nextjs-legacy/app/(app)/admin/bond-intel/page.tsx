'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function fmt(n: number) { return n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'; }
function fmtM(n: number) { return `$${(n / 1_000_000).toFixed(1)}M`; }

export default function BondIntelPage() {
  const [tab, setTab] = useState('rating');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [bondTypes, setBondTypes] = useState<any>(null);

  // Rating readiness form
  const [dscr, setDscr] = useState('1.50');
  const [ltv, setLtv] = useState('68');
  const [presales, setPresales] = useState('45');
  const [opYears, setOpYears] = useState('7');
  const [hasAudit, setHasAudit] = useState(false);
  const [hasFeasibility, setHasFeasibility] = useState(false);
  const [hasGMP, setHasGMP] = useState(false);
  const [ratingResult, setRatingResult] = useState<any>(null);

  // Phase bonds
  const [tpc, setTpc] = useState('200000000');
  const [baseRate, setBaseRate] = useState('650');
  const [phaseResult, setPhaseResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/bond-intel/milestones`).then(r => r.json()).then(d => setMilestones(d.data || []));
    fetch(`${API}/api/bond-intel/team`).then(r => r.json()).then(d => setTeam(d.data));
    fetch(`${API}/api/bond-intel/100pct-path`).then(r => r.json()).then(d => setPath(d.data));
    fetch(`${API}/api/bond-intel/types`).then(r => r.json()).then(d => setBondTypes(d.data));
  }, []);

  async function assessRating() {
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/bond-intel/rating-readiness`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dscr_stabilized: parseFloat(dscr), ltv_pct: parseFloat(ltv), presales_pct: parseFloat(presales), operator_years_experience: parseInt(opYears), has_audited_financials: hasAudit, has_feasibility_study: hasFeasibility, has_GMP_contract: hasGMP }),
    });
    const d = await res.json();
    setRatingResult(d.data);
  }

  async function structurePhase() {
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/phase-bonds/structure`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ total_project_cost_usd: parseFloat(tpc), base_rate_bps: parseInt(baseRate) }),
    });
    const d = await res.json();
    setPhaseResult(d.data);
  }

  const TABS = ['rating', 'milestones', 'team', 'phases', '100pct'];

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 8 }}>Bond Intelligence</h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 24 }}>Institutional knowledge from real bond transactions. Capital Trust Authority BAN + Jacaranda Trace PLOM.</p>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'rating' ? 'Rating Readiness' : t === 'milestones' ? 'Milestone Gates' : t === 'team' ? 'Professional Team' : t === 'phases' ? 'Phase Bonds' : '100% Path'}
          </button>
        ))}
      </div>

      {/* RATING READINESS */}
      {tab === 'rating' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <div className="section-header">Deal Parameters</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <label><span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>DSCR at Stabilization</span>
                <input className="nest-input" value={dscr} onChange={e => setDscr(e.target.value)} /></label>
              <label><span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>LTV %</span>
                <input className="nest-input" value={ltv} onChange={e => setLtv(e.target.value)} /></label>
              <label><span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Presales %</span>
                <input className="nest-input" value={presales} onChange={e => setPresales(e.target.value)} /></label>
              <label><span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Operator Years</span>
                <input className="nest-input" value={opYears} onChange={e => setOpYears(e.target.value)} /></label>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--sage)' }}>
                  <input type="checkbox" checked={hasAudit} onChange={() => setHasAudit(!hasAudit)} /> Audited Financials</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--sage)' }}>
                  <input type="checkbox" checked={hasFeasibility} onChange={() => setHasFeasibility(!hasFeasibility)} /> Feasibility Study</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--sage)' }}>
                  <input type="checkbox" checked={hasGMP} onChange={() => setHasGMP(!hasGMP)} /> GMP Contract</label>
              </div>
              <button className="btn-gold" onClick={assessRating}>Assess Rating</button>
            </div>
          </div>

          {ratingResult && (
            <div className="card">
              <div className="section-header">Rating Assessment</div>
              <div className="serif" style={{ fontSize: 42, fontWeight: 300, color: ratingResult.highest_achievable === 'A' ? 'var(--gold)' : ratingResult.highest_achievable?.includes('BBB') ? 'var(--sage)' : 'var(--moss)' }}>
                {ratingResult.highest_achievable}
              </div>
              {ratingResult.estimated_coupon && (
                <div className="gold" style={{ fontSize: 18, marginTop: 8 }}>{ratingResult.estimated_coupon[0]}% — {ratingResult.estimated_coupon[1]}%</div>
              )}
              <div style={{ marginTop: 16 }}>
                <div className="section-header">Achievable Ratings</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ratingResult.achievable_ratings?.map((r: string) => (
                    <span key={r} className="tag-gold">{r}</span>
                  ))}
                </div>
              </div>
              {ratingResult.gaps?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-header">Gaps to Close</div>
                  {ratingResult.gaps.map((g: string, i: number) => (
                    <div key={i} className="card-alert" style={{ marginBottom: 8, fontSize: 12 }}>
                      <span className="status-dot dot-red" style={{ marginRight: 8 }} /> {g}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '10px 14px' }}>
                <span className="gold" style={{ fontSize: 11 }}>Next Action: </span>
                <span style={{ fontSize: 12 }}>{ratingResult.next_action}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MILESTONE GATES */}
      {tab === 'milestones' && (
        <div className="card">
          <div className="section-header">10 Gates to 100% Financing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {milestones.map((g: any) => (
              <div key={g.gate} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 0', borderBottom: '0.5px solid rgba(196,160,72,0.07)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="gold" style={{ fontSize: 12 }}>{g.gate}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--cream)' }}>{g.name}</div>
                  <div className="sage" style={{ fontSize: 11, marginTop: 2 }}>Required for: {g.required_for || '—'}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {g.docs?.map((d: string) => <span key={d} className="tag-gray" style={{ fontSize: 9 }}>{d}</span>)}
                  </div>
                  {g.nest_fee_opportunity && <div className="moss" style={{ fontSize: 10, marginTop: 4 }}>NEST: {g.nest_fee_opportunity}</div>}
                  {g.nest_fee && <div className="gold" style={{ fontSize: 10, marginTop: 4 }}>Fee: {g.nest_fee}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSIONAL TEAM */}
      {tab === 'team' && team && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {Object.entries(team).map(([key, val]: [string, any]) => (
            <div key={key} className="card">
              <div className="serif" style={{ fontSize: 20, color: 'var(--cream)', marginBottom: 4 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
              <div className="sage" style={{ fontSize: 12, marginBottom: 12 }}>{val.role}</div>
              {val.firms && (
                <div style={{ marginBottom: 8 }}>
                  <div className="section-header">Recommended Firms</div>
                  {val.firms.map((f: string) => <div key={f} style={{ fontSize: 12, padding: '2px 0' }}>{f}</div>)}
                </div>
              )}
              {val.typical_fee_pct && <div className="gold" style={{ fontSize: 13 }}>Fee: {val.typical_fee_pct[0]}% — {val.typical_fee_pct[1]}%</div>}
              {val.fee_usd && <div className="gold" style={{ fontSize: 13 }}>Fee: ${fmt(val.fee_usd[0])} — ${fmt(val.fee_usd[1])}</div>}
              {val.nest_automates && <div className="tag-gold" style={{ marginTop: 8, display: 'inline-block' }}>{val.nest_automates}</div>}
            </div>
          ))}
        </div>
      )}

      {/* PHASE BONDS */}
      {tab === 'phases' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-header">Structure Phase Bonds</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
              <label style={{ flex: 1 }}>
                <span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Total Project Cost ($)</span>
                <input className="nest-input" value={tpc} onChange={e => setTpc(e.target.value)} />
              </label>
              <label style={{ flex: 1 }}>
                <span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Base Rate (bps)</span>
                <input className="nest-input" value={baseRate} onChange={e => setBaseRate(e.target.value)} />
              </label>
              <button className="btn-gold" onClick={structurePhase}>Structure Phase Bonds</button>
            </div>
          </div>

          {phaseResult && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div className="kpi"><div className="kpi-label">Total Phases</div><div className="kpi-value">{phaseResult.total_phases}</div></div>
                  <div className="kpi"><div className="kpi-label">Construction Months</div><div className="kpi-value">{phaseResult.total_construction_months}</div></div>
                  <div className="kpi"><div className="kpi-label">Peak Exposure</div><div className="kpi-value">{fmtM(phaseResult.peak_exposure_usd)}</div></div>
                  <div className="kpi"><div className="kpi-label">Wtd Avg Rate</div><div className="kpi-value">{(phaseResult.weighted_avg_rate_bps / 100).toFixed(2)}%</div></div>
                </div>
              </div>

              <table className="nest-table">
                <thead><tr>
                  <th>Phase</th><th>Amount</th><th>Rate</th><th>Term</th><th>Call Mo</th><th>Put Mo</th><th>Security</th>
                </tr></thead>
                <tbody>
                  {phaseResult.phases?.map((p: any) => (
                    <tr key={p.phase}>
                      <td style={{ textTransform: 'capitalize' }}>{p.phase.replace(/_/g, ' ')}</td>
                      <td className="gold">{fmtM(p.tranche_amount_usd)}</td>
                      <td className="mono">{p.rate_pct}%</td>
                      <td className="mono">{p.duration_months}mo</td>
                      <td className="mono">{p.call_eligible_month}</td>
                      <td className="mono">{p.put_protection_until_month}</td>
                      <td className="tag-gray" style={{ fontSize: 9 }}>{p.security?.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="section-header">NEST Economics — Phase Bonds vs Single Bond</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="kpi"><div className="kpi-label">Phase Bond Fees</div><div className="kpi-value">{fmtM(phaseResult.nest_economics?.total_nest_fees_usd || 0)}</div></div>
                  <div className="kpi"><div className="kpi-label">Single Bond Fee</div><div className="kpi-value">{fmtM(phaseResult.nest_economics?.single_bond_fee_usd || 0)}</div></div>
                  <div className="kpi"><div className="kpi-label">Premium</div><div className="kpi-value" style={{ color: 'var(--sage)' }}>+{phaseResult.nest_economics?.premium_pct_over_single}%</div></div>
                </div>
                <p className="sage" style={{ fontSize: 11, marginTop: 12 }}>{phaseResult.nest_economics?.why_phase_bonds}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* 100% FINANCING PATH */}
      {tab === '100pct' && path && (
        <div className="card">
          <div className="section-header">The Path to 100% Financing</div>
          <p className="sage" style={{ fontSize: 13, marginBottom: 20 }}>{path.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {path.steps?.map((step: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '12px 0', borderBottom: '0.5px solid rgba(196,160,72,0.07)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', color: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 13, paddingTop: 4 }}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '12px 16px' }}>
            <div className="gold" style={{ fontSize: 11, marginBottom: 4 }}>Key Formula</div>
            <div className="mono" style={{ fontSize: 14, color: 'var(--cream)' }}>{path.key_formula}</div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11 }}>
            <span className="alert">Risk: </span><span className="sage">{path.risk}</span>
          </div>
        </div>
      )}
    </div>
  );
}
