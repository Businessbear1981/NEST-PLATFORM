'use client';
import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PLUGIN_META: Record<string, { label: string; color: string; logo: string; category: string }> = {
  claude:           { label: 'Claude',           color: '#D4A574', logo: 'C',  category: 'AI Intelligence' },
  chatgpt:          { label: 'ChatGPT',          color: '#10A37F', logo: 'G',  category: 'AI Intelligence' },
  grammarly:        { label: 'Grammarly',        color: '#15C39A', logo: 'Gr', category: 'AI Intelligence' },
  higgsfield:       { label: 'Higgsfield',       color: '#8B5CF6', logo: 'Hf', category: 'AI Intelligence' },
  fred:             { label: 'FRED',             color: '#2563EB', logo: 'FR', category: 'Market Data' },
  treasury_direct:  { label: 'Treasury Direct',  color: '#1E40AF', logo: 'TD', category: 'Market Data' },
  attom:            { label: 'ATTOM',            color: '#F59E0B', logo: 'AT', category: 'Property' },
  costar:           { label: 'CoStar',           color: '#0EA5E9', logo: 'CS', category: 'Property' },
  edgar:            { label: 'SEC EDGAR',        color: '#DC2626', logo: 'ED', category: 'Regulatory' },
  emma:             { label: 'EMMA/MSRB',        color: '#7C3AED', logo: 'EM', category: 'Regulatory' },
  finra_brokercheck:{ label: 'FINRA BrokerCheck', color: '#0D9488', logo: 'FN', category: 'Regulatory' },
  dnb:              { label: 'Dun & Bradstreet', color: '#EA580C', logo: 'DB', category: 'Credit' },
  rsmeans:          { label: 'RSMeans/Gordian',  color: '#65A30D', logo: 'RS', category: 'Construction' },
};

const TASK_TYPES = [
  'credit_memo', 'business_plan', 'risk_assessment', 'feasibility_narrative',
  'bd_outreach', 'investor_teaser', 'bond_structuring', 'executive_summary',
  'ma_analysis', 'legal_summary', 'second_opinion', 'general_research',
  'proofread', 'compliance_language', 'marketing_video', 'property_showcase',
];

