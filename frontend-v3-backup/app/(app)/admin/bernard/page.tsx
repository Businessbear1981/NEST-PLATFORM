'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function BernardPage() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'ask' | 'route' | 'tutorial'>('ask')

  async function submit() {
    if (!question.trim()) return
    setLoading(true)
    try {
      const endpoint = mode === 'ask' ? '/api/desks/bernard/ask'
        : mode === 'route' ? '/api/desks/bernard/route'
        : '/api/desks/bernard/tutorial'
      const bodyKey = mode === 'ask' ? 'question' : mode === 'route' ? 'task' : 'decision_point'
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: question }),
      })
      const data = await res.json()
      if (data.success) setResponse(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Bernard — CEO / Platform Orchestrator</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Answers any question across all 14 desks. Routes tasks. Provides tutorial/gate/wrap-up at decision points.</p>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ask', 'route', 'tutorial'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? 'rgba(196,160,72,0.12)' : 'transparent',
            border: '1px solid rgba(196,160,72,0.2)',
            color: mode === m ? '#C4A048' : '#7A9A82',
            padding: '6px 16px',
            borderRadius: 4,
            fontSize: 10,
            fontFamily: 'var(--font-space)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            {m === 'ask' ? 'Ask Bernard' : m === 'route' ? 'Route Task' : 'Tutorial / Gate'}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={
            mode === 'ask' ? 'Ask anything about NEST operations, deals, or bond mechanics...'
            : mode === 'route' ? 'Describe a task to route to the right desk...'
            : 'Describe a decision point requiring tutorial/gate/wrap-up...'
          }
          style={{
            flex: 1,
            background: '#0D2218',
            border: '1px solid rgba(196,160,72,0.2)',
            color: '#EDE8DC',
            padding: '10px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'var(--font-space)',
          }}
        />
        <button onClick={submit} disabled={loading} style={{
          background: 'linear-gradient(135deg, #C4A048, #E8C87A)',
          color: '#030A06',
          border: 'none',
          padding: '10px 24px',
          borderRadius: 6,
          fontSize: 11,
          fontFamily: 'var(--font-space)',
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div style={{ background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048' }}>Bernard</span>
            {response.routed_to && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D6B3D', background: 'rgba(45,107,61,0.15)', padding: '2px 8px', borderRadius: 3 }}>
                Routed: {response.routed_to}
              </span>
            )}
            {response.requires_acknowledgment && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', background: 'rgba(196,160,72,0.1)', padding: '2px 8px', borderRadius: 3 }}>
                Gate — Requires Acknowledgment
              </span>
            )}
          </div>
          <div style={{ color: '#EDE8DC', fontSize: 13, lineHeight: 1.7, fontFamily: 'var(--font-space)', whiteSpace: 'pre-wrap' }}>
            {response.response || response.tutorial || response.routing || JSON.stringify(response, null, 2)}
          </div>
        </div>
      )}
    </div>
  )
}
