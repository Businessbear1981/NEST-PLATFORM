'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function EagleEyePage() {
  const [stats, setStats] = useState<any>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [prospects, setProspects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signals' | 'prospects' | 'stats'>('signals')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/eagleeye/stats`).then(r => r.json()),
      fetch(`${API}/api/eagleeye/signals`).then(r => r.json()),
      fetch(`${API}/api/eagleeye/prospects`).then(r => r.json()),
    ])
      .then(([statsData, signalsData, prospectsData]) => {
        if (statsData.success) setStats(statsData.data)
        if (signalsData.success) {
          const list = signalsData.data?.signals || signalsData.data || []
          setSignals(Array.isArray(list) ? list : [])
        }
        if (prospectsData.success) {
          const list = prospectsData.data?.prospects || prospectsData.data || []
          setProspects(Array.isArray(list) ? list : [])
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const card = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 } as const
  const statusColor = (s: string) => s === 'hot' ? '#C44048' : s === 'warm' ? '#C4A048' : s === 'converted' ? '#2D6B3D' : '#7A9A82'

  const tabs = [
    { key: 'signals' as const, label: `Signals (${signals.length})` },
    { key: 'prospects' as const, label: `Prospects (${prospects.length})` },
    { key: 'stats' as const, label: 'Stats' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Eagle Eye — Business Development</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Deal sourcing, M&amp;A intelligence, outreach, pipeline tracking</p>

      {loading && <div style={{ color: '#7A9A82', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading Eagle Eye data...</div>}
      {error && <div style={{ color: '#C44048', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16 }}>Error: {error}</div>}

      {!loading && (
        <>
          {/* Stats bar */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total Signals', value: stats.total_signals ?? 0 },
                { label: 'Hot', value: stats.hot ?? 0, color: '#C44048' },
                { label: 'Warm', value: stats.warm ?? 0, color: '#C4A048' },
                { label: 'Converted', value: stats.converted ?? 0, color: '#2D6B3D' },
                { label: 'Prospects', value: stats.total_prospects ?? 0 },
                { label: 'Scouts', value: stats.total_scouts ?? 0 },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#7A9A82', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{kpi.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: kpi.color || '#C4A048', fontWeight: 700 }}>{kpi.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid rgba(196,160,72,0.1)', paddingBottom: 8 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                background: activeTab === t.key ? 'rgba(196,160,72,0.12)' : 'transparent',
                border: 'none', color: activeTab === t.key ? '#C4A048' : '#7A9A82',
                padding: '6px 14px', fontSize: 10, fontFamily: 'var(--font-space)',
                letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
                borderBottom: activeTab === t.key ? '2px solid #C4A048' : '2px solid transparent',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Signals tab */}
          {activeTab === 'signals' && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Intelligence Signals</h3>
              {signals.length === 0 ? (
                <div style={{ color: '#7A9A82', fontSize: 13, textAlign: 'center', padding: 24 }}>No signals yet. Scouts will populate this as they run.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {signals.map((s: any, i: number) => (
                    <div key={s.id || i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.08)', borderRadius: 6, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600 }}>
                            {s.raw_data?.entity_name || s.raw_data?.name || s.keyword || `Signal ${i + 1}`}
                          </span>
                          {s.keyword && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', marginLeft: 8 }}>{s.keyword}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {s.score != null && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C4A048', fontWeight: 700 }}>{s.score}</span>
                          )}
                          <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: statusColor(s.status), background: `${statusColor(s.status)}22`, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {s.status || 'new'}
                          </span>
                        </div>
                      </div>
                      {s.summary && <div style={{ color: '#7A9A82', fontSize: 11, fontFamily: 'var(--font-space)', lineHeight: 1.5 }}>{s.summary}</div>}
                      {s.source && <div style={{ color: '#2D4A35', fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 4 }}>Source: {s.source}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prospects tab */}
          {activeTab === 'prospects' && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Prospects</h3>
              {prospects.length === 0 ? (
                <div style={{ color: '#7A9A82', fontSize: 13, textAlign: 'center', padding: 24 }}>No prospects yet. High-confidence signals auto-promote here.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {prospects.map((p: any, i: number) => (
                    <div key={p.id || i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600, marginBottom: 4 }}>
                        {p.raw_data?.entity_name || p.raw_data?.name || p.keyword || `Prospect ${i + 1}`}
                      </div>
                      {p.sector && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82', marginBottom: 4 }}>{p.sector}</div>}
                      {p.score != null && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#C4A048', fontWeight: 700 }}>Score: {p.score}</div>}
                      {p.summary && <div style={{ color: '#7A9A82', fontSize: 11, fontFamily: 'var(--font-space)', lineHeight: 1.5, marginTop: 6 }}>{p.summary}</div>}
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: statusColor(p.status), background: `${statusColor(p.status)}22`, padding: '2px 6px', borderRadius: 2, marginTop: 8, display: 'inline-block', textTransform: 'uppercase' }}>
                        {p.status || 'prospect'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats tab */}
          {activeTab === 'stats' && stats && (
            <div style={card}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Eagle Eye Intelligence Stats</h3>
              <pre style={{ color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}
