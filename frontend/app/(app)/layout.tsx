'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthProvider } from '@/lib/AuthContext'

const NAV_CLIENT = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Fund', href: '/fund' },
  { label: 'Docs', href: '/docs' },
]
const NAV_ADMIN = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Deals', href: '/admin/deals' },
  { label: 'M&A', href: '/admin/ma' },
  { label: 'Lenders', href: '/admin/lenders' },
  { label: 'Monitor', href: '/admin/monitor' },
  { label: 'Bond Intel', href: '/admin/bond-intel' },
  { label: 'Forensic', href: '/admin/forensic' },
  { label: 'Chain', href: '/admin/blockchain' },
  { label: 'AI Tools', href: '/admin/ai-tools' },
  { label: 'Licensing', href: '/admin/licensing' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState('client')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('nest_token')
    if (!token) { router.push('/login'); return }
    try {
      const user = JSON.parse(localStorage.getItem('nest_user') || '{}')
      setRole(user.role || 'client')
      setUserName(user.name || user.email || '')
    } catch { setRole('client') }
  }, [router])

  const nav = role === 'admin' ? NAV_ADMIN : NAV_CLIENT

  function logout() {
    localStorage.removeItem('nest_token')
    localStorage.removeItem('nest_user')
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030A06' }}>
      <nav style={{ background: 'rgba(3,10,6,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(196,160,72,0.2)', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 20, color: '#C4A048', letterSpacing: '.14em', fontWeight: 500 }}>NEST</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase' }}>Advisors</span>
          </Link>
          <div style={{ width: 1, height: 24, background: 'rgba(196,160,72,0.15)' }} />
          {nav.map(n => (
            <Link key={n.href} href={n.href} style={{ fontSize: 10, color: pathname === n.href ? '#C4A048' : '#7A9A82', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-space)', transition: 'color .15s', borderBottom: pathname === n.href ? '1px solid #C4A048' : '1px solid transparent', paddingBottom: 2 }}>
              {n.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35' }}>{userName}</span>
          <span className="tag-gold" style={{ fontSize: 8 }}>{role}</span>
          <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(196,160,72,0.15)', color: '#7A9A82', padding: '4px 12px', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Logout</button>
        </div>
      </nav>
      <main style={{ padding: '28px 36px' }}>
        <AuthProvider>{children}</AuthProvider>
      </main>
    </div>
  )
}
