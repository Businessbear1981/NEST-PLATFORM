'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/* ── Brand tokens ── */
const C = {
  void: '#030A06',
  forest: '#0D2218',
  gold: '#C4A048',
  goldHi: '#E8C87A',
  sage: '#7A9A82',
  cream: '#EDE8DC',
  moss: '#2D4A35',
  navy: '#060E1A',
};

const F = {
  heading: 'var(--font-cormorant), "Cormorant Garamond", serif',
  body: 'var(--font-space), "Space Grotesk", sans-serif',
  mono: 'var(--font-mono), "IBM Plex Mono", monospace',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'banker' || user.role === 'analyst' || user.role === 'compliance') {
        router.replace('/admin/deals');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: C.void,
    border: `1px solid ${C.moss}`,
    color: C.cream,
    fontFamily: F.body,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: C.sage,
    marginBottom: 6,
  };

  return (
    <div
      style={{
        background: C.void,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.body,
        color: C.cream,
        padding: 20,
      }}
    >
      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: F.heading,
            fontSize: 64,
            fontWeight: 300,
            letterSpacing: 14,
            margin: 0,
            color: C.cream,
          }}
        >
          N<span style={{ color: C.gold }}>E</span>ST
        </h1>
        <p
          style={{
            fontFamily: F.heading,
            fontStyle: 'italic',
            fontSize: 14,
            color: C.sage,
            marginTop: 8,
            letterSpacing: 1,
          }}
        >
          Built by bankers who had the pen.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={onSubmit}
        style={{
          background: C.forest,
          border: `1px solid ${C.moss}`,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h2
          style={{
            fontFamily: F.heading,
            fontSize: 24,
            fontWeight: 400,
            margin: '0 0 8px',
            color: C.cream,
          }}
        >
          Client Login
        </h2>
        <p style={{ fontSize: 13, color: C.sage, margin: '0 0 28px' }}>
          Access the fund, investor book, or admin studio.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@firm.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
          />
        </div>

        {error && (
          <div
            style={{
              background: '#2a0a0a',
              border: '1px solid #6b2222',
              color: '#f08080',
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? C.moss : C.gold,
            color: C.void,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: F.body,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Signing in\u2026' : 'Sign In'}
        </button>

        <p style={{ fontSize: 12, color: C.sage, marginTop: 18, textAlign: 'center' }}>
          New client?{' '}
          <a href="/register" style={{ color: C.gold, textDecoration: 'none' }}>
            Request access
          </a>
        </p>
      </form>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: 10,
          color: `${C.sage}88`,
          maxWidth: 400,
          textAlign: 'center',
          marginTop: 40,
          lineHeight: 1.6,
        }}
      >
        Access is restricted to authorized clients and accredited investors.
        Unauthorized access is prohibited. By signing in you agree to our
        terms of service and privacy policy. &copy; {new Date().getFullYear()} Arden Edge Capital LLC.
      </p>
    </div>
  );
}
