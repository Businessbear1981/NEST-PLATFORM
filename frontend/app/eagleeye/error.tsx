'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[NEST] EagleEye error:', error) }, [error])
  return (
    <div style={{ padding: '32px', background: '#0D2218', border: '1px solid #3D2B2B', borderRadius: '8px', color: '#EDE8DC' }}>
      <div style={{ color: '#EF4444', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '8px' }}>
        EAGLEEYE — ERROR
      </div>
      <div style={{ marginBottom: '16px' }}>{error.message || 'Module failed to load'}</div>
      {error.digest && <div style={{ color: '#7A9A82', fontSize: '11px', marginBottom: '16px' }}>ID: {error.digest}</div>}
      <button onClick={reset} style={{ padding: '6px 16px', background: '#C4A048', color: '#030A06', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
        Retry
      </button>
    </div>
  )
}