export default function AIToolsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [rates, setRates] = useState<any>(null);
  const [taskType, setTaskType] = useState('credit_memo');
  const [prompt, setPrompt] = useState('');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [routing, setRouting] = useState(false);
  const [activePlugin, setActivePlugin] = useState<string | null>(null);

  const loadDashboard = useCallback(() => {
    const token = localStorage.getItem('nest_token');
    fetch(`${API}/api/nervous-system/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setDashboard(d.data)).catch(() => {});
    fetch(`${API}/api/data/market-rates`).then(r => r.json()).then(d => setRates(d.data)).catch(() => {});
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function routeTask() {
    if (!prompt.trim()) return;
    setRouting(true);
    // Determine which plugin will handle this
    const expectedPlugin = dashboard?.task_routing?.[taskType] || 'claude';
    setActivePlugin(expectedPlugin);

    const token = localStorage.getItem('nest_token');
    const res = await fetch(`${API}/api/nervous-system/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task_type: taskType, prompt }),
    });
    const d = await res.json();
    setRouteResult(d.data);
    setRouting(false);
    setTimeout(() => setActivePlugin(null), 3000);
    loadDashboard();
  }

  const plugins = dashboard?.plugins || {};
  const categories = ['AI Intelligence', 'Market Data', 'Property', 'Regulatory', 'Credit', 'Construction'];

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>
        Central Nervous System
      </h1>
      <p className="sage" style={{ fontSize: 13, marginBottom: 8, fontStyle: 'italic' }}>
        NEST Advisors is the power strip. {dashboard?.plugins_total || 0} plugins. {dashboard?.plugins_connected || 0} connected.
      </p>

      {/* System KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        <div className="kpi"><div className="kpi-label">Plugins</div><div className="kpi-value">{dashboard?.plugins_total || 0}</div></div>
        <div className="kpi"><div className="kpi-label">Connected</div><div className="kpi-value" style={{ color: 'var(--sage)' }}>{dashboard?.plugins_connected || 0}</div></div>
        <div className="kpi"><div className="kpi-label">Total Calls</div><div className="kpi-value">{dashboard?.total_calls || 0}</div></div>
        <div className="kpi"><div className="kpi-label">Error Rate</div><div className="kpi-value" style={{ color: (dashboard?.error_rate_pct || 0) > 5 ? 'var(--alert)' : 'var(--sage)' }}>{dashboard?.error_rate_pct || 0}%</div></div>
      </div>

      {/* Plugin Grid — Logos that light up */}
      {categories.map(cat => {
        const catPlugins = Object.entries(plugins).filter(
          ([name]) => PLUGIN_META[name]?.category === cat
        );
        if (catPlugins.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{cat}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {catPlugins.map(([name, info]: [string, any]) => {
                const meta = PLUGIN_META[name] || { label: name, color: '#666', logo: '?', category: '' };
                const connected = info.status === 'connected';
                const isActive = activePlugin === name;
                const glow = connected
                  ? isActive
                    ? `0 0 24px ${meta.color}88, 0 0 48px ${meta.color}44`
                    : `0 0 8px ${meta.color}33`
                  : 'none';

                return (
                  <div key={name} style={{
                    background: connected ? 'var(--forest)' : 'rgba(3,10,6,0.5)',
                    border: `1px solid ${connected ? meta.color + '55' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: 10,
                    padding: '16px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.4s ease',
                    boxShadow: glow,
                    opacity: connected ? 1 : 0.45,
                  }}>
                    {/* Logo circle */}
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: '50%',
                      background: connected
                        ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}44)`
                        : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${connected ? meta.color : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      fontSize: 13,
                      color: connected ? meta.color : '#444',
                      flexShrink: 0,
                      transition: 'all 0.4s ease',
                      boxShadow: isActive ? `0 0 16px ${meta.color}66` : 'none',
                      animation: isActive ? 'pulse 1s infinite' : 'none',
                    }}>
                      {meta.logo}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: connected ? 'var(--cream)' : '#555',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {meta.label}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5, marginTop: 3,
                      }}>
                        <span className="status-dot" style={{
                          width: 6, height: 6,
                          background: connected ? meta.color : '#333',
                          animation: isActive ? 'pulse 0.8s infinite' : connected ? 'pulse-dot 3s infinite' : 'none',
                        }} />
                        <span className="mono" style={{
                          fontSize: 8, color: connected ? meta.color : '#444',
                          letterSpacing: '.06em', textTransform: 'uppercase',
                        }}>
                          {isActive ? 'ACTIVE' : connected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      {info.calls > 0 && (
                        <div className="mono" style={{ fontSize: 8, color: 'var(--moss)', marginTop: 2 }}>
                          {info.calls} calls | {info.avg_latency_ms}ms avg
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Market Rates + Task Router */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>

        {/* Live Rates */}
        <div className="card">
          <div className="section-header">Live Market Rates</div>
          {rates && (
            <>
              <span className={rates.source === 'grok' ? 'tag-gold' : rates.source === 'FRED' ? 'tag-green' : 'tag-gray'}
                style={{ marginBottom: 12, display: 'inline-block' }}>
                Source: {rates.source}
              </span>
              {rates.rates ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {Object.entries(rates.rates).map(([k, v]: [string, any]) => (
                    <div key={k} className="kpi" style={{ padding: '10px 12px' }}>
                      <div className="kpi-label">{k.replace(/_/g, ' ')}</div>
                      <div className="kpi-value" style={{ fontSize: 18 }}>{typeof v === 'number' ? v.toFixed(2) : v}%</div>
                    </div>
                  ))}
                </div>
              ) : rates.treasury_10yr_pct ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                  <div className="kpi"><div className="kpi-label">10yr Treasury</div><div className="kpi-value" style={{ fontSize: 18 }}>{rates.treasury_10yr_pct}%</div></div>
                  <div className="kpi"><div className="kpi-label">SOFR</div><div className="kpi-value" style={{ fontSize: 18 }}>{rates.sofr_pct}%</div></div>
                  <div className="kpi"><div className="kpi-label">IG Spread</div><div className="kpi-value" style={{ fontSize: 18 }}>{rates.ig_spread_bps}bp</div></div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Task Router */}
        <div className="card">
          <div className="section-header">Route Task to Nervous System</div>
          <select className="nest-input nest-select" value={taskType} onChange={e => setTaskType(e.target.value)} style={{ marginBottom: 12 }}>
            {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="mono" style={{ fontSize: 9, color: 'var(--moss)', marginBottom: 8 }}>
            Routes to: <span style={{ color: PLUGIN_META[dashboard?.task_routing?.[taskType]]?.color || 'var(--gold)' }}>
              {PLUGIN_META[dashboard?.task_routing?.[taskType]]?.label || dashboard?.task_routing?.[taskType] || 'claude'}
            </span>
          </div>
          <textarea className="nest-input" rows={3} placeholder="Enter prompt..." value={prompt}
            onChange={e => setPrompt(e.target.value)} style={{ marginBottom: 12, resize: 'vertical' }} />
          <button className="btn-gold" onClick={routeTask} disabled={routing || !prompt.trim()}>
            {routing ? 'Processing...' : 'Send to Nervous System'}
          </button>
        </div>
      </div>

      {/* Route Result */}
      {routeResult && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${PLUGIN_META[routeResult.plugin]?.color || 'var(--gold)'}22`,
              border: `1px solid ${PLUGIN_META[routeResult.plugin]?.color || 'var(--gold)'}44`,
              borderRadius: 4, padding: '3px 10px',
              fontSize: 10, fontWeight: 600, color: PLUGIN_META[routeResult.plugin]?.color || 'var(--gold)',
              fontFamily: 'var(--font-mono)',
            }}>
              {PLUGIN_META[routeResult.plugin]?.logo || '?'} {PLUGIN_META[routeResult.plugin]?.label || routeResult.plugin}
            </span>
            {routeResult.model && <span className="tag-gray">{routeResult.model}</span>}
            <span className={routeResult.success ? 'tag-green' : 'tag-red'}>{routeResult.success ? 'Success' : 'Failed'}</span>
            {routeResult.latency_ms && <span className="mono moss" style={{ fontSize: 9 }}>{routeResult.latency_ms}ms</span>}
            {routeResult.tokens > 0 && <span className="mono moss" style={{ fontSize: 9 }}>{routeResult.tokens} tokens</span>}
            {routeResult.fallback_used && <span className="tag-gold">fallback: {routeResult.fallback_used}</span>}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--cream)' }}>
            {routeResult.content || routeResult.error || JSON.stringify(routeResult.data, null, 2)}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboard?.recent_calls?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="section-header">Recent Nervous System Activity</div>
          <table className="nest-table">
            <thead><tr><th>Time</th><th>Task</th><th>Plugin</th><th>Fallback</th><th>Status</th><th>Latency</th></tr></thead>
            <tbody>
              {dashboard.recent_calls.slice(-10).reverse().map((call: any, i: number) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 10, color: 'var(--moss)' }}>{call.timestamp?.split('T')[1]?.split('.')[0]}</td>
                  <td style={{ textTransform: 'capitalize' }}>{call.task_type?.replace(/_/g, ' ')}</td>
                  <td>
                    <span style={{
                      color: PLUGIN_META[call.plugin]?.color || 'var(--sage)',
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                    }}>
                      {PLUGIN_META[call.plugin]?.label || call.plugin}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 10 }}>{call.fallback || '—'}</td>
                  <td><span className={call.success ? 'tag-green' : 'tag-red'}>{call.success ? 'OK' : 'FAIL'}</span></td>
                  <td className="mono" style={{ fontSize: 10 }}>{call.latency_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
