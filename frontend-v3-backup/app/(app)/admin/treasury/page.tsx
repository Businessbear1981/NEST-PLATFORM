'use client'
import { useState, useEffect } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || ''
export default function DeskPage() {
  const [agents, setAgents] = useState<any[]>([])
  useEffect(() => { fetch(`${API}/api/desks/treasury/agents`).then(r => r.json()).then(d => d.success && setAgents(d.data)).catch(() => {}) }, [])
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Treasury Desk</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Ramp P-card program, construction draws, soft costs, T&E, 1.5% rebate</p>
      <div style={{ background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Agent Roster</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {agents.map((a: any, i: number) => (
            <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: 12 }}>
              <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82' }}>{a.role}</div>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: a.agent_file ? '#2D6B3D' : '#7A9A82', background: a.agent_file ? 'rgba(45,107,61,0.15)' : 'rgba(122,154,130,0.1)', padding: '2px 6px', borderRadius: 2, marginTop: 6, display: 'inline-block' }}>{a.agent_file ? 'WIRED' : 'PENDING'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
