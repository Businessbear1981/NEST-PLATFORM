'use client'
import { AuthProvider } from '@/lib/AuthContext'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#030A06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AuthProvider>{children}</AuthProvider>
    </div>
  )
}
