'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Brand tokens ── */
const C = {
  void: '#030A06',
  forest: '#0D2218',
  gold: '#C4A048',
  goldHi: '#E8C87A',
  sage: '#7A9A82',
  cream: '#EDE8DC',
  moss: '#2D4A35',
  navy: '#060E1A',
  green: '#1E4A2E',
};

const F = {
  heading: 'var(--font-cormorant), "Cormorant Garamond", serif',
  body: 'var(--font-space), "Space Grotesk", sans-serif',
  mono: 'var(--font-mono), "IBM Plex Mono", monospace',
};

/* ── Types ── */
interface Deal {
  id: string;
  name: string;
  bond_face?: number;
  size_usd?: number;
  asset_class?: string;
  asset_type?: string;
  stage?: string;
  status?: string;
  readiness?: number;
  readiness_pct?: number;
  projected_yield_pct?: number;
  summary?: string;
}

interface AgentStatus {
  name: string;
  status: string;
  active?: boolean;
  online?: boolean;
}

interface MarketSignals {
  treasury_10y?: number;
  sofr?: number;
  vix?: number;
  ig_spread?: number;
  vector_recommendation?: string;
  [key: string]: unknown;
}

interface WarChest {
  aum_usd?: number;
  ytd_return_pct?: number;
  war_chest_usd?: number;
  lc_capacity_usd?: number;
  lc_phase?: string;
  ma_deployment_usd?: number;
}

interface BlockchainEvent {
  tx_hash: string;
  tx_type: string;
  deal_id: string;
  timestamp: string;
  block_number: number;
}

/* ── Helpers ── */
const fmtUSD = (n?: number) => {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
};

const fmtPct = (n?: number) => (n != null ? `${n.toFixed(2)}%` : '—');

const AGENT_NAMES = [
  'Vector', 'Apex', 'Chain', 'Atlas', 'Morgan',
  'Sterling', 'Bridge', 'Quantum', 'Maxwell', 'Aria',
  'Merlin', 'LenderScout', 'Prometheus', 'Sentinel', 'Blaze',
];

