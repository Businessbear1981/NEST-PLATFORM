'use client'

interface LoadingShellProps {
  rows?: number
  label?: string
}

export function LoadingShell({ rows = 3, label }: LoadingShellProps) {
  return (
    <div style={{ padding: '24px', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
      {label && (
        <div style={{
          color: '#7A9A82', fontSize: '11px', letterSpacing: '0.1em',
          marginBottom: '16px', textTransform: 'uppercase'
        }}>
          {label}
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: i === 0 ? '24px' : '16px',
          background: '#1E4A2E',
          borderRadius: '4px',
          marginBottom: '12px',
          width: i === 0 ? '60%' : i % 2 === 0 ? '85%' : '75%',
          opacity: 0.6
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}

export default LoadingShell
