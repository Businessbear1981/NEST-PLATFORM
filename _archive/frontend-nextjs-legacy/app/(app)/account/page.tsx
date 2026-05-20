'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('nest_user') || '{}')) } catch { router.push('/login') }
  }, [router])

  const roleColors: Record<string, string> = { admin: '#C4A048', client: '#7A9A82', investor: '#60a5fa' }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.14em', textTransform: 'uppercase' }}>Account Settings</div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, color: '#EDE8DC', fontWeight: 400, margin: '4px 0 24px' }}>Profile</h1>

      <div className="nest-card" style={{ marginBottom: 16 }}>
        <div className="data-row"><span className="data-label">Name</span><span className="data-value">{user?.name || '—'}</span></div>
        <div className="data-row"><span className="data-label">Email</span><span className="data-value">{user?.email || '—'}</span></div>
        <div className="data-row"><span className="data-label">Role</span><span style={{ background: `rgba(${user?.role === 'admin' ? '196,160,72' : '122,154,130'},0.15)`, color: roleColors[user?.role] || '#7A9A82', padding: '2px 10px', borderRadius: 3, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{user?.role || '—'}</span></div>
      </div>

      <div className="nest-card">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 16 }}>Change Password</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#7A9A82', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Current Password</label>
          <input type="password" style={{ width: '100%', background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 12px', color: '#EDE8DC', fontSize: 12, fontFamily: 'var(--font-space)' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#7A9A82', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>New Password</label>
          <input type="password" style={{ width: '100%', background: 'rgba(3,10,6,0.8)', border: '0.5px solid rgba(196,160,72,0.2)', borderRadius: 4, padding: '8px 12px', color: '#EDE8DC', fontSize: 12, fontFamily: 'var(--font-space)' }} />
        </div>
        <button className="btn-gold">Update Password</button>
      </div>
    </div>
  )
}
