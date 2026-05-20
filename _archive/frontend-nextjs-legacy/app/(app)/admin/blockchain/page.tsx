'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ChainStats {
  total_transactions: number
  total_deals: number
  total_refi_cycles: number
  total_fees_captured_usd: number
  total_equity_positions: number
  latest_block: number
  mode: string
  by_type: Record<string, number>
}

interface ChainEvent {
  tx_hash: string
  tx_type: string
  deal_id: string
  timestamp: string
  block_number: number
  mode: string
}

export default function BlockchainAdmin() {
  const [stats, setStats] = useState<ChainStats | null>(null)
  const [events, setEvents] = useState<ChainEvent[]>([])

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/api/blockchain/stats`).then(r => r.json()),
      fetch(`${API}/api/blockchain/events?limit=50`).then(r => r.json()),
    ]).then(([s, e]) => {
      if (s.status === 'fulfilled') setStats(s.value.data ?? s.value)
      if (e.status === 'fulfilled') {
        const ev = e.value.data ?? e.value
        setEvents(Array.isArray(ev) ? ev : [])
      }
    })
  }, [])

  const fmtUSD = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${n.toLocaleString()}`

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Blockchain Ledger</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <span className={stats?.mode === 'live' ? 'tag-green' : 'tag-gold'}>
          {stats?.mode?.toUpperCase() || 'SIMULATION'}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: '#2D4A35' }}>
          Block #{stats?.latest_block || 0}
        </span>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Txns', value: stats.total_transactions },
            { label: 'Deals Recorded', value: stats.total_deals },
            { label: 'Refi Cycles', value: stats.total_refi_cycles },
            { label: 'Fees Captured', value: fmtUSD(stats.total_fees_captured_usd) },
            { label: 'Equity Positions', value: stats.total_equity_positions },
          ].map(s => (
            <div key={s.label} className="nest-kpi">
              <div className="nest-kpi-label">{s.label}</div>
              <div className="nest-kpi-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Event type breakdown */}
      {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
        <div className="nest-card" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#7A9A82', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Event Types</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(stats.by_type).map(([type, count]) => (
              <span key={type} className="tag-gold" style={{ fontSize: 11 }}>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event log */}
      <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 16 }}>Event Log</h2>
      <div className="nest-card" style={{ padding: 0, overflow: 'hidden' }}>
        {events.length === 0 ? (
          <div style={{ padding: 20, color: '#7A9A82', fontSize: 13 }}>No events recorded yet.</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="data-row" style={{ padding: '10px 18px' }}>
              <span className={ev.tx_type.includes('CALL') || ev.tx_type.includes('REFI') ? 'tag-gold' : ev.tx_type.includes('ALERT') ? 'tag-red' : 'tag-green'} style={{ marginRight: 12 }}>
                {ev.tx_type}
              </span>
              <span className="data-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ev.deal_id}</span>
              <span className="font-mono" style={{ fontSize: 10, color: '#2D4A35', marginRight: 12 }}>{ev.tx_hash.slice(0, 14)}...</span>
              <span className="font-mono" style={{ fontSize: 10, color: '#2D4A35' }}>#{ev.block_number}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
