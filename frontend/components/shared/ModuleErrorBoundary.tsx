'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
  moduleName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ModuleErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    // Log to console in dev; in prod this would go to error tracking
    console.error(`[NEST] ${this.props.moduleName || 'Module'} error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '32px',
          background: '#0D2218',
          border: '1px solid #3D2B2B',
          borderRadius: '8px',
          color: '#EDE8DC',
          fontFamily: 'monospace',
          margin: '16px 0'
        }}>
          <div style={{ color: '#EF4444', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '8px' }}>
            MODULE ERROR — {this.props.moduleName?.toUpperCase() || 'UNKNOWN MODULE'}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px', color: '#EDE8DC' }}>
            {this.state.error?.message || 'This module failed to load'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              padding: '6px 16px',
              background: '#C4A048',
              color: '#030A06',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ModuleErrorBoundary
