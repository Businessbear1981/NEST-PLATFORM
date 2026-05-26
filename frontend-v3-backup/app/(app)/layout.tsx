'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthProvider } from '@/lib/AuthContext'

/* ── Desk-Based Navigation per Operating Framework v1 ─────── */

type NavSection = {
  label: string
  items: { label: string; href: string }[]
}

const DESK_NAV: NavSection[] = [
  {
    label: 'ORCA',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Bernard', href: '/admin/bernard' },
      { label: 'Firm Review', href: '/admin/firm-review' },
    ],
  },
  {
    label: 'BOND DESK',
    items: [
      { label: 'Deal Entry', href: '/admin/bond-desk' },
      { label: 'Deals', href: '/admin/deals' },
      { label: 'Bond Intel', href: '/admin/bond-intel' },
      { label: 'Modeling', href: '/admin/modeling' },
    ],
  },
  {
    label: 'CREDIT',
    items: [
      { label: 'Underwriting', href: '/admin/credit' },
      { label: 'Risk / Sentinel', href: '/admin/risk' },
    ],
  },
  {
    label: 'RATING',
    items: [
      { label: 'Mirror Agents', href: '/admin/rating' },
    ],
  },
  {
    label: 'STRUCTURING',
    items: [
      { label: 'Studio', href: '/admin/structuring' },
    ],
  },
  {
    label: 'DOCUMENTS',
    items: [
      { label: 'Vault', href: '/docs' },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { label: 'NightVision', href: '/admin/compliance' },
      { label: 'Forensic', href: '/admin/forensic' },
    ],
  },
  {
    label: 'ENHANCEMENT',
    items: [
      { label: 'Surety', href: '/admin/surety' },
    ],
  },
  {
    label: 'PLACEMENT',
    items: [
      { label: 'Hawkeye', href: '/admin/placement' },
      { label: 'Lenders', href: '/admin/lenders' },
    ],
  },
  {
    label: 'CONSTRUCTION',
    items: [
      { label: 'Draws & Tracker', href: '/admin/construction' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Admin', href: '/admin/operations' },
      { label: 'Blockchain', href: '/admin/blockchain' },
    ],
  },
  {
    label: 'SURVEILLANCE',
    items: [
      { label: 'Refunding', href: '/admin/surveillance' },
    ],
  },
  {
    label: 'EAGLE EYE',
    items: [
      { label: 'Scout', href: '/admin/eagleeye' },
      { label: 'M&A Intel', href: '/admin/ma' },
      { label: 'Marketing', href: '/admin/marketing' },
    ],
  },
  {
    label: 'TREASURY',
    items: [
      { label: 'Fund', href: '/fund' },
      { label: 'Ramp / Cards', href: '/admin/treasury' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'EMMA', href: '/admin/emma' },
      { label: 'AI Tools', href: '/admin/ai-tools' },
      { label: 'Agents', href: '/agents/vector' },
    ],
  },
]

const NAV_CLIENT = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Fund', href: '/fund' },
  { label: 'Docs', href: '/docs' },
  { label: 'Account', href: '/account' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState('client')
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nest_token')
    if (!token) { router.push('/login'); return }
    try {
      const user = JSON.parse(localStorage.getItem('nest_user') || '{}')
      setRole(user.role || 'client')
      setUserName(user.name || user.email || '')
    } catch { setRole('client') }
  }, [router])

  function logout() {
    localStorage.removeItem('nest_token')
    localStorage.removeItem('nest_user')
    router.push('/login')
  }

  const isAdmin = role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: '#030A06', display: 'flex' }}>
      {/* ── Sidebar (Admin only) ─────────────────────────── */}
      {isAdmin && (
        <aside style={{
          width: sidebarOpen ? 200 : 48,
          minHeight: '100vh',
          background: '#060E1A',
          borderRight: '1px solid rgba(196,160,72,0.12)',
          transition: 'width .2s',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 200,
        }}>
          {/* Logo */}
          <div style={{ padding: '16px 14px 8px', borderBottom: '1px solid rgba(196,160,72,0.1)' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: '#C4A048', letterSpacing: '.14em', fontWeight: 500 }}>NEST</span>
              {sidebarOpen && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase' }}>Advisors</span>}
            </Link>
          </div>

          {/* Toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '100%', background: 'none', border: 'none', color: '#7A9A82', cursor: 'pointer', padding: '6px 14px', textAlign: 'left', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {/* Desk Navigation */}
          {sidebarOpen && (
            <nav style={{ padding: '4px 0', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
              {DESK_NAV.map(section => (
                <div key={section.label} style={{ marginBottom: 2 }}>
                  <div style={{
                    padding: '6px 14px 3px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: '#C4A048',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}>
                    {section.label}
                  </div>
                  {section.items.map(item => {
                    const active = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'block',
                        padding: '4px 14px 4px 22px',
                        fontSize: 10,
                        color: active ? '#EDE8DC' : '#7A9A82',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-space)',
                        background: active ? 'rgba(196,160,72,0.08)' : 'transparent',
                        borderLeft: active ? '2px solid #C4A048' : '2px solid transparent',
                        transition: 'all .15s',
                      }}>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ))}

              {/* Tagline */}
              <div style={{
                padding: '16px 14px 8px',
                borderTop: '1px solid rgba(196,160,72,0.08)',
                marginTop: 8,
              }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 10, color: 'rgba(196,160,72,0.4)', fontStyle: 'italic' }}>
                  It&apos;s Time To Fly
                </span>
              </div>
            </nav>
          )}
        </aside>
      )}

      {/* ── Main Content ─────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: isAdmin ? (sidebarOpen ? 200 : 48) : 0, transition: 'margin-left .2s' }}>
        {/* Top Bar */}
        <nav style={{
          background: 'rgba(3,10,6,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(196,160,72,0.2)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isAdmin ? 'flex-end' : 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 44,
        }}>
          {/* Client nav (shown in top bar for non-admin) */}
          {!isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: '#C4A048', letterSpacing: '.14em', fontWeight: 500 }}>NEST</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#2D4A35', letterSpacing: '.1em', textTransform: 'uppercase' }}>Advisors</span>
              </Link>
              <div style={{ width: 1, height: 20, background: 'rgba(196,160,72,0.15)' }} />
              {NAV_CLIENT.map(n => (
                <Link key={n.href} href={n.href} style={{ fontSize: 10, color: pathname === n.href ? '#C4A048' : '#7A9A82', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-space)' }}>
                  {n.label}
                </Link>
              ))}
            </div>
          )}

          {/* User info + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D4A35' }}>{userName}</span>
            <span style={{ fontSize: 8, color: '#C4A048', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 6px', border: '1px solid rgba(196,160,72,0.2)', borderRadius: 2 }}>{role}</span>
            <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(196,160,72,0.15)', color: '#7A9A82', padding: '3px 10px', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: 'var(--font-space)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Logout
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <main style={{ padding: '24px 28px' }}>
          <AuthProvider>{children}</AuthProvider>
        </main>
      </div>
    </div>
  )
}
