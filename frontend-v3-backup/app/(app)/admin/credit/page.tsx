'use client'
import { useState, useEffect } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || ''
export default function CreditDeskPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [policy, setPolicy] = useState<any>(null)
  useEffect(() => {
    fetch(`${API}/api/desks/credit_underwriting/agents`).then(r => r.json()).then(d => d.success && setAgents(d.data)).catch(() => {})
    fetch(`${API}/api/intel/credit-policy`).then(r => r.json()).then(d => d.success && setPolicy(d.data)).catch(() => {})
  }, [])
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: '#C4A048', marginBottom: 4 }}>Credit Underwriting Desk</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D4A35', marginBottom: 20 }}>Universal Credit Policy (Appendix F) — DSCR, LTV, LGD, obligor grading</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Agent Roster</h3>
          {agents.map((a: any, i: number) => (
            <div key={i} style={{ background: '#030A06', border: '1px solid rgba(196,160,72,0.1)', borderRadius: 6, padding: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#EDE8DC', fontWeight: 600 }}>{a.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7A9A82' }}>{a.role}</div>
              <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: a.agent_file ? '#2D6B3D' : '#7A9A82', background: a.agent_file ? 'rgba(45,107,61,0.15)' : 'rgba(122,154,130,0.1)', padding: '2px 6px', borderRadius: 2, marginTop: 4, display: 'inline-block' }}>{a.agent_file ? 'WIRED' : 'PENDING'}</span>
            </div>
          ))}
        </div>
        {policy && (
          <div style={{ background: '#0D2218', border: '1px solid rgba(196,160,72,0.15)', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: '#C4A048', marginBottom: 12 }}>Universal Credit Policy</h3>
            <div style={{ fontSize: 11, color: '#EDE8DC', lineHeight: 1.8 }}>
              <div><span style={{ color: '#7A9A82' }}>DSCR Floor:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#C4A048' }}>{policy.financial_standards?.min_dscr_universal_floor}x</span></div>
              <div><span style={{ color: '#7A9A82' }}>Debt Yield Floor:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#C4A048' }}>{(policy.financial_standards?.min_debt_yield_universal_floor * 100)}%</span></div>
              <div><span style={{ color: '#7A9A82' }}>Max Leverage:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#C4A048' }}>{(policy.financial_standards?.max_leverage_universal_ceiling * 100)}%</span></div>
              <div><span style={{ color: '#7A9A82' }}>Min Equity:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#C4A048' }}>{(policy.financial_standards?.min_equity_contribution_universal_floor * 100)}%</span></div>
              <div><span style={{ color: '#7A9A82' }}>DSRF Default:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#C4A048' }}>{policy.financial_standards?.dsrf_default}</span></div>
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(196,160,72,0.1)', paddingTop: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C4A048', marginBottom: 6 }}>EXCEPTION AUTHORITY</div>
                <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Minor:</span> <span style={{ fontSize: 10, color: '#EDE8DC' }}>{policy.exception_authority?.minor}</span></div>
                <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Moderate:</span> <span style={{ fontSize: 10, color: '#EDE8DC' }}>{policy.exception_authority?.moderate}</span></div>
                <div><span style={{ color: '#7A9A82', fontSize: 10 }}>Material:</span> <span style={{ fontSize: 10, color: '#EDE8DC' }}>{policy.exception_authority?.material}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