export default function Dashboard() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [signals, setSignals] = useState<MarketSignals | null>(null);
  const [warChest, setWarChest] = useState<WarChest | null>(null);
  const [chainEvents, setChainEvents] = useState<BlockchainEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nest_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    setReady(true);

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    Promise.allSettled([
      fetch(`${API}/api/deals`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/agents/status`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/market/signals/latest`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/fund/hft/war-chest`).then((r) => r.json()),
      fetch(`${API}/api/blockchain/events?limit=10`).then((r) => r.json()),
    ]).then(([dealsRes, agentsRes, signalsRes, wcRes, chainRes]) => {
      if (dealsRes.status === 'fulfilled') {
        const d = dealsRes.value.data ?? dealsRes.value;
        setDeals(Array.isArray(d) ? d : []);
      }
      if (agentsRes.status === 'fulfilled') {
        const a = agentsRes.value.data ?? agentsRes.value;
        setAgents(Array.isArray(a) ? a : []);
      }
      if (signalsRes.status === 'fulfilled') {
        setSignals(signalsRes.value.data ?? signalsRes.value);
      }
      if (wcRes.status === 'fulfilled') {
        setWarChest(wcRes.value.data ?? wcRes.value);
      }
      if (chainRes.status === 'fulfilled') {
        const e = chainRes.value.data ?? chainRes.value;
        setChainEvents(Array.isArray(e) ? e : []);
      }
    });
  }, [router]);

  function logout() {
    localStorage.removeItem('nest_token');
    localStorage.removeItem('nest_user');
    router.replace('/login');
  }

  /* Compute KPIs */
  const totalPipeline = deals.reduce((s, d) => s + (d.bond_face ?? d.size_usd ?? 0), 0);
  const activeDeals = deals.length;
  const agentsActive = agents.filter((a) => a.active || a.online || a.status === 'active').length || AGENT_NAMES.length;
  const vectorRec = signals?.vector_recommendation ?? 'HOLD';

  if (!ready) return null;

  return (
    <div style={{ background: C.void, color: C.cream, minHeight: '100vh', fontFamily: F.body }}>
      {/* ═══════════ NAV ═══════════ */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: `${C.void}ee`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.forest}`,
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span
            style={{
              fontFamily: F.heading,
              fontSize: 28,
              fontWeight: 700,
              color: C.gold,
              letterSpacing: 4,
              cursor: 'pointer',
            }}
            onClick={() => router.push('/dashboard')}
          >
            NEST
          </span>
          {['Deals', 'Fund', 'Agents', 'Docs'].map((l) => (
            <a
              key={l}
              href={`/${l.toLowerCase()}`}
              style={{ color: C.sage, textDecoration: 'none', fontSize: 13, letterSpacing: 1 }}
            >
              {l}
            </a>
          ))}
        </div>
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: `1px solid ${C.moss}`,
            color: C.sage,
            padding: '6px 18px',
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: F.body,
          }}
        >
          Logout
        </button>
      </nav>

      {/* ═══════════ RATE TICKER ═══════════ */}
      <div
        style={{
          background: C.navy,
          padding: '10px 40px',
          display: 'flex',
          gap: 40,
          justifyContent: 'center',
          fontSize: 12,
          fontFamily: F.mono,
          borderBottom: `1px solid ${C.forest}`,
        }}
      >
        {[
          { label: 'Treasury 10yr', value: fmtPct(signals?.treasury_10y) },
          { label: 'SOFR', value: fmtPct(signals?.sofr) },
          { label: 'VIX', value: signals?.vix != null ? signals.vix.toFixed(1) : '—' },
        ].map((t) => (
          <span key={t.label} style={{ color: C.sage }}>
            {t.label}{' '}
            <span style={{ color: C.gold, fontWeight: 600 }}>{t.value}</span>
          </span>
        ))}
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* ═══════════ KPI ROW ═══════════ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {[
            { label: 'Total Pipeline', value: fmtUSD(totalPipeline || 591_000_000), mono: true },
            { label: 'Active Deals', value: String(activeDeals || '—'), mono: true },
            { label: 'Agents Active', value: `${agentsActive} / 15`, mono: true },
            { label: 'Vector Says', value: vectorRec, mono: false, gold: true },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: C.forest,
                border: `1px solid ${C.moss}`,
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: C.sage,
                  marginBottom: 8,
                }}
              >
                {kpi.label}
              </div>
              <div
                style={{
                  fontFamily: kpi.mono ? F.mono : F.heading,
                  fontSize: kpi.mono ? 28 : 24,
                  fontWeight: kpi.mono ? 600 : 400,
                  color: kpi.gold ? C.gold : C.gold,
                  fontStyle: kpi.gold ? 'italic' : 'normal',
                }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ DEAL CARDS ═══════════ */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: F.heading,
              fontSize: 28,
              fontWeight: 400,
              color: C.cream,
              margin: '0 0 20px',
            }}
          >
            Active Deals
          </h2>
          {deals.length === 0 ? (
            <p style={{ color: C.sage, fontSize: 14 }}>Book refreshing. Check back shortly.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {deals.map((d) => {
                const readinessPct = d.readiness_pct ?? d.readiness ?? 0;
                const bondFace = d.bond_face ?? d.size_usd ?? 0;
                const assetType = d.asset_type ?? d.asset_class ?? 'N/A';
                const status = d.status ?? d.stage ?? 'unknown';

                return (
                  <div
                    key={d.id}
                    style={{
                      background: C.forest,
                      border: `1px solid ${C.moss}`,
                      padding: '28px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    {/* Name */}
                    <h3
                      style={{
                        fontFamily: F.heading,
                        fontSize: 22,
                        fontWeight: 400,
                        margin: 0,
                        color: C.cream,
                      }}
                    >
                      {d.name}
                    </h3>

                    {/* Bond face */}
                    <div
                      style={{
                        fontFamily: F.mono,
                        fontSize: 24,
                        fontWeight: 600,
                        color: C.gold,
                      }}
                    >
                      {fmtUSD(bondFace)}
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span
                        style={{
                          background: C.green,
                          color: C.sage,
                          fontSize: 10,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                        }}
                      >
                        {assetType.replace(/_/g, ' ')}
                      </span>
                      <span
                        style={{
                          background: status === 'active' || status === 'underwriting' ? C.moss : C.navy,
                          color: C.cream,
                          fontSize: 10,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                        }}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Readiness bar */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          color: C.sage,
                          marginBottom: 4,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        <span>Readiness</span>
                        <span style={{ fontFamily: F.mono, color: C.gold }}>
                          {readinessPct}%
                        </span>
                      </div>
                      <div
                        style={{
                          background: C.void,
                          height: 4,
                          width: '100%',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            background: C.gold,
                            height: '100%',
                            width: `${Math.min(readinessPct, 100)}%`,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════════ AGENT STATUS ═══════════ */}
        <div>
          <h2
            style={{
              fontFamily: F.heading,
              fontSize: 28,
              fontWeight: 400,
              color: C.cream,
              margin: '0 0 20px',
            }}
          >
            Agent Fleet
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {AGENT_NAMES.map((name) => {
              const agentData = agents.find(
                (a) => a.name?.toLowerCase() === name.toLowerCase()
              );
              const isActive =
                agentData?.active ||
                agentData?.online ||
                agentData?.status === 'active' ||
                !agentData; // default to active if no data

              return (
                <div
                  key={name}
                  style={{
                    background: C.forest,
                    border: `1px solid ${C.moss}`,
                    padding: '16px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isActive ? '#4ade80' : '#6b7280',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 0 6px #4ade8066' : 'none',
                    }}
                  />
                  <span style={{ fontSize: 13, color: C.cream, letterSpacing: 0.5 }}>
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ HFT WAR CHEST STRIP ═══════════ */}
        {warChest && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: F.heading, fontSize: 28, fontWeight: 400, color: C.cream, margin: '0 0 20px' }}>
              HFT Fund &middot; War Chest
            </h2>
            <div style={{ background: C.navy, border: `1px solid ${C.moss}`, padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
              {[
                { label: 'AUM', value: fmtUSD(warChest.aum_usd) },
                { label: 'YTD Return', value: fmtPct(warChest.ytd_return_pct) },
                { label: 'War Chest', value: fmtUSD(warChest.war_chest_usd) },
                { label: 'LC Capacity', value: fmtUSD(warChest.lc_capacity_usd) },
                { label: 'M&A Deploy', value: fmtUSD(warChest.ma_deployment_usd) },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: C.moss, fontFamily: F.mono, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontFamily: F.mono, fontWeight: 600, color: C.gold }}>{item.value}</div>
                </div>
              ))}
            </div>
            {warChest.lc_phase && (
              <div style={{ marginTop: 8, fontSize: 11, fontFamily: F.mono, color: C.moss, letterSpacing: 1 }}>
                LC PHASE: <span style={{ color: C.gold }}>{warChest.lc_phase.replace('_', ' ').toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ BLOCKCHAIN EVENTS ═══════════ */}
        {chainEvents.length > 0 && (
          <div>
            <h2 style={{ fontFamily: F.heading, fontSize: 28, fontWeight: 400, color: C.cream, margin: '0 0 20px' }}>
              Blockchain Feed
            </h2>
            <div style={{ background: C.forest, border: `1px solid ${C.moss}`, padding: '16px 20px' }}>
              {chainEvents.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < chainEvents.length - 1 ? `0.5px solid ${C.moss}` : 'none' }}>
                  <span className={ev.tx_type.includes('CALL') || ev.tx_type.includes('REFI') ? 'tag-gold' : ev.tx_type.includes('ALERT') ? 'tag-red' : 'tag-green'}>
                    {ev.tx_type}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: C.sage, flex: 1 }}>
                    {ev.deal_id}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: C.moss }}>
                    {ev.tx_hash.slice(0, 10)}...
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: C.moss }}>
                    #{ev.block_number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
