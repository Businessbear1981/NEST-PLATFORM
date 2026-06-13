'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[NEST-PLATFORM] GlobalError:', error)
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, background: '#030A06', color: '#EDE8DC', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: 520, padding: 32, border: '1px solid #3D2B2B', borderRadius: 8, background: '#0D2218' }}>
          <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 8, letterSpacing: '0.1em' }}>
            NEST PLATFORM — CRITICAL ERROR
          </div>
          <div style={{ fontSize: 18, marginBottom: 16, fontFamily: 'Georgia, serif' }}>
            {error.message || 'An unexpected error occurred'}
          </div>
          {error.digest && (
            <div style={{ color: '#7A9A82', fontSize: 11, marginBottom: 16 }}>
              Digest: {error.digest}
            </div>
          )}
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              background: '#C4A048',
              color: '#030A06',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  )
}
