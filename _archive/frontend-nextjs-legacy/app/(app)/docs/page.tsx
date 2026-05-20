'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DocsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/docs`, { headers: { Authorization: `Bearer ${localStorage.getItem('nest_token') || ''}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setDocs(d); else if (d.data) setDocs(d.data) }).catch(() => {})
  }, [])

  const kindColors: Record<string, string> = { rent_roll: '#C4A048', operating_statement: '#7A9A82', appraisal: '#60a5fa', environmental: '#2D6B3D', insurance: '#E8C87A', title: '#7A9A82', sponsor_bio: '#C4A048' }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Document Management</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 24px' }}>Document Vault</h1>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false) }}
        style={{ background: dragging ? 'rgba(196,160,72,0.08)' : '#0D2218', border: `2px dashed ${dragging ? '#C4A048' : 'rgba(196,160,72,0.2)'}`, borderRadius: 8, padding: '40px 24px', textAlign: 'center', marginBottom: 24, transition: 'all .2s', cursor: 'pointer' }}
      >
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 20, color: '#EDE8DC', marginBottom: 8 }}>Drop documents here</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35' }}>Rent rolls · Operating statements · Appraisals · Phase I ESA · Insurance · Title</div>
        <button className="btn-outline" style={{ marginTop: 16, fontSize: 9, padding: '6px 20px' }}>Browse Files</button>
      </div>

      {/* Document List */}
      <div className="nest-card">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Uploaded Documents · {docs.length} files</div>
        {docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#2D4A35', fontFamily: 'var(--font-mono)', fontSize: 11 }}>No documents uploaded yet. Upload files to begin the due diligence process.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(196,160,72,0.15)' }}>
                {['Filename', 'Kind', 'Deal', 'Uploaded', 'Size'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((d: any) => (
                <tr key={d.id} style={{ borderBottom: '0.5px solid rgba(196,160,72,0.06)' }}>
                  <td style={{ padding: '10px 6px', fontSize: 12, color: '#EDE8DC' }}>{d.filename}</td>
                  <td style={{ padding: '10px 6px' }}><span style={{ background: 'rgba(196,160,72,0.1)', color: kindColors[d.kind] || '#7A9A82', padding: '2px 8px', borderRadius: 3, fontSize: 9, fontFamily: 'var(--font-mono)' }}>{d.kind?.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7A9A82' }}>{d.deal_id?.slice(0, 8)}</td>
                  <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35' }}>{d.uploaded_at?.slice(0, 10)}</td>
                  <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C4A048' }}>{d.size_bytes ? `${(d.size_bytes / 1024).toFixed(0)}KB` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Readiness */}
      <div className="nest-card" style={{ marginTop: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Due Diligence Readiness</div>
        {['Rent Roll', 'Operating Statement', 'MAI Appraisal', 'Phase I ESA', 'GMP Contract', 'Title Commitment', 'Insurance Binder', 'Sponsor Financials'].map(item => {
          const present = docs.some((d: any) => d.kind === item.toLowerCase().replace(/ /g, '_'))
          return (
            <div key={item} className="data-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: present ? '#2D6B3D' : '#ef4444' }} />
                <span className="data-label">{item}</span>
              </div>
              <span className="data-value" style={{ color: present ? '#7A9A82' : '#ef4444', fontSize: 9 }}>{present ? 'RECEIVED' : 'MISSING'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
