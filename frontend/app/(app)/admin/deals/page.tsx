'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
function fmt(n: number) { return n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'; }
function fmtM(n: number) { return n ? `$${(n / 1_000_000).toFixed(1)}M` : '—'; }

const STAGES = ['intake', 'credit_analysis', 'packaging', 'placement', 'committed', 'closed'];

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('nest_token');
    if (!token) return;
    fetch(`${API}/api/deals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.deals || d.data || [];
        setDeals(Array.isArray(list) ? list : Object.values(list));
      })
      .catch(() => {});
  }, []);

  const dscrColor = (d: number) => d >= 1.5 ? 'var(--sage)' : d >= 1.2 ? 'var(--gold)' : 'var(--alert)';
  const ltvColor = (l: number) => l > 75 ? 'var(--alert)' : l > 70 ? 'var(--gold)' : 'var(--sage)';

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 8 }}>Deal Pipeline</h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 24 }}>Active deals across all pipeline stages.</p>

      {/* KANBAN */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 8, marginBottom: 24, overflowX: 'auto' }}>
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => (d.stage || d.status || 'intake') === stage);
          return (
            <div key={stage}>
              <div className="mono moss" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, textAlign: 'center' }}>
                {stage.replace(/_/g, ' ')} ({stageDeals.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 200, background: 'rgba(3,10,6,0.3)', borderRadius: 6, padding: 6 }}>
                {stageDeals.map(deal => (
                  <div key={deal.id} className="card" style={{ cursor: 'pointer', padding: '12px 14px' }} onClick={() => setSelected(deal)}>
                    <div className="serif" style={{ fontSize: 15, marginBottom: 4 }}>{deal.name || deal.id}</div>
                    <div className="gold mono" style={{ fontSize: 14 }}>{fmtM(deal.bond_face || deal.size_usd || 0)}</div>
                    {deal.asset_type && <div className="tag-gray" style={{ marginTop: 4, display: 'inline-block', fontSize: 8 }}>{deal.asset_type}</div>}
                    <button className="btn-outline" style={{ marginTop: 8, fontSize: 9, padding: '4px 10px' }} onClick={(e) => { e.stopPropagation(); router.push(`/deals/${deal.id}`); }}>Open Command Center →</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED DEAL DETAIL */}
      {selected && (
        <div className="card" style={{ borderColor: 'var(--gold)', borderWidth: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="serif" style={{ fontSize: 28, color: 'var(--cream)' }}>{selected.name || selected.id}</div>
              <div className="mono moss" style={{ fontSize: 10 }}>{selected.asset_type || selected.asset_class || '—'} | {selected.stage || selected.status || '—'}</div>
            </div>
            <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            <div className="kpi"><div className="kpi-label">Bond Face</div><div className="kpi-value">{fmtM(selected.bond_face || selected.size_usd || 0)}</div></div>
            <div className="kpi"><div className="kpi-label">DSCR</div><div className="kpi-value" style={{ color: dscrColor(selected.dscr || 0) }}>{selected.dscr?.toFixed(2) || '—'}</div></div>
            <div className="kpi"><div className="kpi-label">LTV</div><div className="kpi-value" style={{ color: ltvColor(selected.ltv_pct || 0) }}>{selected.ltv_pct?.toFixed(1) || '—'}%</div></div>
            <div className="kpi"><div className="kpi-label">Grade</div><div className="kpi-value">{selected.grade || '—'}</div></div>
          </div>
          {selected.summary && <p className="sage" style={{ fontSize: 12, marginTop: 12 }}>{selected.summary}</p>}
        </div>
      )}

      {deals.length === 0 && (
        <div className="card-dark" style={{ textAlign: 'center', padding: 40 }}>
          <div className="sage" style={{ fontSize: 14 }}>No deals loaded. Backend may need authentication or deals to be created.</div>
        </div>
      )}
    </div>
  );
}
