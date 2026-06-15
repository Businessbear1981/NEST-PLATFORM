'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AIProfPanelProps {
  topic: string;
  examCode: string;
  question?: string;
  userAnswer?: string;
  correctAnswer?: string;
  onClose: () => void;
}

type Mode = 'EXPLAIN' | 'DRILL' | 'MENTOR';

// Minimal markdown renderer — handles bold, headers, bullets, code spans
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} style={{ margin: '8px 0 8px 16px', padding: 0, listStyle: 'disc' }}>
        {listBuffer.map((item, i) => (
          <li key={i} style={{ color: '#EDE8DC', marginBottom: 4, lineHeight: 1.6 }}>
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const renderInline = (str: string): React.ReactNode[] => {
    // Handle **bold** and `code`
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) {
        parts.push(<span key={idx++}>{str.slice(last, match.index)}</span>);
      }
      const raw = match[0];
      if (raw.startsWith('**')) {
        parts.push(
          <strong key={idx++} style={{ color: '#E8C87A', fontWeight: 700 }}>
            {raw.slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(
          <code
            key={idx++}
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              background: '#1E4A2E',
              color: '#C4A048',
              padding: '1px 5px',
              borderRadius: 3,
              fontSize: '0.85em',
            }}
          >
            {raw.slice(1, -1)}
          </code>
        );
      }
      last = match.index + raw.length;
    }
    if (last < str.length) parts.push(<span key={idx++}>{str.slice(last)}</span>);
    return parts;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`);
      nodes.push(
        <h3
          key={i}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: '#E8C87A',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '14px 0 6px',
          }}
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(`list-${i}`);
      nodes.push(
        <h2
          key={i}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: '#E8C87A',
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: '16px 0 8px',
          }}
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList(`list-${i}`);
      nodes.push(
        <h1
          key={i}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: '#C4A048',
            fontSize: '1.45rem',
            fontWeight: 700,
            margin: '18px 0 10px',
          }}
        >
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushList(`list-${i}`);
      nodes.push(<br key={i} />);
    } else {
      flushList(`list-${i}`);
      nodes.push(
        <p key={i} style={{ color: '#EDE8DC', lineHeight: 1.7, margin: '6px 0' }}>
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList('list-end');
  return nodes;
}

export default function AIProfPanel({
  topic,
  examCode,
  question,
  userAnswer,
  correctAnswer,
  onClose,
}: AIProfPanelProps) {
  const [mode, setMode] = useState<Mode>('EXPLAIN');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [hasResponse, setHasResponse] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [response]);

  const callProf = useCallback(
    async (selectedMode: Mode) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError('');
      setResponse('');
      setTokenCount(null);
      setHasResponse(false);

      try {
        const res = await fetch('/api/academy/ai-prof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            examCode,
            mode: selectedMode,
            question,
            userAnswer,
            correctAnswer,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        // Try streaming first
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });

              // Handle SSE format
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  if (data === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(data);
                    const delta =
                      parsed.choices?.[0]?.delta?.content ||
                      parsed.content ||
                      parsed.text ||
                      '';
                    accumulated += delta;
                    setResponse(accumulated);
                    if (parsed.usage?.total_tokens) {
                      setTokenCount(parsed.usage.total_tokens);
                    }
                  } catch {
                    // Plain text chunk
                    accumulated += data;
                    setResponse(accumulated);
                  }
                }
              }
            }
            setHasResponse(true);
          }
        } else {
          // Non-streaming JSON fallback
          const data = await res.json();
          const text =
            data.response || data.content || data.message || data.text || JSON.stringify(data);
          setResponse(text);
          if (data.tokenCount || data.usage?.total_tokens) {
            setTokenCount(data.tokenCount ?? data.usage?.total_tokens);
          }
          setHasResponse(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    },
    [topic, examCode, question, userAnswer, correctAnswer]
  );

  // Auto-fire on mount
  useEffect(() => {
    callProf(mode);
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    callProf(m);
  };

  const modes: Mode[] = question ? ['EXPLAIN', 'DRILL', 'MENTOR'] : ['EXPLAIN', 'DRILL'];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 10, 6, 0.72)',
          zIndex: 49,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(520px, 100vw)',
          background: '#0D2218',
          borderLeft: '1px solid #1E4A2E',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes nestPulse {
            0%, 100% { opacity: 0.4; }
            50%       { opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid #1E4A2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#030A06',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Gold accent dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#C4A048',
                boxShadow: '0 0 8px #C4A048',
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#E8C87A',
                  letterSpacing: '0.01em',
                }}
              >
                Morgan
              </span>
              <span
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '0.75rem',
                  color: '#7A9A82',
                  marginLeft: 8,
                }}
              >
                · AI Professor
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: '#C4A048',
                background: '#1E4A2E',
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.08em',
              }}
            >
              {examCode}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #1E4A2E',
                borderRadius: 6,
                color: '#7A9A82',
                cursor: 'pointer',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#C4A048';
                (e.currentTarget as HTMLButtonElement).style.color = '#E8C87A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1E4A2E';
                (e.currentTarget as HTMLButtonElement).style.color = '#7A9A82';
              }}
              aria-label="Close AI Professor panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Topic label */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid #1E4A2E',
            background: '#030A06',
          }}
        >
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.8rem',
              color: '#7A9A82',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Topic:
          </span>{' '}
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.85rem',
              color: '#EDE8DC',
            }}
          >
            {topic}
          </span>
        </div>

        {/* Mode buttons */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid #1E4A2E',
          }}
        >
          {modes.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                disabled={loading}
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: `1px solid ${active ? '#C4A048' : '#2D6B3D'}`,
                  background: active ? '#1E4A2E' : 'transparent',
                  color: active ? '#E8C87A' : '#7A9A82',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!active && !loading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#7A9A82';
                    (e.currentTarget as HTMLButtonElement).style.color = '#EDE8DC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#2D6B3D';
                    (e.currentTarget as HTMLButtonElement).style.color = '#7A9A82';
                  }
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Response area */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1E4A2E #030A06',
          }}
        >
          {loading && !response && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#C4A048',
                      animation: `nestPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '0.8rem',
                  color: '#7A9A82',
                }}
              >
                Morgan is thinking…
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                border: '1px solid #8B2020',
                borderRadius: 8,
                padding: '14px 16px',
                background: 'rgba(139,32,32,0.12)',
              }}
            >
              <p
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: '#F08080',
                  fontSize: '0.85rem',
                  margin: 0,
                }}
              >
                ⚠ {error}
              </p>
            </div>
          )}

          {response && (
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.7,
              }}
            >
              {renderMarkdown(response)}
              {loading && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 14,
                    background: '#C4A048',
                    marginLeft: 2,
                    borderRadius: 1,
                    animation: 'nestPulse 0.8s ease-in-out infinite',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #1E4A2E',
            background: '#030A06',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.65rem',
              color: '#2D6B3D',
            }}
          >
            {tokenCount !== null ? `${tokenCount.toLocaleString()} tokens` : '—'}
          </span>

          {hasResponse && !loading && (
            <button
              onClick={() => callProf(mode)}
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                padding: '5px 14px',
                borderRadius: 6,
                border: '1px solid #2D6B3D',
                background: 'transparent',
                color: '#7A9A82',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#C4A048';
                (e.currentTarget as HTMLButtonElement).style.color = '#E8C87A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2D6B3D';
                (e.currentTarget as HTMLButtonElement).style.color = '#7A9A82';
              }}
            >
              ↺ REGENERATE
            </button>
          )}
        </div>
      </div>
    </>
  );
}
