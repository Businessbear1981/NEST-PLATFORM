'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function EMMAPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [templateSector, setTemplateSector] = useState('senior_living')
  const [template, setTemplate] = useState<any>(null)
  const [sectors, setSectors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'templates' | 'comps' | 'parse' | 'stats'>('search')
  const [osText, setOsText] = useState('')
  const [parseResult, setParseResult] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/emma/stats`).then(r => r.json()).then(d => d.success && setStats(d.data)).catch(() => {})
    fetch(`${API}/api/emma/templates/sectors`).then(r => r.json()).then(d => d.success && setSectors(d.data.sectors || [])).catch(() => {})
  }, [])

  async function search() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/emma/search?issuer=${encodeURIComponent(searchQuery)}&limit=20`)
      const data = await res.json()
      if (data.success) setSearchResults(data.data.results || [])
    } finally { setLoading(false) }
  }

  async function getTemplate() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/emma/templates?sector=${templateSector}`)
      const data = await res.json()
      if (data.success) setTemplate(data.data)
    } finally { setLoading(false) }
  }

  async function parseOS() {
    if (!osText.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/emma/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: osText }),
      })
      const data = await res.json()
      if (data.success) setParseResult(data.data)
    } finally { setLoading(false) }
  }

  const tabs = [
    { key: 'search' as const, label: 'Search EMMA' },
    { key: 'templates' as const, label: 'Templates' },
    { key: 'parse' as const, label: 'Parse OS' },
    { key: 'stats' as const, label: 'Database' },
  ]

  const cardStyle = { background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20, marginBottom: 16 }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>EMMA Intelligence Layer</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Electronic Municipal Market Access — Every muni bond ever issued, structured, rated, insured, and funded</p>

      {/* Tab Bar */}
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

      {activeTab === 'search' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search by issuer name, CUSIP, or sector..."
              style={{ flex: 1, background: '#030A06', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-space)' }}
            />
            <button onClick={search} disabled={loading} style={{ background: '#C4A048', color: '#030A06', border: 'none', padding: '8px 20px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-space)', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? '...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div>{searchResults.map((r: any, i: number) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(196,160,72,0.06)', fontSize: 12, color: '#EDE8DC' }}>
                {JSON.stringify(r).slice(0, 200)}
              </div>
            ))}</div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <select value={templateSector} onChange={e => setTemplateSector(e.target.value)} style={{ flex: 1, background: '#030A06', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '8px 12px', borderRadius: 4, fontSize: 13 }}>
              {sectors.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <button onClick={getTemplate} disabled={loading} style={{ background: '#C4A048', color: '#030A06', border: 'none', padding: '8px 20px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-space)', fontWeight: 600, cursor: 'pointer' }}>
              Generate Template
            </button>
          </div>
          {template && (
            <pre style={{ color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {JSON.stringify(template, null, 2)}
            </pre>
          )}
        </div>
      )}

      {activeTab === 'parse' && (
        <div style={cardStyle}>
          <p style={{ color: '#7A9A82', fontSize: 11, marginBottom: 12 }}>Paste Official Statement text to extract structured bond profile (par, coupon, maturity, covenants, reserves, enhancement, rating, counterparties)</p>
          <textarea value={osText} onChange={e => setOsText(e.target.value)} rows={12}
            placeholder="Paste Official Statement text here..."
            style={{ width: '100%', background: '#030A06', border: '1px solid rgba(196,160,72,0.2)', color: '#EDE8DC', padding: '12px', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)', resize: 'vertical' }}
          />
          <button onClick={parseOS} disabled={loading || !osText.trim()} style={{ marginTop: 12, background: '#C4A048', color: '#030A06', border: 'none', padding: '10px 24px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-space)', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Parsing with Claude AI...' : 'Parse Official Statement'}
          </button>
          {parseResult && (
            <pre style={{ marginTop: 16, color: '#EDE8DC', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', lineHeight: 1.6, background: '#030A06', padding: 16, borderRadius: 6 }}>
              {JSON.stringify(parseResult, null, 2)}
            </pre>
          )}
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Parsed Bond Database</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Total Parsed</span><br/><span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)', fontSize: 20 }}>{stats.total_parsed}</span></div>
            <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Valid</span><br/><span style={{ color: '#2D6B3D', fontFamily: 'var(--font-mono)', fontSize: 20 }}>{stats.valid_parsed}</span></div>
            <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Errors</span><br/><span style={{ color: '#C44048', fontFamily: 'var(--font-mono)', fontSize: 20 }}>{stats.errors}</span></div>
          </div>
          {Object.keys(stats.by_sector || {}).length > 0 && (
            <div>
              <h4 style={{ color: '#7A9A82', fontSize: 10, marginBottom: 8 }}>BY SECTOR</h4>
              {Object.entries(stats.by_sector).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
                  <span style={{ color: '#EDE8DC' }}>{k}</span>
                  <span style={{ color: '#C4A048', fontFamily: 'var(--font-mono)' }}>{v as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
