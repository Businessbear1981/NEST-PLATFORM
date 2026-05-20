'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function fmt(n: number) { return n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'; }

export default function LicensingPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase_1_exams');
  const [annualFees, setAnnualFees] = useState('2000000');
  const [rentVsOwn, setRentVsOwn] = useState<any>(null);
  const [letter, setLetter] = useState('');
  const [genLetter, setGenLetter] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/licensing/roadmap`).then(r => r.json()).then(d => setRoadmap(d.data)).catch(() => {});
    const token = localStorage.getItem('nest_token');
    if (token) {
      fetch(`${API}/api/licensing/status`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setStatus(d.data)).catch(() => {});
      fetch(`${API}/api/licensing/fees`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setFees(d.data)).catch(() => {});
    }
  }, []);

  async function calcRentVsOwn() {
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/licensing/rent-vs-own`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ annual_fees_usd: parseFloat(annualFees) }),
    });
    const d = await res.json();
    setRentVsOwn(d.data);
  }

  async function generateLetter() {
    setGenLetter(true);
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/licensing/finra-letter`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    setLetter(d.data?.letter || 'Error generating letter');
    setGenLetter(false);
  }

  const PHASES = [
    { key: 'phase_1_exams', label: 'Phase 1: Exams', timeline: 'Weeks 1-8' },
    { key: 'phase_2_rent_bd', label: 'Phase 2: Rent B/D', timeline: 'Month 2-3' },
    { key: 'phase_3_ria', label: 'Phase 3: RIA', timeline: 'Month 3-6' },
    { key: 'phase_4_own_bd', label: 'Phase 4: Own B/D', timeline: 'Month 18-36' },
  ];

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>Licensing & Compliance</h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 24 }}>NEST Advisors regulatory infrastructure. Series 79 + 63 + 65 pathway.</p>

      {/* STATUS BANNER */}
      {status && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--gold)', borderWidth: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <div><div className="section-header">Current Phase</div><div className="gold" style={{ fontSize: 18 }}>{status.current_phase?.replace(/_/g, ' ').toUpperCase()}</div></div>
            <div><div className="section-header">Days to Licensed</div><div className="kpi-value">~{status.days_to_licensed}</div></div>
            <div><div className="section-header">Revenue Now</div><div className="sage" style={{ fontSize: 12 }}>{status.revenue_possible_now}</div></div>
            <div><div className="section-header">After Licensing</div><div style={{ fontSize: 12, color: 'var(--cream)' }}>{status.revenue_after_licensing}</div></div>
          </div>
          <div style={{ marginTop: 12, background: 'var(--gold-dim)', borderRadius: 4, padding: '8px 12px' }}>
            <span className="gold" style={{ fontSize: 10 }}>NEXT ACTION: </span>
            <span style={{ fontSize: 12 }}>{status.next_action}</span>
          </div>
        </div>
      )}

      {/* PHASE ROADMAP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
        {PHASES.map((p, i) => (
          <button key={p.key} className={expandedPhase === p.key ? 'card' : 'card-dark'}
            onClick={() => setExpandedPhase(expandedPhase === p.key ? null : p.key)}
            style={{ cursor: 'pointer', textAlign: 'left', border: expandedPhase === p.key ? '1px solid var(--gold)' : undefined }}>
            <div className="mono" style={{ fontSize: 9, color: i === 0 ? 'var(--gold)' : 'var(--moss)' }}>{p.timeline}</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{p.label}</div>
          </button>
        ))}
      </div>

      {/* EXPANDED PHASE DETAIL */}
      {expandedPhase && roadmap?.[expandedPhase] && (
        <div className="card" style={{ marginBottom: 24 }}>
          {expandedPhase === 'phase_1_exams' && roadmap.phase_1_exams?.exams && (
            <div>
              <div className="section-header">Required Exams</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {roadmap.phase_1_exams.exams.map((exam: any) => (
                  <div key={exam.name} className="card-dark">
                    <div className="serif" style={{ fontSize: 22, color: 'var(--cream)' }}>{exam.name}</div>
                    <div className="sage" style={{ fontSize: 11, marginBottom: 12 }}>{exam.full_name}</div>
                    <div className="data-row"><span className="data-label">Study Hours</span><span className="data-value">{exam.study_hours}</span></div>
                    <div className="data-row"><span className="data-label">Pass Rate</span><span className="data-value">{exam.pass_rate_pct}%</span></div>
                    <div className="data-row"><span className="data-label">Passing Score</span><span className="data-value">{exam.passing_score_pct}%</span></div>
                    <div className="data-row"><span className="data-label">Fee</span><span className="data-value gold">${exam.exam_fee_usd}</span></div>
                    <div className="data-row"><span className="data-label">Format</span><span className="data-value">{exam.format}</span></div>
                    <div style={{ marginTop: 8 }}>
                      <div className="section-header">Covers</div>
                      {exam.covers?.map((c: string) => <div key={c} style={{ fontSize: 11, color: 'var(--sage)', padding: '1px 0' }}>{c}</div>)}
                    </div>
                    <div className="tag-gold" style={{ marginTop: 8, display: 'inline-block', fontSize: 9 }}>{exam.nest_relevance}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedPhase === 'phase_2_rent_bd' && (
            <div>
              <div className="section-header">Rent-a-BD Firms</div>
              <p className="sage" style={{ fontSize: 12, marginBottom: 16 }}>{roadmap.phase_2_rent_bd.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                {roadmap.phase_2_rent_bd.recommended_firms?.map((f: any) => (
                  <div key={f.name} className="card-dark">
                    <div className="serif" style={{ fontSize: 18 }}>{f.name}</div>
                    <div className="sage" style={{ fontSize: 11 }}>{f.specialty}</div>
                    {f.fee_structure && <div className="gold" style={{ fontSize: 11, marginTop: 8 }}>{f.fee_structure}</div>}
                    {f.why_nest && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--cream)' }}>{f.why_nest}</div>}
                  </div>
                ))}
              </div>
              <button className="btn-gold" onClick={generateLetter} disabled={genLetter}>
                {genLetter ? 'Generating...' : 'Generate Finalis Inquiry Letter'}
              </button>
              {letter && (
                <div className="card-dark" style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.6 }}>
                  {letter}
                  <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => navigator.clipboard.writeText(letter)}>Copy Letter</button>
                </div>
              )}
            </div>
          )}
          {expandedPhase === 'phase_3_ria' && (
            <div>
              <div className="section-header">RIA Registration</div>
              <p className="sage" style={{ fontSize: 12, marginBottom: 12 }}>{roadmap.phase_3_ria.description}</p>
              <div className="data-row"><span className="data-label">Filing</span><span className="data-value">{roadmap.phase_3_ria.filing}</span></div>
              <div className="data-row"><span className="data-label">Required Exam</span><span className="data-value">{roadmap.phase_3_ria.required_exam}</span></div>
              <div className="data-row"><span className="data-label">Structure</span><span className="data-value">{roadmap.phase_3_ria.nest_structure}</span></div>
              <div style={{ marginTop: 12 }}>
                <div className="section-header">What It Covers</div>
                {roadmap.phase_3_ria.what_it_covers?.map((w: string) => <div key={w} style={{ fontSize: 12, padding: '2px 0' }}>{w}</div>)}
              </div>
            </div>
          )}
          {expandedPhase === 'phase_4_own_bd' && (
            <div>
              <div className="section-header">Own Broker-Dealer</div>
              <div className="data-row"><span className="data-label">Trigger</span><span className="data-value">{roadmap.phase_4_own_bd.trigger}</span></div>
              <div className="data-row"><span className="data-label">Setup Cost</span><span className="data-value gold">${fmt(roadmap.phase_4_own_bd.cost_to_setup_usd?.[0])} — ${fmt(roadmap.phase_4_own_bd.cost_to_setup_usd?.[1])}</span></div>
              <div className="data-row"><span className="data-label">Annual Compliance</span><span className="data-value gold">${fmt(roadmap.phase_4_own_bd.annual_compliance_cost_usd?.[0])} — ${fmt(roadmap.phase_4_own_bd.annual_compliance_cost_usd?.[1])}</span></div>
              <div className="data-row"><span className="data-label">Timeline to Approval</span><span className="data-value">{roadmap.phase_4_own_bd.timeline_to_approval}</span></div>
            </div>
          )}
        </div>
      )}

      {/* FEE STRUCTURE */}
      {fees && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-header">NEST Advisors Fee Structure</div>
          <table className="nest-table">
            <thead><tr><th>Fee Type</th><th>Rate</th><th>Applied To</th></tr></thead>
            <tbody>
              {Object.entries(fees.placement_fees || {}).map(([k, v]: [string, any]) => (
                <tr key={k}>
                  <td style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                  <td className="gold">{Array.isArray(v.pct) ? `${v.pct[0]}% — ${v.pct[1]}%` : v.pct}</td>
                  <td className="sage">{v.on}</td>
                </tr>
              ))}
              {Object.entries(fees.recurring_fees || {}).map(([k, v]: [string, any]) => (
                <tr key={k}>
                  <td style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                  <td className="gold">{v.pct ? `${v.pct[0]}% — ${v.pct[1]}%` : `$${fmt(v.amount_usd?.[0])} — $${fmt(v.amount_usd?.[1])}`}</td>
                  <td className="sage">{v.on || v.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mono moss" style={{ fontSize: 10, marginTop: 12 }}>{fees.note}</div>
        </div>
      )}

      {/* RENT vs OWN CALCULATOR */}
      <div className="card">
        <div className="section-header">Rent vs Own B/D Calculator</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end', marginBottom: 16 }}>
          <label style={{ flex: 1 }}>
            <span className="moss" style={{ fontSize: 10, textTransform: 'uppercase' }}>Annual Transaction Fees ($)</span>
            <input className="nest-input" value={annualFees} onChange={e => setAnnualFees(e.target.value)} />
          </label>
          <button className="btn-ghost" onClick={calcRentVsOwn}>Calculate</button>
        </div>
        {rentVsOwn && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="kpi"><div className="kpi-label">Rent B/D Cost</div><div className="kpi-value">${fmt(rentVsOwn.rent_bd_cost_usd)}</div></div>
            <div className="kpi"><div className="kpi-label">Own B/D Cost</div><div className="kpi-value">${fmt(rentVsOwn.own_bd_cost_usd)}</div></div>
            <div className="kpi">
              <div className="kpi-label">Recommendation</div>
              <div className="kpi-value" style={{ fontSize: 16, color: rentVsOwn.recommendation === 'Own B/D' ? 'var(--sage)' : 'var(--gold)' }}>{rentVsOwn.recommendation}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
