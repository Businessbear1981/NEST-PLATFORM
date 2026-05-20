'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
function fmt(n: number) { return n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'; }
function fmtM(n: number) { return `$${(n / 1_000_000).toFixed(1)}M`; }

export default function MonitorPage() {
  const [dealId, setDealId] = useState('');
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    if (!dealId.trim()) return;
    setLoading(true);
    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/monitor/projects/${dealId}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setDash(d.data);
    setLoading(false);
  }

  const statusColor = (s: string) => s === 'green' ? 'var(--sage)' : s === 'yellow' ? 'var(--gold)' : s === 'red' ? 'var(--alert)' : 'var(--moss)';

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 8 }}>Project Monitor</h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 24 }}>Construction oversight. Budget. Schedule. Presales. Debt service.</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'end' }}>
        <label style={{ flex: 1 }}>
          <span className="moss" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Deal ID</span>
          <input className="nest-input" placeholder="Enter deal ID..." value={dealId} onChange={e => setDealId(e.target.value)} />
        </label>
        <button className="btn-gold" onClick={loadDashboard} disabled={loading}>{loading ? 'Loading...' : 'Load Dashboard'}</button>
      </div>

      {dash?.error && <div className="card-alert" style={{ marginBottom: 16 }}>{dash.error}</div>}

      {dash && !dash.error && (
        <>
          <div className="serif" style={{ fontSize: 24, color: 'var(--cream)', marginBottom: 16 }}>{dash.project_name}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* BUDGET */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-header" style={{ marginBottom: 0 }}>Budget Status</div>
                <span className="status-dot" style={{ background: statusColor(dash.budget?.status) }} />
              </div>
              <div className="progress-track" style={{ marginBottom: 12 }}>
                <div className={`progress-fill ${dash.budget?.status === 'green' ? 'progress-fill-green' : dash.budget?.status === 'red' ? 'progress-fill-red' : ''}`}
                  style={{ width: `${Math.min(dash.budget?.pct_spent || 0, 100)}%` }} />
              </div>
              <div className="data-row"><span className="data-label">GMP</span><span className="data-value gold">${fmt(dash.budget?.gmp_usd)}</span></div>
              <div className="data-row"><span className="data-label">Drawn to Date</span><span className="data-value">${fmt(dash.budget?.total_drawn_usd)}</span></div>
              <div className="data-row"><span className="data-label">Remaining</span><span className="data-value">${fmt(dash.budget?.budget_remaining_usd)}</span></div>
              <div className="data-row"><span className="data-label">Status</span><span className={`tag-${dash.budget?.status === 'green' ? 'green' : dash.budget?.status === 'red' ? 'red' : 'gold'}`}>{dash.budget?.status}</span></div>
            </div>

            {/* PRESALES */}
            <div className="card">
              <div className="section-header">Presales</div>
              <div className="kpi-value" style={{ fontSize: 36, marginBottom: 12 }}>{dash.presales?.presale_pct}%</div>
              <div className="mono sage" style={{ fontSize: 11, marginBottom: 12 }}>{dash.presales?.ilu_presold} of {dash.presales?.ilu_total} ILUs</div>
              <div style={{ marginBottom: 8 }}>
                <div className="mono moss" style={{ fontSize: 9, marginBottom: 4 }}>50% Gate (COA)</div>
                <div className="progress-track"><div className={`progress-fill ${dash.presales?.gate_50_achieved ? 'progress-fill-green' : ''}`} style={{ width: `${Math.min((dash.presales?.presale_pct || 0) / 50 * 100, 100)}%` }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="mono moss" style={{ fontSize: 9, marginBottom: 4 }}>70% Gate (Long-term Bond)</div>
                <div className="progress-track"><div className={`progress-fill ${dash.presales?.gate_70_achieved ? 'progress-fill-green' : ''}`} style={{ width: `${Math.min((dash.presales?.presale_pct || 0) / 70 * 100, 100)}%` }} /></div>
              </div>
              <div className="data-row"><span className="data-label">Entrance Fee Escrow</span><span className="data-value gold">${fmt(dash.presales?.entrance_fee_escrow_usd)}</span></div>
            </div>

            {/* SCHEDULE */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-header" style={{ marginBottom: 0 }}>Schedule</div>
                <span className="status-dot" style={{ background: statusColor(dash.schedule?.status) }} />
              </div>
              <div className="progress-track" style={{ marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${dash.schedule?.pct_complete || 0}%` }} />
              </div>
              <div className="data-row"><span className="data-label">Complete</span><span className="data-value">{dash.schedule?.pct_complete}%</span></div>
              <div className="data-row"><span className="data-label">Draws</span><span className="data-value">{dash.schedule?.draw_count}</span></div>
              <div className="data-row"><span className="data-label">Scheduled Completion</span><span className="data-value">{dash.schedule?.scheduled_completion || '—'}</span></div>
            </div>

            {/* DEBT SERVICE */}
            <div className="card">
              <div className="section-header">Debt Service</div>
              {dash.debt_service?.days_to_maturity != null && (
                <div className="kpi-value" style={{ fontSize: 36, color: statusColor(dash.debt_service.maturity_status), marginBottom: 8 }}>
                  {dash.debt_service.days_to_maturity}
                </div>
              )}
              <div className="mono sage" style={{ fontSize: 11, marginBottom: 12 }}>days to BAN maturity</div>
              <div className="data-row"><span className="data-label">BAN Amount</span><span className="data-value gold">${fmt(dash.debt_service?.ban_amount_usd)}</span></div>
              <div className="data-row"><span className="data-label">Maturity Date</span><span className="data-value">{dash.debt_service?.ban_maturity_date || '—'}</span></div>
              <div className="data-row"><span className="data-label">Refinance Ready</span><span className={dash.debt_service?.refinance_ready ? 'tag-green' : 'tag-red'}>{dash.debt_service?.refinance_ready ? 'YES' : 'NO'}</span></div>
            </div>
          </div>

          {/* MILESTONE GATE */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-header">Milestone Progress — Gate {dash.milestone?.current_gate} of {dash.milestone?.total_gates}</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < (dash.milestone?.current_gate || 0) ? 'var(--gold)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i < (dash.milestone?.current_gate || 0) ? 'var(--void)' : 'var(--moss)', fontWeight: 600 }}>
                    {i + 1}
                  </div>
                  {i < 9 && <div style={{ flex: 1, height: 1, background: i < (dash.milestone?.current_gate || 0) - 1 ? 'var(--gold)' : 'rgba(255,255,255,0.06)' }} />}
                </div>
              ))}
            </div>
            <div className="gold mono" style={{ fontSize: 12, marginTop: 8 }}>{dash.milestone?.pct_to_100_financing}% to 100% financing</div>
          </div>

          {/* ALERTS */}
          {dash.alerts?.length > 0 && (
            <div className="card">
              <div className="section-header">Active Alerts</div>
              {dash.alerts.map((a: any) => (
                <div key={a.id} className="card-alert" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={`tag-${a.severity === 'red' || a.severity === 'critical' ? 'red' : a.severity === 'yellow' ? 'gold' : 'green'}`} style={{ marginRight: 8 }}>{a.severity}</span>
                    <span style={{ fontSize: 12 }}>{a.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
