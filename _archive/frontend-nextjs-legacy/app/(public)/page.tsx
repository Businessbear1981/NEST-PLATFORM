'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const C = {
  void: '#030A06', forest: '#0D2218', gold: '#C4A048', goldHi: '#E8C87A',
  sage: '#7A9A82', cream: '#EDE8DC', moss: '#2D4A35', navy: '#060E1A', green: '#1E4A2E',
  alert: '#EF4444', goldBorder: 'rgba(196,160,72,0.20)',
};
const F = {
  heading: 'var(--font-cormorant), "Cormorant Garamond", serif',
  body: 'var(--font-space), "Space Grotesk", sans-serif',
  mono: 'var(--font-mono), "IBM Plex Mono", monospace',
};

interface Signals { treasury_10y?: number; sofr?: number; ig_spread?: number; refi_market?: string }
interface Metrics { total_deals?: number; active_deals?: number; total_pipeline_usd?: number; agents_active?: number; agents_total?: number }
interface WarChest { aum_usd?: number; ytd_return_pct?: number; war_chest_usd?: number; lc_capacity_usd?: number; lc_phase?: string; ma_deployment_usd?: number }

const fmtPct = (n?: number) => n != null ? `${n.toFixed(2)}%` : '—';
const fmtUSD = (n?: number) => { if (!n) return '—'; if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`; if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`; return `$${n.toLocaleString()}`; };

export default function PublicHome() {
  const [signals, setSignals] = useState<Signals | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [wc, setWc] = useState<WarChest | null>(null);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/api/market/signals/latest`).then(r => r.json()),
      fetch(`${API}/api/metrics`).then(r => r.json()),
      fetch(`${API}/api/fund/hft/war-chest`).then(r => r.json()),
    ]).then(([s, m, w]) => {
      if (s.status === 'fulfilled') setSignals(s.value.data ?? s.value);
      if (m.status === 'fulfilled') setMetrics(m.value.data ?? m.value);
      if (w.status === 'fulfilled') setWc(w.value.data ?? w.value);
    });
  }, []);

  return (
    <div style={{ background: C.void, color: C.cream, minHeight: '100vh', fontFamily: F.body }}>

      {/* ═══════ STICKY NAV ═══════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,10,6,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.goldBorder}`, padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: F.heading, fontSize: 22, color: C.gold, letterSpacing: '.14em', fontWeight: 500 }}>NEST</span>
          <span style={{ fontFamily: F.mono, fontSize: 8, color: C.moss, letterSpacing: '.1em', textTransform: 'uppercase' }}>Arden Edge Capital &times; Soparrow Capital</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Structure', 'Platform', 'Founders', 'Marketplace'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.sage, textDecoration: 'none', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>{l}</a>
          ))}
          <Link href="/roots" style={{ color: C.gold, textDecoration: 'none', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>The Roots</Link>
          <Link href="/login" style={{ border: `1px solid ${C.gold}`, color: C.gold, padding: '6px 18px', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}>Client Login</Link>
        </div>
      </nav>

      {/* ═══════ LIVE RATE TICKER ═══════ */}
      <div style={{ background: C.navy, padding: '9px 48px', display: 'flex', gap: 48, justifyContent: 'center', fontSize: 11, fontFamily: F.mono, borderBottom: `1px solid ${C.forest}` }}>
        {[
          { label: '10yr Treasury', value: fmtPct(signals?.treasury_10y) },
          { label: 'SOFR', value: fmtPct(signals?.sofr) },
          { label: 'IG Spread', value: signals?.ig_spread != null ? `${signals.ig_spread}bps` : '—' },
          { label: 'Refi Market', value: signals?.refi_market ?? '—' },
        ].map(t => (
          <span key={t.label} style={{ color: C.moss }}>{t.label} <span style={{ color: C.gold, fontWeight: 600 }}>{t.value}</span></span>
        ))}
      </div>

      {/* ═══════ HERO — NEST TREE PHOTO + ANIMATED ROOTS ═══════ */}
      <style>{`
        @keyframes drawRoot { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
        .root-line { stroke-dasharray: 500; stroke-dashoffset: 500; fill: none; stroke-linecap: round; }
        .root-1 { animation: drawRoot 1.4s ease forwards 0.5s; }
        .root-2 { animation: drawRoot 1.4s ease forwards 0.8s; }
        .root-3 { animation: drawRoot 1.4s ease forwards 1.1s; }
        .root-4 { animation: drawRoot 1.4s ease forwards 1.4s; }
        .root-5 { animation: drawRoot 1.4s ease forwards 1.7s; }
        .root-6 { animation: drawRoot 1.4s ease forwards 2.0s; }
      `}</style>
      <section style={{ padding: '60px 48px 20px', textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
        {/* Tree photo — white removed */}
        <div style={{
          margin: '0 auto 0',
          width: 400,
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
        }}>
          <img
            src="/nest-tree.webp"
            alt="NEST"
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
          {/* Vignette — feather into void */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, ${C.void} 78%)`,
            pointerEvents: 'none',
          }} />
        </div>
        {/* Animated gold roots — from tree base down to card positions */}
        <div style={{ margin: '-10px auto 0', width: '100%', maxWidth: 1100 }}>
          <svg viewBox="0 0 1100 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 160, display: 'block' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C4A048" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E8C87A" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g filter="url(#glow)">
              {/* Root 1 → Credit Engine (left card) */}
              <path className="root-line root-1" d="M550,0 C530,40 400,80 183,155" stroke="url(#goldGrad)" strokeWidth="2.5" />
              {/* Root 2 → Call/Put (center-left card) */}
              <path className="root-line root-2" d="M550,0 C545,50 500,100 550,155" stroke="url(#goldGrad)" strokeWidth="2" />
              {/* Root 3 → HFT War Chest (center-right card) */}
              <path className="root-line root-3" d="M550,0 C555,50 600,100 917,155" stroke="url(#goldGrad)" strokeWidth="2" />
              {/* Root 4 → M&A Intelligence (left card row 2) */}
              <path className="root-line root-4" d="M550,0 C520,30 350,60 183,155" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.5" />
              {/* Root 5 → Lender Sourcing (center card row 2) */}
              <path className="root-line root-5" d="M550,0 C550,40 550,80 550,155" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.5" />
              {/* Root 6 → Risk + Surety (right card row 2) */}
              <path className="root-line root-6" d="M550,0 C580,30 750,60 917,155" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.5" />
            </g>
          </svg>
        </div>
        <h1 style={{ fontFamily: F.heading, fontSize: 120, fontWeight: 300, letterSpacing: '.22em', margin: 0, lineHeight: 1, color: C.cream }}>
          N<span style={{ color: C.gold }}>E</span>ST
        </h1>
        <p style={{ fontFamily: F.heading, fontSize: 24, fontStyle: 'italic', color: C.sage, marginTop: 20, letterSpacing: 2 }}>The Architecture of Permanent Wealth.</p>
        <p style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.moss, marginTop: 24 }}>Arden Edge Capital &times; Soparrow Capital</p>
        <div style={{ marginTop: 36, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a href="#platform" className="btn-gold" style={{ textDecoration: 'none', padding: '13px 32px', fontSize: 12 }}>View Active Deals</a>
          <Link href="/login" className="btn-outline" style={{ textDecoration: 'none', padding: '13px 32px', fontSize: 12 }}>Investor Access</Link>
        </div>
      </section>

      {/* ═══════ LIVE METRICS STRIP ═══════ */}
      <section style={{ background: C.forest, borderTop: `1px solid ${C.moss}`, borderBottom: `1px solid ${C.moss}`, padding: '40px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { n: fmtUSD(metrics?.total_pipeline_usd || 591_000_000), cap: 'Pipeline' },
            { n: '10–15×', cap: 'Refi cycles per bond' },
            { n: `${metrics?.agents_total || 15}`, cap: 'AI agents · 24/7' },
            { n: '∞', cap: 'Perpetual equity' },
          ].map(s => (
            <div key={s.cap}>
              <div style={{ fontFamily: F.mono, fontSize: 36, fontWeight: 600, color: C.gold }}>{s.n}</div>
              <div style={{ fontSize: 11, color: C.sage, marginTop: 6, textTransform: 'uppercase', letterSpacing: 2 }}>{s.cap}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ THE PLATFORM — WHAT WE ACTUALLY BUILT ═══════ */}
      <section id="platform" style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-eye">The Platform</div>
        <h2 style={{ fontFamily: F.heading, fontSize: 36, fontWeight: 400, textAlign: 'center', margin: '0 0 16px' }}>Six engines. One trunk. Every root feeds the canopy.</h2>
        <p style={{ textAlign: 'center', color: C.sage, fontSize: 14, maxWidth: 650, margin: '0 auto 56px', lineHeight: 1.8 }}>
          Every tool below is live. Every API endpoint returns real data. The credit engine grades in real time.
          The call/put optimizer watches rates every 15 minutes. The war chest compounds.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              title: 'Credit Engine',
              desc: 'JPMorgan-grade credit analysis. DSCR, LTV, cash flow leverage, balance sheet leverage, debt-to-EBITDA, interest coverage. Six metrics. Six JPM benchmarks. Obligor grade A through Sub-IG. Every deal scored on entry.',
              metric: '6 JPM benchmarks',
              tag: 'LIVE',
              endpoint: '/api/bond-tools/grade',
            },
            {
              title: 'Call / Put Optimization',
              desc: 'Vector watches 14 market signals every 15 minutes. Rate falls 50bps — we call the bond, reissue lower, earn the arrangement fee. Rate rises 75bps — Apex activates the short. Every event recorded on Polygon.',
              metric: '-50bps = CALL',
              tag: 'VECTOR',
              endpoint: '/api/market/signals/latest',
            },
            {
              title: 'HFT War Chest',
              desc: `B tranche AUM runs through 5 algorithmic strategies. ${fmtPct(wc?.ytd_return_pct)} YTD. Surplus above B coupon service flows to the war chest. War chest funds M&A equity. The roots that feed everything.`,
              metric: fmtUSD(wc?.war_chest_usd) + ' surplus',
              tag: 'QUANTUM',
              endpoint: '/api/fund/hft/war-chest',
            },
            {
              title: 'M&A Intelligence',
              desc: 'Merlin scans 20 NAICS codes. 8-dimension scoring: financial quality, market position, scalability, management, IPO readiness, bolt-on potential, universe analysis, NEST alignment. Game theory prices every bid.',
              metric: '8-dim scoring',
              tag: 'MERLIN',
              endpoint: '/api/ma',
            },
            {
              title: 'Direct Lender Sourcing',
              desc: 'LenderScout matches from 800+ direct lenders. 10-dimension fit scoring. Nash equilibrium negotiation. Bayesian estimation of true rate floors. NEST earns 0.5-1% placement fee at close.',
              metric: '800+ lenders',
              tag: 'LENDERSCOUT',
              endpoint: '/api/lenders-direct',
            },
            {
              title: 'Risk + Surety',
              desc: 'Sentinel monitors 7 risk dimensions continuously. Market, construction, credit, operational, regulatory, sponsor, environmental. Hylant surety wraps every A tranche. LTV above 75% — flagged, restructured, protected.',
              metric: '7 dimensions',
              tag: 'SENTINEL',
              endpoint: '/api/risk',
            },
          ].map((tool, i) => (
            <div key={tool.title} className="nest-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12, animation: `fadeInUp 0.6s ease forwards ${0.1 + i * 0.1}s`, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: F.heading, fontSize: 22, fontWeight: 400, margin: 0 }}>{tool.title}</h3>
                <span className="tag-gold" style={{ fontSize: 9 }}>{tool.tag}</span>
              </div>
              <p style={{ fontSize: 13, color: C.sage, lineHeight: 1.75, margin: 0, flex: 1 }}>{tool.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `0.5px solid ${C.goldBorder}`, paddingTop: 12 }}>
                <span style={{ fontFamily: F.mono, fontSize: 13, color: C.gold, fontWeight: 600 }}>{tool.metric}</span>
                <span style={{ fontFamily: F.mono, fontSize: 9, color: C.moss }}>{tool.endpoint}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CAPITAL STRUCTURE ═══════ */}
      <section id="structure" style={{ padding: '80px 48px', background: C.navy, borderTop: `1px solid ${C.forest}`, borderBottom: `1px solid ${C.forest}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-eye">Capital Structure</div>
          <h2 style={{ fontFamily: F.heading, fontSize: 36, fontWeight: 400, textAlign: 'center', margin: '0 0 48px' }}>The bond is the beginning. Not the end.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <div className="nest-card">
              <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, margin: '0 0 16px' }}>Series A — Investment Grade</h3>
              {[
                ['LTC', '75%'],
                ['Grade', 'A / BBB+'],
                ['Credit Enhancement', 'Hylant surety or LC'],
                ['Coupon', '6.5–7.5%'],
                ['Refi Cycles', '10–15 over bond life'],
                ['Arrangement Fee', '1.5% per cycle'],
              ].map(([k, v]) => (
                <div key={k} className="data-row"><span className="data-label">{k}</span><span className="data-value gold">{v}</span></div>
              ))}
            </div>
            <div className="nest-card">
              <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, margin: '0 0 16px' }}>Series B — Bank-Managed AUM</h3>
              {[
                ['CLTV', '82% (+7% addon)'],
                ['Grade', 'BBB / BB+'],
                ['Coupon', '10–14%'],
                ['AUM Destination', 'HFT fund → 20%+ return'],
                ['Surplus', 'War chest → M&A equity'],
                ['LC Phase', wc?.lc_phase?.replace('_', ' ').toUpperCase() || 'PHASE 2'],
              ].map(([k, v]) => (
                <div key={k} className="data-row"><span className="data-label">{k}</span><span className="data-value gold">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ THREE MARKET MOVES ═══════ */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-eye">Market Response</div>
        <h2 style={{ fontFamily: F.heading, fontSize: 36, fontWeight: 400, textAlign: 'center', margin: '0 0 48px' }}>Every market move is a decision. We make it first.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { idx: '01', trigger: 'Rate falls.', outcome: 'Vector detects -50bps. We call the bond. Reissue at the lower rate. Client saves on debt service. NEST earns 1.5% arrangement fee. Blockchain records the event. Cycle repeats.', color: C.gold },
            { idx: '02', trigger: 'Rate rises.', outcome: 'Vector detects +75bps. Apex activates the short position — TLT puts, T-note futures, interest rate swaps. Your bond stays protected. Hedge profits offset rate pressure.', color: C.alert },
            { idx: '03', trigger: 'Market flat.', outcome: 'B tranche AUM earns 20%+ in the managed fund. Treasury arbitrage, MBS basis, corp bond momentum. Surplus builds the war chest. War chest funds the next acquisition.', color: C.sage },
          ].map(m => (
            <div key={m.idx} className="nest-card" style={{ padding: '36px 28px', borderColor: `${m.color}33` }}>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.moss }}>Move {m.idx}</span>
              <h3 style={{ fontFamily: F.heading, fontSize: 28, fontWeight: 400, margin: '12px 0 0', color: m.color }}>{m.trigger}</h3>
              <p style={{ fontSize: 13, color: C.sage, lineHeight: 1.8, marginTop: 16 }}>{m.outcome}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HFT WAR CHEST LIVE TICKER ═══════ */}
      {wc && (
        <section style={{ background: C.navy, borderTop: `1px solid ${C.forest}`, borderBottom: `1px solid ${C.forest}`, padding: '32px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, textAlign: 'center' }}>
            {[
              { label: 'AUM', value: fmtUSD(wc.aum_usd) },
              { label: 'YTD Return', value: fmtPct(wc.ytd_return_pct) },
              { label: 'War Chest', value: fmtUSD(wc.war_chest_usd) },
              { label: 'LC Capacity', value: fmtUSD(wc.lc_capacity_usd) },
              { label: 'M&A Deploy', value: fmtUSD(wc.ma_deployment_usd) },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.moss, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 600, color: C.gold }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ AGENT FLEET ═══════ */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-eye">Agent Fleet</div>
        <h2 style={{ fontFamily: F.heading, fontSize: 36, fontWeight: 400, textAlign: 'center', margin: '0 0 48px' }}>15 AI agents. Running 24/7. Zero human bottleneck.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { name: 'Vector', role: 'Call/put timing' },
            { name: 'Apex', role: 'Short positions' },
            { name: 'Morgan', role: 'Jimmy Lee voice' },
            { name: 'Merlin', role: 'M&A intelligence' },
            { name: 'LenderScout', role: 'Lender sourcing' },
            { name: 'Prometheus', role: 'Financial modeling' },
            { name: 'Sentinel', role: 'Risk monitoring' },
            { name: 'Maxwell', role: 'Credit analysis' },
            { name: 'Quantum', role: 'HFT optimizer' },
            { name: 'Sterling', role: 'Investor placement' },
            { name: 'Aria', role: 'Client outreach' },
            { name: 'Chain', role: 'Blockchain exec' },
            { name: 'Atlas', role: 'Proforma modeling' },
            { name: 'Bridge', role: 'Perm debt monitor' },
            { name: 'Blaze', role: 'Marketing engine' },
          ].map(a => (
            <div key={a.name} className="nest-card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', margin: '0 auto 8px', boxShadow: '0 0 6px #4ade8066', animation: 'pulse-dot 2s infinite' }} />
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.cream, fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontSize: 9, color: C.moss, marginTop: 2 }}>{a.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FOUNDERS ═══════ */}
      <section id="founders" style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-eye">Founders</div>
        <h2 style={{ fontFamily: F.heading, fontSize: 36, fontWeight: 400, textAlign: 'center', margin: '0 0 48px' }}>Pacific Northwest. Built to last.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div className="nest-card" style={{ padding: '36px 32px' }}>
            <h3 style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 400, margin: 0 }}>Sean Gilmore</h3>
            <p style={{ fontSize: 13, color: C.gold, margin: '6px 0 0', letterSpacing: 1, fontFamily: F.mono }}>CEO &middot; Arden Edge Capital</p>
            <p style={{ fontSize: 14, color: C.sage, lineHeight: 1.8, marginTop: 18 }}>
              Thirteen years at JPMorgan Chase. Business Banking, Emerging Middle Market, Mid Corp.
              He had the pen. He closed the deals. Now he built the machine that never stops closing.
            </p>
          </div>
          <div className="nest-card" style={{ padding: '36px 32px' }}>
            <h3 style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 400, margin: 0 }}>Josh Edwards</h3>
            <p style={{ fontSize: 13, color: C.gold, margin: '6px 0 0', letterSpacing: 1, fontFamily: F.mono }}>Co-Founder &middot; Soparrow Capital</p>
            <p style={{ fontSize: 14, color: C.sage, lineHeight: 1.8, marginTop: 18 }}>
              Capital markets. Deal origination. Pacific Northwest through and through.
              The partner who makes the structure work in the real world.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ PHILOSOPHY ═══════ */}
      <section style={{ background: C.navy, padding: '80px 48px', textAlign: 'center', borderTop: `1px solid ${C.forest}`, borderBottom: `1px solid ${C.forest}` }}>
        <div style={{ fontFamily: F.mono, fontSize: 32, color: C.gold, marginBottom: 24 }}>♛ Q:E6</div>
        <blockquote style={{ fontFamily: F.heading, fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: C.cream, maxWidth: 800, margin: '0 auto', lineHeight: 1.7 }}>
          &ldquo;The deal is not the event. The deal is the beginning of a permanent position.
          We structure the bond. We manage every cycle. We retain the equity.
          The lifecycle is the product.&rdquo;
        </blockquote>
        <p style={{ fontSize: 12, color: C.gold, marginTop: 24, letterSpacing: 2, fontFamily: F.mono }}>&mdash; NEST Investment Thesis</p>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ padding: '48px', borderTop: `1px solid ${C.forest}`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontFamily: F.heading, fontSize: 22, fontWeight: 500, color: C.gold, letterSpacing: '.14em' }}>NEST</span>
            <p style={{ fontSize: 11, color: C.moss, marginTop: 8, fontFamily: F.mono }}>Arden Edge Capital &times; Soparrow Capital</p>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Structure', 'Platform', 'Founders'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.sage, textDecoration: 'none', fontSize: 11, letterSpacing: 1 }}>{l}</a>
            ))}
            <Link href="/login" style={{ color: C.gold, textDecoration: 'none', fontSize: 11, letterSpacing: 1 }}>Login</Link>
          </div>
        </div>
        <p style={{ fontSize: 9, color: `${C.moss}99`, marginTop: 32, lineHeight: 1.7, maxWidth: 700 }}>
          This site is for informational purposes only and does not constitute an offer to sell
          or a solicitation of an offer to buy any securities. Securities offered through
          private placement memorandum to accredited investors only. Past performance is not
          indicative of future results. All investments involve risk including loss of principal.
          &copy; {new Date().getFullYear()} Arden Edge Capital LLC &times; Soparrow Capital. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
